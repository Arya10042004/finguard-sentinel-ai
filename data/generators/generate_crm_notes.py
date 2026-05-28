import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_crm_notes_data(total_records=400):
    records = []

    notes = [
        "Customer requested urgent international transfer without clear invoice.",
        "Client mentioned offshore vendor relationship during call.",
        "Customer was unable to explain source of recent large deposit.",
        "Relationship manager marked customer as premium corporate client.",
        "Customer asked about increasing transaction limits.",
        "No suspicious activity observed during routine interaction.",
        "Customer refused to provide updated business ownership documents.",
        "Multiple beneficiaries added within short time period.",
        "Customer claims payments are for consulting services.",
        "Dormant customer account suddenly became active."
    ]

    for i in range(1, total_records + 1):
        records.append({
            "crm_note_id": "CRM_" + str(3000 + i),
            "customer_reference": random.choice([
                "CUST_" + str(random.randint(1001, 1500)),
                "ACC_" + str(random.randint(5001, 5500)),
                "CUSTOMER-" + str(random.randint(1001, 1500))
            ]),
            "relationship_manager": fake.name(),
            "interaction_channel": random.choice(["Phone", "Email", "Branch Visit", "Video Call", "Chat"]),
            "note_text": random.choice(notes),
            "interaction_date": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime(
                random.choice(["%Y-%m-%d", "%d/%m/%Y", "%m-%d-%Y"])
            ),
            "sentiment": random.choice(["Positive", "Neutral", "Negative", "Concern"])
        })

    df = pd.DataFrame(records)

    output_path = "data/raw/crm_notes/crm_notes.csv"
    df.to_csv(output_path, index=False)

    print("CRM notes dataset generated:", output_path)

if __name__ == "__main__":
    generate_crm_notes_data()