import pandas as pd
import random
from datetime import datetime, timedelta

def generate_audit_logs(total_records=600):
    records = []

    events = [
        "login_success",
        "login_failed",
        "transaction_reviewed",
        "risk_score_generated",
        "transaction_frozen",
        "case_escalated",
        "kyc_updated",
        "manual_override",
        "compliance_approval",
        "compliance_rejection"
    ]

    actors = [
        "risk_engine",
        "compliance_officer",
        "incident_agent",
        "relationship_manager",
        "system_admin"
    ]

    for i in range(1, total_records + 1):
        records.append({
            "audit_id": "AUDIT_" + str(8000 + i),
            "event_type": random.choice(events),
            "performed_by": random.choice(actors),
            "customer_id": "CUST_" + str(random.randint(1001, 1500)),
            "event_timestamp": (datetime.now() - timedelta(
                days=random.randint(0, 180),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )).strftime("%Y-%m-%d %H:%M:%S"),
            "event_status": random.choice(["Success", "Failed", "Pending"]),
            "remarks": random.choice([
                "Automated system action",
                "Manual review completed",
                "Escalated for compliance validation",
                "Risk threshold exceeded",
                "No further action required"
            ])
        })

    df = pd.DataFrame(records)

    output_path = "data/raw/audit_logs/audit_logs.csv"
    df.to_csv(output_path, index=False)

    print("Audit logs dataset generated:", output_path)

if __name__ == "__main__":
    generate_audit_logs()