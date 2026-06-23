import pandas as pd
import re


def extract_customer_number(value):
    if pd.isna(value):
        return None

    value = str(value)

    numbers = re.findall(r"\d+", value)

    if len(numbers) == 0:
        return None

    return numbers[-1]


def normalize_customer_id(value):
    customer_number = extract_customer_number(value)

    if customer_number is None:
        return None

    return "CUST_" + str(customer_number)


def normalize_account_to_customer_id(account_id):
    account_number = extract_customer_number(account_id)

    if account_number is None:
        return None

    customer_number = int(account_number) - 4000

    return "CUST_" + str(customer_number)


def clean_country_name(country):
    if pd.isna(country):
        return "Unknown"

    country = str(country).strip()

    country_mapping = {
        "U.S.A": "United States",
        "USA": "United States",
        "US": "United States",
        "United States of America": "United States",
        "UAE": "United Arab Emirates"
    }

    if country in country_mapping:
        return country_mapping[country]

    return country


def clean_document_status(status):
    if pd.isna(status):
        return "Missing"

    status = str(status).strip()

    if status == "Not Available":
        return "Missing"

    return status


def calculate_kyc_risk_score(document_status, risk_flag, source_of_funds, aml_score):
    risk_score = 0

    if document_status in ["Missing", "Expired"]:
        risk_score += 25

    if document_status == "Under Review":
        risk_score += 10

    if risk_flag != "No Risk Flag":
        risk_score += 30

    if source_of_funds in ["Unknown", "Cash Deposits", "Missing"]:
        risk_score += 20

    try:
        risk_score += float(aml_score) * 25
    except:
        risk_score += 10

    if risk_score > 100:
        risk_score = 100

    return round(risk_score, 2)


