import pandas as pd
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[3]

PROCESSED_DATA_PATH = (
    BASE_DIR / "data" / "processed" / "customer_hybrid_risk_scored.csv"
)


def load_customer_risk_data():
    if not PROCESSED_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Processed customer risk file not found at {PROCESSED_DATA_PATH}"
        )

    return pd.read_csv(PROCESSED_DATA_PATH)


def calculate_data_quality_report():
    df = load_customer_risk_data()

    total_records = len(df)

    if total_records == 0:
        return {
            "data_quality_score": 0,
            "total_records": 0,
            "missing_values": 0,
            "duplicate_customers": 0,
            "unresolved_entities": 0,
            "stale_kyc_records": 0,
            "entity_resolution_confidence": 0,
            "quality_issues": [],
        }

    important_columns = [
        "normalized_customer_id",
        "customer_name",
        "account_type",
        "normalized_country",
        "kyc_status",
        "hybrid_risk_score",
        "hybrid_risk_level",
        "ml_anomaly_status",
    ]

    existing_columns = [col for col in important_columns if col in df.columns]

    missing_values = int(df[existing_columns].isnull().sum().sum())

    duplicate_customers = int(
        df.duplicated(subset=["normalized_customer_id"]).sum()
        if "normalized_customer_id" in df.columns
        else 0
    )

    unresolved_entities = 0

    if "normalized_customer_id" in df.columns:
        unresolved_entities = int(
            df["normalized_customer_id"].isnull().sum()
        )

    stale_kyc_records = 0

    if "kyc_status" in df.columns:
        stale_kyc_records = int(
            df["kyc_status"]
            .astype(str)
            .str.upper()
            .isin(["EXPIRED", "PENDING", "INCOMPLETE"])
            .sum()
        )

    issue_penalty = (
        missing_values
        + duplicate_customers * 3
        + unresolved_entities * 5
        + stale_kyc_records * 2
    )

    max_possible_penalty = max(total_records * len(existing_columns), 1)

    data_quality_score = round(
        max(0, 100 - ((issue_penalty / max_possible_penalty) * 100)),
        2,
    )

    entity_resolution_confidence = round(
        max(0, 100 - ((unresolved_entities / total_records) * 100)),
        2,
    )

    quality_issues = []

    if missing_values > 0:
        quality_issues.append(
            {
                "issue_type": "Missing Values",
                "severity": "MEDIUM",
                "count": missing_values,
                "description": "Important fields contain blank or null values.",
            }
        )

    if duplicate_customers > 0:
        quality_issues.append(
            {
                "issue_type": "Duplicate Customers",
                "severity": "HIGH",
                "count": duplicate_customers,
                "description": "Multiple rows share the same normalized customer ID.",
            }
        )

    if unresolved_entities > 0:
        quality_issues.append(
            {
                "issue_type": "Unresolved Entities",
                "severity": "HIGH",
                "count": unresolved_entities,
                "description": "Some records could not be mapped to a normalized customer ID.",
            }
        )

    if stale_kyc_records > 0:
        quality_issues.append(
            {
                "issue_type": "Stale / Weak KYC",
                "severity": "HIGH",
                "count": stale_kyc_records,
                "description": "Some customers have expired, pending, or incomplete KYC status.",
            }
        )

    if len(quality_issues) == 0:
        quality_issues.append(
            {
                "issue_type": "No Major Issues",
                "severity": "LOW",
                "count": 0,
                "description": "No major data quality issues found in the processed customer risk file.",
            }
        )

    return {
        "data_quality_score": data_quality_score,
        "total_records": total_records,
        "missing_values": missing_values,
        "duplicate_customers": duplicate_customers,
        "unresolved_entities": unresolved_entities,
        "stale_kyc_records": stale_kyc_records,
        "entity_resolution_confidence": entity_resolution_confidence,
        "quality_issues": quality_issues,
    }

def get_entity_resolution_drilldown(limit=100):
    df = load_customer_risk_data()

    drilldown_records = []

    for _, row in df.head(limit).iterrows():
        normalized_customer_id = row.get("normalized_customer_id", None)

        raw_references = []

        possible_reference_columns = [
            "customer_id",
            "customer_reference",
            "sender_customer_id",
            "account_id",
            "sender_account_id",
        ]

        for col in possible_reference_columns:
            if col in df.columns:
                value = row.get(col, None)

                if pd.notna(value):
                    raw_references.append(str(value))

        if len(raw_references) == 0 and pd.notna(normalized_customer_id):
            raw_references.append(str(normalized_customer_id))

        confidence = 100 if pd.notna(normalized_customer_id) else 0

        if len(raw_references) > 1:
            resolution_status = "Resolved"
        elif pd.notna(normalized_customer_id):
            resolution_status = "Direct Match"
        else:
            resolution_status = "Unresolved"

        drilldown_records.append(
            {
                "normalized_customer_id": normalized_customer_id
                if pd.notna(normalized_customer_id)
                else "Unresolved",
                "raw_references": raw_references,
                "reference_count": len(raw_references),
                "resolution_status": resolution_status,
                "confidence_score": confidence,
            }
        )

    return {
        "total_records": len(drilldown_records),
        "records": drilldown_records,
    }