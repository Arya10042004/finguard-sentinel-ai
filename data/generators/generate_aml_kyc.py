import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_aml_kyc_data(total_records=500):
    records = []

    risk_flags = [
        "Politically Exposed Person",
        "High Cash Activity",
        "Incomplete KYC",
        "Sanctions Watchlist Match",
        "Offshore Entity Link",
        "Unusual Beneficiary Pattern",
        "No Risk Flag"
    ]

    document_statuses = ["Verified", "Expired", "Missing", "Under Review"]
    source_of_funds = ["Salary", "Business Income", "Investment", "Inheritance", "Unknown", "Cash Deposits"]

    for i in range(1, total_records + 1):
        customer_id = random.choice([
            "CUST_" + str(1000 + i),
            "CUST-A-" + str(1000 + i),
            "CUSTOMER_" + str(1000 + i)
        ])

        records.append({
            "kyc_reference_id": "KYC_" + str(7000 + i),
            "customer_reference": customer_id,
            "pan_or_tax_id": fake.bothify(text="?????####?"),
            "document_status": random.choice(document_statuses),
            "risk_flag": random.choice(risk_flags),
            "source_of_funds": random.choice(source_of_funds),
            "last_review_date": (datetime.now() - timedelta(days=random.randint(10, 1000))).strftime(
                random.choice(["%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y"])
            ),
            "aml_score": round(random.uniform(0.05, 0.95), 2)
        })

    df = pd.DataFrame(records)

    # Intentional missing and inconsistent values
    df.loc[random.sample(range(total_records), 20), "source_of_funds"] = None
    df.loc[random.sample(range(total_records), 10), "document_status"] = "Not Available"

    output_path = "data/raw/aml_kyc/aml_kyc_records.csv"
    df.to_csv(output_path, index=False)

    print("AML/KYC dataset generated:", output_path)

if __name__ == "__main__":
    generate_aml_kyc_data()