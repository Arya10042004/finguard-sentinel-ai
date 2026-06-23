import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def train_anomaly_model():
    input_path = "data/processed/customer_risk_scored.csv"

    if not os.path.exists(input_path):
        input_path = "data/processed/unified_customer_risk_profile.csv"

    df = pd.read_csv(input_path)

    feature_columns = [
        "aml_score",
        "kyc_compliance_risk_score",
        "total_swift_transfers",
        "total_swift_amount",
        "average_swift_amount",
        "high_risk_country_transfers",
        "total_crm_interactions",
        "crm_risk_signal_count",
        "total_audit_events",
        "serious_audit_event_count",
        "final_customer_risk_score"
    ]

    available_features = []

    for column in feature_columns:
        if column in df.columns:
            available_features.append(column)

    model_df = df[available_features].copy()

    for column in available_features:
        model_df[column] = pd.to_numeric(model_df[column], errors="coerce")

    model_df = model_df.fillna(0)

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(model_df)

    model = IsolationForest(
        n_estimators=150,
        contamination=0.08,
        random_state=42
    )

    model.fit(scaled_features)

    os.makedirs("ai-engine/models", exist_ok=True)

    joblib.dump(model, "ai-engine/models/isolation_forest_model.pkl")
    joblib.dump(scaler, "ai-engine/models/anomaly_scaler.pkl")
    joblib.dump(available_features, "ai-engine/models/anomaly_features.pkl")

    anomaly_predictions = model.predict(scaled_features)
    anomaly_scores = model.decision_function(scaled_features)

    df["ml_anomaly_prediction"] = anomaly_predictions
    df["ml_anomaly_status"] = df["ml_anomaly_prediction"].apply(
        lambda value: "ANOMALY" if value == -1 else "NORMAL"
    )
    df["ml_anomaly_score"] = anomaly_scores

    output_path = "data/processed/customer_risk_ml_scored.csv"
    df.to_csv(output_path, index=False)

    print("Isolation Forest anomaly model trained successfully.")
    print("Model saved at: ai-engine/models/isolation_forest_model.pkl")
    print("Scaler saved at: ai-engine/models/anomaly_scaler.pkl")
    print("Feature list saved at: ai-engine/models/anomaly_features.pkl")
    print("ML scored data saved at:", output_path)
    print("Total records trained:", len(df))
    print("Features used:", available_features)


if __name__ == "__main__":
    train_anomaly_model()