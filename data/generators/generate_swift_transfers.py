import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_swift_transfer_data(total_records=700):
    records = []

    countries = [
        "India", "Singapore", "United States", "United Kingdom",
        "UAE", "Germany", "Russia", "Panama", "Cayman Islands",
        "British Virgin Islands"
    ]

    high_risk_countries = ["Panama", "Cayman Islands", "British Virgin Islands"]

    currencies = ["INR", "USD", "EUR", "GBP", "AED", "SGD"]

    for i in range(1, total_records + 1):
        sender_customer_id = "CUST_" + str(random.randint(1001, 1500))
        receiver_country = random.choice(countries)

        amount = round(random.uniform(1000, 250000), 2)

        if receiver_country in high_risk_countries:
            amount = round(random.uniform(75000, 900000), 2)

        records.append({
            "swift_reference": "SWIFT_" + str(900000 + i),
            "sender_customer_id": sender_customer_id,
            "sender_account_id": "ACC_" + str(random.randint(5001, 5500)),
            "receiver_name": fake.company(),
            "receiver_country": receiver_country,
            "receiver_bank": fake.company() + " Bank",
            "currency": random.choice(currencies),
            "transfer_amount": amount,
            "transfer_date": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime(
                random.choice(["%Y-%m-%d", "%d/%m/%Y", "%m-%d-%Y"])
            ),
            "transfer_purpose": random.choice([
                "Vendor Payment",
                "Consulting Fees",
                "Import Payment",
                "Investment Transfer",
                "Loan Repayment",
                "Unknown"
            ]),
            "transfer_status": random.choice(["Completed", "Pending", "Rejected", "Under Review"])
        })

    df = pd.DataFrame(records)

    # Messy data
    df.loc[random.sample(range(total_records), 25), "transfer_purpose"] = None
    df.loc[random.sample(range(total_records), 15), "receiver_country"] = "USA"

    output_path = "data/raw/swift_transfers/swift_transfers.csv"
    df.to_csv(output_path, index=False)

    print("SWIFT transfers dataset generated:", output_path)

if __name__ == "__main__":
    generate_swift_transfer_data()