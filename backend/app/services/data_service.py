import os
import pandas as pd


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))


def get_processed_file_path(file_name):
    return os.path.join(BASE_DIR, "data", "processed", file_name)


def read_csv_file(file_name):
    file_path = get_processed_file_path(file_name)

    if not os.path.exists(file_path):
        return None

    df = pd.read_csv(file_path)
    return df


def clean_nan_values(data):
    if isinstance(data, list):
        return [clean_nan_values(item) for item in data]

    if isinstance(data, dict):
        cleaned = {}

        for key, value in data.items():
            if pd.isna(value):
                cleaned[key] = None
            else:
                cleaned[key] = value

        return cleaned

    return data


def get_hybrid_risk_data():
    df = read_csv_file("customer_hybrid_risk_scored.csv")

    if df is None:
        return None

    return df


def get_explanation_data():
    df = read_csv_file("customer_risk_explanations.csv")

    if df is None:
        return None

    return df


def get_all_customers():
    df = get_hybrid_risk_data()

    if df is None:
        return []

    selected_columns = [
        "normalized_customer_id",
        "customer_name",
        "account_type",
        "normalized_country",
        "kyc_status",
        "hybrid_risk_score",
        "hybrid_risk_level",
        "ml_anomaly_status"
    ]

    available_columns = []

    for column in selected_columns:
        if column in df.columns:
            available_columns.append(column)

    result = df[available_columns].to_dict(orient="records")
    return clean_nan_values(result)


def get_customer_by_id(customer_id):
    df = get_hybrid_risk_data()

    if df is None:
        return None

    customer_records = df[df["normalized_customer_id"] == customer_id]

    if customer_records.empty:
        return None

    result = customer_records.iloc[0].to_dict()
    return clean_nan_values(result)


def get_customer_explanation(customer_id):
    df = get_explanation_data()

    if df is None:
        return None

    customer_records = df[df["customer_id"] == customer_id]

    if customer_records.empty:
        return None

    result = customer_records.iloc[0].to_dict()
    return clean_nan_values(result)


def get_high_risk_customers():
    df = get_hybrid_risk_data()

    if df is None:
        return []

    high_risk_df = df[df["hybrid_risk_level"] == "HIGH"]

    high_risk_df = high_risk_df.sort_values(
        by="hybrid_risk_score",
        ascending=False
    )

    selected_columns = [
        "normalized_customer_id",
        "customer_name",
        "account_type",
        "normalized_country",
        "hybrid_risk_score",
        "hybrid_risk_level",
        "ml_anomaly_status",
        "hybrid_risk_reasons"
    ]

    available_columns = []

    for column in selected_columns:
        if column in high_risk_df.columns:
            available_columns.append(column)

    result = high_risk_df[available_columns].to_dict(orient="records")
    return clean_nan_values(result)


def get_dashboard_summary():
    df = get_hybrid_risk_data()

    if df is None:
        return {
            "status": "error",
            "message": "Risk data not found. Run Level 4 and Level 5 scripts first."
        }

    total_customers = len(df)

    high_risk_count = len(df[df["hybrid_risk_level"] == "HIGH"])
    medium_risk_count = len(df[df["hybrid_risk_level"] == "MEDIUM"])
    low_risk_count = len(df[df["hybrid_risk_level"] == "LOW"])

    anomaly_count = len(df[df["ml_anomaly_status"] == "ANOMALY"])

    average_risk_score = round(df["hybrid_risk_score"].mean(), 2)

    if "total_swift_amount" in df.columns:
        total_swift_exposure = round(df["total_swift_amount"].sum(), 2)
    else:
        total_swift_exposure = 0

    return {
        "total_customers": total_customers,
        "high_risk_customers": high_risk_count,
        "medium_risk_customers": medium_risk_count,
        "low_risk_customers": low_risk_count,
        "ml_anomalies_detected": anomaly_count,
        "average_risk_score": average_risk_score,
        "total_swift_exposure": total_swift_exposure
    }