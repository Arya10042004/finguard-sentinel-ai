import time
import random
import requests
from faker import Faker


fake = Faker()

BACKEND_URL = "http://127.0.0.1:8000/simulation/transaction"


NORMAL_COUNTRIES = [
    "India",
    "United States",
    "United Kingdom",
    "Singapore",
    "UAE",
    "Germany",
]

HIGH_RISK_COUNTRIES = [
    "Panama",
    "Cayman Islands",
    "British Virgin Islands",
    "Russia",
]

NORMAL_PURPOSES = [
    "Vendor Payment",
    "Salary Transfer",
    "Loan Repayment",
    "Utility Payment",
    "Business Payment",
    "Investment Transfer",
]

SUSPICIOUS_PURPOSES = [
    "Unknown",
    "Consulting Fees",
    "Offshore Vendor Payment",
]

TRANSACTION_TYPES = [
    "Domestic Transfer",
    "UPI Transfer",
    "NEFT",
    "RTGS",
    "SWIFT Transfer",
]


def generate_normal_transaction():
    customer_number = random.randint(1001, 1500)

    return {
        "customer_id": f"CUST_{customer_number}",
        "customer_name": fake.name(),
        "transaction_type": random.choice(["Domestic Transfer", "UPI Transfer", "NEFT", "RTGS"]),
        "amount": round(random.uniform(500, 85000), 2),
        "currency": "INR",
        "receiver_country": "India",
        "purpose": random.choice(NORMAL_PURPOSES),
    }


def generate_medium_risk_transaction():
    customer_number = random.randint(1001, 1500)

    return {
        "customer_id": f"CUST_{customer_number}",
        "customer_name": fake.name(),
        "transaction_type": random.choice(["RTGS", "SWIFT Transfer"]),
        "amount": round(random.uniform(100000, 350000), 2),
        "currency": random.choice(["INR", "USD", "EUR"]),
        "receiver_country": random.choice(NORMAL_COUNTRIES),
        "purpose": random.choice(NORMAL_PURPOSES + ["Consulting Fees"]),
    }


def generate_high_risk_transaction():
    customer_number = random.randint(1001, 1500)

    return {
        "customer_id": f"CUST_{customer_number}",
        "customer_name": fake.name(),
        "transaction_type": "SWIFT Transfer",
        "amount": round(random.uniform(500000, 1200000), 2),
        "currency": random.choice(["USD", "EUR", "GBP"]),
        "receiver_country": random.choice(HIGH_RISK_COUNTRIES),
        "purpose": random.choice(SUSPICIOUS_PURPOSES),
    }


def choose_transaction():
    risk_roll = random.random()

    if risk_roll < 0.70:
        return generate_normal_transaction()

    if risk_roll < 0.90:
        return generate_medium_risk_transaction()

    return generate_high_risk_transaction()


def send_transaction(transaction):
    try:
        response = requests.post(BACKEND_URL, json=transaction, timeout=10)

        if response.status_code == 200:
            result = response.json()
            event = result.get("event", {})

            print("-" * 80)
            print("Transaction sent successfully")
            print("Customer:", event.get("customer_id"))
            print("Type:", event.get("transaction_type"))
            print("Amount:", event.get("amount"), event.get("currency"))
            print("Country:", event.get("receiver_country"))
            print("Purpose:", event.get("purpose"))
            print("Risk Score:", event.get("risk_score"))
            print("Risk Level:", event.get("risk_level"))
            print("Recommended Action:", event.get("recommended_action"))
            print("Status:", event.get("status"))
            print("-" * 80)

        else:
            print("Failed to send transaction")
            print("Status Code:", response.status_code)
            print("Response:", response.text)

    except requests.exceptions.ConnectionError:
        print("Backend connection failed. Make sure FastAPI is running at:")
        print("http://127.0.0.1:8000")
    except requests.exceptions.Timeout:
        print("Request timed out while sending transaction.")
    except Exception as error:
        print("Unexpected error:", error)


def run_simulator(delay_seconds=3):
    print("FINGUARD Sentinel AI — Live Transaction Simulator Started")
    print("Sending simulated transactions to:", BACKEND_URL)
    print("Press CTRL + C to stop.")
    print()

    while True:
        transaction = choose_transaction()
        send_transaction(transaction)
        time.sleep(delay_seconds)


if __name__ == "__main__":
    run_simulator(delay_seconds=3)