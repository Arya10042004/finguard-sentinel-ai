import os
import joblib
import pandas as pd


def assign_risk_level(score):
    if score >= 75:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


def safe_float(value, default=0):
    try:
        if pd.isna(value):
            return default
        return float(value)
    except:
        return default


def generate_risk_reasons(customer):
    reasons = []

    if customer.get("kyc_status") in ["Missing", "Incomplete", "Expired"]:
        reasons.append("Customer KYC status is incomplete, missing, or expired")

    if customer.get("document_status") in ["Missing", "Expired"]:
        reasons.append("Customer compliance document is missing or expired")

    if customer.get("risk_flag") != "No Risk Flag":
        reasons.append("Customer has AML/KYC risk flag: " + str(customer.get("risk_flag")))

    if customer.get("source_of_funds") in ["Unknown", "Cash Deposits", "Missing"]:
        reasons.append("Customer source of funds is unclear or cash-heavy")

    if safe_float(customer.get("aml_score")) >= 0.70:
        reasons.append("Customer AML score is high")

    if safe_float(customer.get("high_risk_country_transfers")) > 0:
        reasons.append("Customer has transfers to high-risk countries")

    if safe_float(customer.get("crm_risk_signal_count")) > 0:
        reasons.append("CRM notes contain suspicious customer behavior signals")

    if safe_float(customer.get("serious_audit_event_count")) > 0:
        reasons.append("Serious audit events found for this customer")

    if safe_float(customer.get("total_swift_amount")) > 500000:
        reasons.append("Customer has high total SWIFT transfer exposure")

    if customer.get("ml_anomaly_status") == "ANOMALY":
        reasons.append("ML anomaly model detected unusual customer behavior")

    if len(reasons) == 0:
        reasons.append("No major risk indicators found")

    return reasons


def calculate_rule_based_risk(customer):
    score = 0

    if customer.get("kyc_status") in ["Missing", "Incomplete", "Expired"]:
        score += 15

    if customer.get("document_status") in ["Missing", "Expired"]:
        score += 15

    if customer.get("risk_flag") != "No Risk Flag":
        score += 20

    if customer.get("source_of_funds") in ["Unknown", "Cash Deposits", "Missing"]:
        score += 15

    if safe_float(customer.get("aml_score")) >= 0.70:
        score += 15

    score += safe_float(customer.get("high_risk_country_transfers")) * 8
    score += safe_float(customer.get("crm_risk_signal_count")) * 5
    score += safe_float(customer.get("serious_audit_event_count")) * 5

    if safe_float(customer.get("total_swift_amount")) > 500000:
        score += 10

    if score > 100:
        score = 100

    return round(score, 2)


def calculate_ml_anomaly_for_customer(customer):
    model_path = "ai-engine/models/isolation_forest_model.pkl"
    scaler_path = "ai-engine/models/anomaly_scaler.pkl"
    features_path = "ai-engine/models/anomaly_features.pkl"

    if not os.path.exists(model_path):
        return {
            "ml_anomaly_status": "MODEL_NOT_FOUND",
            "ml_anomaly_score": 0,
            "ml_anomaly_prediction": 0
        }

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_columns = joblib.load(features_path)

    values = []

    for column in feature_columns:
        values.append(safe_float(customer.get(column)))

    input_df = pd.DataFrame([values], columns=feature_columns)

    scaled_input = scaler.transform(input_df)

    prediction = model.predict(scaled_input)[0]
    anomaly_score = model.decision_function(scaled_input)[0]

    status = "ANOMALY" if prediction == -1 else "NORMAL"

    return {
        "ml_anomaly_status": status,
        "ml_anomaly_score": round(float(anomaly_score), 4),
        "ml_anomaly_prediction": int(prediction)
    }


def calculate_hybrid_risk(customer):
    rule_score = calculate_rule_based_risk(customer)

    ml_result = calculate_ml_anomaly_for_customer(customer)

    ml_boost = 0

    if ml_result["ml_anomaly_status"] == "ANOMALY":
        ml_boost = 15

    final_score = rule_score + ml_boost

    if final_score > 100:
        final_score = 100

    customer["ml_anomaly_status"] = ml_result["ml_anomaly_status"]
    customer["ml_anomaly_score"] = ml_result["ml_anomaly_score"]
    customer["ml_anomaly_prediction"] = ml_result["ml_anomaly_prediction"]

    reasons = generate_risk_reasons(customer)

    return {
        "rule_based_score": rule_score,
        "ml_anomaly_status": ml_result["ml_anomaly_status"],
        "ml_anomaly_score": ml_result["ml_anomaly_score"],
        "hybrid_risk_score": round(final_score, 2),
        "hybrid_risk_level": assign_risk_level(final_score),
        "risk_reasons": reasons
    }


def analyze_customer_risk(customer_id):
    input_path = "data/processed/customer_risk_ml_scored.csv"

    if not os.path.exists(input_path):
        input_path = "data/processed/customer_risk_scored.csv"

    if not os.path.exists(input_path):
        input_path = "data/processed/unified_customer_risk_profile.csv"

    df = pd.read_csv(input_path)

    customer_records = df[df["normalized_customer_id"] == customer_id]

    if customer_records.empty:
        return {
            "status": "not_found",
            "message": "Customer not found"
        }

    customer = customer_records.iloc[0].to_dict()

    hybrid_result = calculate_hybrid_risk(customer)

    return {
        "customer_id": customer_id,
        "rule_based_score": hybrid_result["rule_based_score"],
        "ml_anomaly_status": hybrid_result["ml_anomaly_status"],
        "ml_anomaly_score": hybrid_result["ml_anomaly_score"],
        "hybrid_risk_score": hybrid_result["hybrid_risk_score"],
        "hybrid_risk_level": hybrid_result["hybrid_risk_level"],
        "risk_reasons": hybrid_result["risk_reasons"]
    }


def score_all_customers_hybrid():
    input_path = "data/processed/customer_risk_ml_scored.csv"

    if not os.path.exists(input_path):
        input_path = "data/processed/customer_risk_scored.csv"

    if not os.path.exists(input_path):
        input_path = "data/processed/unified_customer_risk_profile.csv"

    df = pd.read_csv(input_path)

    rule_scores = []
    ml_statuses = []
    ml_scores = []
    hybrid_scores = []
    hybrid_levels = []
    hybrid_reasons = []

    for index, row in df.iterrows():
        customer = row.to_dict()
        result = calculate_hybrid_risk(customer)

        rule_scores.append(result["rule_based_score"])
        ml_statuses.append(result["ml_anomaly_status"])
        ml_scores.append(result["ml_anomaly_score"])
        hybrid_scores.append(result["hybrid_risk_score"])
        hybrid_levels.append(result["hybrid_risk_level"])
        hybrid_reasons.append(" | ".join(result["risk_reasons"]))

    df["rule_based_score"] = rule_scores
    df["ml_anomaly_status"] = ml_statuses
    df["ml_anomaly_score"] = ml_scores
    df["hybrid_risk_score"] = hybrid_scores
    df["hybrid_risk_level"] = hybrid_levels
    df["hybrid_risk_reasons"] = hybrid_reasons

    output_path = "data/processed/customer_hybrid_risk_scored.csv"
    df.to_csv(output_path, index=False)

    print("Hybrid risk scoring completed.")
    print("Output file:", output_path)
    print("Total customers scored:", len(df))


if __name__ == "__main__":
    result = analyze_customer_risk("CUST_1001")
    print(result)

    score_all_customers_hybrid()