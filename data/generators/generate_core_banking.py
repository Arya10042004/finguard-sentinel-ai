import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_core_banking_data(total_records=500):
    customers = []

    account_types = ["Savings", "Current", "Corporate", "NRI", "Salary"]
    countries = ["India", "United States", "United Kingdom", "Singapore", "UAE", "Germany"]
    cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Patna", "Kolkata", "Chennai"]

    for i in range(1, total_records + 1):
        customer_id = "CUST_" + str(1000 + i)
        account_id = "ACC_" + str(5000 + i)

        created_date = datetime.now() - timedelta(days=random.randint(30, 2500))

        customers.append({
            "customer_id": customer_id,
            "account_id": account_id,
            "customer_name": fake.name(),
            "account_type": random.choice(account_types),
            "country": random.choice(countries),
            "city": random.choice(cities),
            "account_open_date": created_date.strftime(random.choice(["%Y-%m-%d", "%d/%m/%Y", "%m-%d-%Y"])),
            "current_balance": round(random.uniform(5000, 5000000), 2),
            "kyc_status": random.choice(["Verified", "Pending", "Expired", "Incomplete"]),
            "customer_risk_category": random.choice(["LOW", "MEDIUM", "HIGH"]),
            "mobile_number": fake.phone_number(),
            "email": fake.email()
        })

    df = pd.DataFrame(customers)

    # Add intentional messy data
    df.loc[random.sample(range(total_records), 20), "city"] = None
    df.loc[random.sample(range(total_records), 15), "kyc_status"] = None
    df.loc[random.sample(range(total_records), 10), "country"] = "U.S.A"

    output_path = "data/raw/core_banking/core_banking_customers.csv"
    df.to_csv(output_path, index=False)

    print("Core banking dataset generated:", output_path)

if __name__ == "__main__":
    generate_core_banking_data()