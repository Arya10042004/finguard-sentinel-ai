import os
import pandas as pd


def safe_float(value, default=0):
    try:
        if pd.isna(value):
            return default
        return float(value)
    except:
        return default


def get_recommendation(risk_level, ml_anomaly_status):
    if risk_level == "HIGH" and ml_anomaly_status == "ANOMALY":
        return {
            "recommended_action": "Escalate immediately to compliance officer",
            "priority": "Critical",
            "case_required": True
        }

    if risk_level == "HIGH":
        return {
            "recommended_action": "Create high-priority compliance case",
            "priority": "High",
            "case_required": True
        }

    if risk_level == "MEDIUM":
        return {
            "recommended_action": "Send for manual review",
            "priority": "Medium",
            "case_required": True
        }

    return {
        "recommended_action": "Continue routine monitoring",
        "priority": "Low",
        "case_required": False
    }


def build_factor_explanations(customer):
    factors = []

    if customer.get("kyc_status") in ["Missing", "Incomplete", "Expired"]:
        factors.append({
            "factor": "KYC Status",
            "value": customer.get("kyc_status"),
            "severity": "High",
            "explanation": "Customer KYC is not fully valid, which increases compliance risk."
        })

    if customer.get("document_status") in ["Missing", "Expired"]:
        factors.append({
            "factor": "Compliance Document Status",
            "value": customer.get("document_status"),
            "severity": "High",
            "explanation": "Customer compliance documents are missing or expired."
        })

    if customer.get("risk_flag") != "No Risk Flag":
        factors.append({
            "factor": "AML/KYC Risk Flag",
            "value": customer.get("risk_flag"),
            "severity": "High",
            "explanation": "Customer has an AML/KYC flag that may require compliance review."
        })

    if customer.get("source_of_funds") in ["Unknown", "Cash Deposits", "Missing"]:
        factors.append({
            "factor": "Source of Funds",
            "value": customer.get("source_of_funds"),
            "severity": "High",
            "explanation": "The source of customer funds is unclear or cash-heavy."
        })

    if safe_float(customer.get("aml_score")) >= 0.70:
        factors.append({
            "factor": "AML Score",
            "value": safe_float(customer.get("aml_score")),
            "severity": "High",
            "explanation": "Customer has a high AML score compared to normal customers."
        })

    if safe_float(customer.get("high_risk_country_transfers")) > 0:
        factors.append({
            "factor": "High-Risk Country Transfers",
            "value": safe_float(customer.get("high_risk_country_transfers")),
            "severity": "High",
            "explanation": "Customer has sent money to one or more high-risk countries."
        })

    if safe_float(customer.get("total_swift_amount")) > 500000:
        factors.append({
            "factor": "SWIFT Transfer Exposure",
            "value": safe_float(customer.get("total_swift_amount")),
            "severity": "Medium",
            "explanation": "Customer has high total international transfer exposure."
        })

    if safe_float(customer.get("crm_risk_signal_count")) > 0:
        factors.append({
            "factor": "CRM Risk Signals",
            "value": safe_float(customer.get("crm_risk_signal_count")),
            "severity": "Medium",
            "explanation": "Relationship manager notes contain suspicious behavioral signals."
        })

    if safe_float(customer.get("serious_audit_event_count")) > 0:
        factors.append({
            "factor": "Serious Audit Events",
            "value": safe_float(customer.get("serious_audit_event_count")),
            "severity": "Medium",
            "explanation": "System audit history contains serious compliance or operational events."
        })

    if customer.get("ml_anomaly_status") == "ANOMALY":
        factors.append({
            "factor": "ML Anomaly Detection",
            "value": "ANOMALY",
            "severity": "High",
            "explanation": "Machine learning model detected unusual customer behavior compared to the overall customer base."
        })

    if len(factors) == 0:
        factors.append({
            "factor": "No Major Risk Indicator",
            "value": "Normal",
            "severity": "Low",
            "explanation": "No major compliance or anomaly risk signals were found for this customer."
        })

    return factors


def convert_factors_to_text(factors):
    text_items = []

    for factor in factors:
        text_items.append(
            factor["factor"] + " (" + factor["severity"] + "): " + factor["explanation"]
        )

    return " | ".join(text_items)


def explain_customer_risk(customer_id):
    input_path = "data/processed/customer_hybrid_risk_scored.csv"

    if not os.path.exists(input_path):
        return {
            "status": "error",
            "message": "customer_hybrid_risk_scored.csv not found. Run Level 4 hybrid risk engine first."
        }

    df = pd.read_csv(input_path)

    customer_records = df[df["normalized_customer_id"] == customer_id]

    if customer_records.empty:
        return {
            "status": "not_found",
            "message": "Customer not found"
        }

    customer = customer_records.iloc[0].to_dict()

    risk_level = customer.get("hybrid_risk_level", "LOW")
    ml_status = customer.get("ml_anomaly_status", "NORMAL")

    factors = build_factor_explanations(customer)
    recommendation = get_recommendation(risk_level, ml_status)

    explanation = {
        "customer_id": customer_id,
        "customer_name": customer.get("customer_name"),
        "account_type": customer.get("account_type"),
        "country": customer.get("normalized_country"),
        "rule_based_score": safe_float(customer.get("rule_based_score")),
        "ml_anomaly_status": ml_status,
        "ml_anomaly_score": safe_float(customer.get("ml_anomaly_score")),
        "hybrid_risk_score": safe_float(customer.get("hybrid_risk_score")),
        "hybrid_risk_level": risk_level,
        "top_risk_factors": factors,
        "recommended_action": recommendation["recommended_action"],
        "priority": recommendation["priority"],
        "case_required": recommendation["case_required"]
    }

    return explanation


def explain_all_customers():
    input_path = "data/processed/customer_hybrid_risk_scored.csv"

    if not os.path.exists(input_path):
        print("customer_hybrid_risk_scored.csv not found. Run Level 4 hybrid risk engine first.")
        return

    df = pd.read_csv(input_path)

    explanation_rows = []

    for index, row in df.iterrows():
        customer = row.to_dict()

        risk_level = customer.get("hybrid_risk_level", "LOW")
        ml_status = customer.get("ml_anomaly_status", "NORMAL")

        factors = build_factor_explanations(customer)
        recommendation = get_recommendation(risk_level, ml_status)

        explanation_rows.append({
            "customer_id": customer.get("normalized_customer_id"),
            "customer_name": customer.get("customer_name"),
            "account_type": customer.get("account_type"),
            "country": customer.get("normalized_country"),
            "hybrid_risk_score": safe_float(customer.get("hybrid_risk_score")),
            "hybrid_risk_level": risk_level,
            "ml_anomaly_status": ml_status,
            "top_risk_factors": convert_factors_to_text(factors),
            "recommended_action": recommendation["recommended_action"],
            "priority": recommendation["priority"],
            "case_required": recommendation["case_required"]
        })

    explanation_df = pd.DataFrame(explanation_rows)

    output_path = "data/processed/customer_risk_explanations.csv"
    explanation_df.to_csv(output_path, index=False)

    print("Customer risk explanations generated successfully.")
    print("Output file:", output_path)
    print("Total explanations generated:", len(explanation_df))


if __name__ == "__main__":
    result = explain_customer_risk("CUST_1001")
    print(result)

    explain_all_customers()