def build_unified_customer_profile():
    print("Loading raw datasets...")

    core_df = pd.read_csv("data/raw/core_banking/core_banking_customers.csv")
    aml_df = pd.read_csv("data/raw/aml_kyc/aml_kyc_records.csv")
    swift_df = pd.read_csv("data/raw/swift_transfers/swift_transfers.csv")
    crm_df = pd.read_csv("data/raw/crm_notes/crm_notes.csv")
    audit_df = pd.read_csv("data/raw/audit_logs/audit_logs.csv")

    print("Cleaning core banking data...")

    core_df["normalized_customer_id"] = core_df["customer_id"].apply(normalize_customer_id)
    core_df["normalized_country"] = core_df["country"].apply(clean_country_name)
    core_df["city"] = core_df["city"].fillna("Unknown")
    core_df["kyc_status"] = core_df["kyc_status"].fillna("Missing")

    print("Cleaning AML/KYC data...")

    aml_df["normalized_customer_id"] = aml_df["customer_reference"].apply(normalize_customer_id)
    aml_df["document_status"] = aml_df["document_status"].apply(clean_document_status)
    aml_df["source_of_funds"] = aml_df["source_of_funds"].fillna("Missing")

    aml_df["kyc_compliance_risk_score"] = aml_df.apply(
        lambda row: calculate_kyc_risk_score(
            row["document_status"],
            row["risk_flag"],
            row["source_of_funds"],
            row["aml_score"]
        ),
        axis=1
    )

    print("Cleaning SWIFT transfer data...")

    swift_df["normalized_customer_id"] = swift_df["sender_customer_id"].apply(normalize_customer_id)
    swift_df["receiver_country"] = swift_df["receiver_country"].apply(clean_country_name)
    swift_df["transfer_purpose"] = swift_df["transfer_purpose"].fillna("Unknown")

    high_risk_countries = ["Panama", "Cayman Islands", "British Virgin Islands"]

    swift_df["is_high_risk_country_transfer"] = swift_df["receiver_country"].apply(
        lambda country: 1 if country in high_risk_countries else 0
    )

    swift_summary = swift_df.groupby("normalized_customer_id").agg(
        total_swift_transfers=("swift_reference", "count"),
        total_swift_amount=("transfer_amount", "sum"),
        average_swift_amount=("transfer_amount", "mean"),
        high_risk_country_transfers=("is_high_risk_country_transfer", "sum")
    ).reset_index()

    print("Cleaning CRM notes data...")

    crm_df["normalized_customer_id"] = crm_df["customer_reference"].apply(normalize_customer_id)

    risk_keywords = [
        "urgent",
        "offshore",
        "unable to explain",
        "refused",
        "multiple beneficiaries",
        "dormant",
        "consulting services"
    ]

    def detect_crm_risk(note):
        if pd.isna(note):
            return 0

        note = str(note).lower()

        for keyword in risk_keywords:
            if keyword in note:
                return 1

        return 0

    crm_df["crm_risk_signal"] = crm_df["note_text"].apply(detect_crm_risk)

    crm_summary = crm_df.groupby("normalized_customer_id").agg(
        total_crm_interactions=("crm_note_id", "count"),
        crm_risk_signal_count=("crm_risk_signal", "sum")
    ).reset_index()

    print("Cleaning audit logs data...")

    audit_df["normalized_customer_id"] = audit_df["customer_id"].apply(normalize_customer_id)

    serious_events = [
        "transaction_frozen",
        "case_escalated",
        "manual_override",
        "compliance_rejection",
        "login_failed"
    ]

    audit_df["serious_audit_event"] = audit_df["event_type"].apply(
        lambda event: 1 if event in serious_events else 0
    )

    audit_summary = audit_df.groupby("normalized_customer_id").agg(
        total_audit_events=("audit_id", "count"),
        serious_audit_event_count=("serious_audit_event", "sum")
    ).reset_index()

    print("Merging all datasets into unified customer profile...")

    unified_df = core_df.merge(
        aml_df[
            [
                "normalized_customer_id",
                "kyc_reference_id",
                "document_status",
                "risk_flag",
                "source_of_funds",
                "aml_score",
                "kyc_compliance_risk_score"
            ]
        ],
        on="normalized_customer_id",
        how="left"
    )

    unified_df = unified_df.merge(
        swift_summary,
        on="normalized_customer_id",
        how="left"
    )

    unified_df = unified_df.merge(
        crm_summary,
        on="normalized_customer_id",
        how="left"
    )

    unified_df = unified_df.merge(
        audit_summary,
        on="normalized_customer_id",
        how="left"
    )

    numeric_columns = [
        "total_swift_transfers",
        "total_swift_amount",
        "average_swift_amount",
        "high_risk_country_transfers",
        "total_crm_interactions",
        "crm_risk_signal_count",
        "total_audit_events",
        "serious_audit_event_count"
    ]

    for column in numeric_columns:
        unified_df[column] = unified_df[column].fillna(0)

    unified_df["final_customer_risk_score"] = (
        unified_df["kyc_compliance_risk_score"].fillna(0)
        + unified_df["high_risk_country_transfers"] * 10
        + unified_df["crm_risk_signal_count"] * 8
        + unified_df["serious_audit_event_count"] * 5
    )

    unified_df["final_customer_risk_score"] = unified_df["final_customer_risk_score"].apply(
        lambda score: 100 if score > 100 else round(score, 2)
    )

    def assign_risk_level(score):
        if score >= 75:
            return "HIGH"
        elif score >= 40:
            return "MEDIUM"
        else:
            return "LOW"

    unified_df["final_customer_risk_level"] = unified_df["final_customer_risk_score"].apply(assign_risk_level)

    output_path = "data/processed/unified_customer_risk_profile.csv"

    unified_df.to_csv(output_path, index=False)

    print("Unified customer risk profile created successfully.")
    print("Output file:", output_path)
    print("Total customers:", len(unified_df))


if __name__ == "__main__":
    build_unified_customer_profile()