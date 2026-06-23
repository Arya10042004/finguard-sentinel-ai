from datetime import datetime
from typing import List, Dict
import uuid


LIVE_EVENTS: List[Dict] = []


def calculate_simulated_risk(transaction: Dict):
    risk_score = 0.10
    reasons = []

    amount = float(transaction.get("amount", 0))
    receiver_country = transaction.get("receiver_country", "India")
    transaction_type = transaction.get("transaction_type", "Domestic Transfer")
    purpose = transaction.get("purpose", "General")

    high_risk_countries = [
        "Panama",
        "Cayman Islands",
        "British Virgin Islands",
        "Russia",
    ]

    if amount > 100000:
        risk_score += 0.30
        reasons.append("High transaction amount")

    if amount > 500000:
        risk_score += 0.25
        reasons.append("Very large transaction amount")

    if receiver_country in high_risk_countries:
        risk_score += 0.35
        reasons.append("Transfer to high-risk jurisdiction")

    if transaction_type == "SWIFT Transfer":
        risk_score += 0.15
        reasons.append("Cross-border SWIFT transaction")

    if purpose in ["Unknown", "Consulting Fees", "Offshore Vendor Payment"]:
        risk_score += 0.20
        reasons.append("Weak or suspicious transaction purpose")

    risk_score = round(min(risk_score, 1.0), 2)

    if risk_score >= 0.75:
        risk_level = "HIGH"
        recommended_action = "Escalate Case"
    elif risk_score >= 0.45:
        risk_level = "MEDIUM"
        recommended_action = "Review Transaction"
    else:
        risk_level = "LOW"
        recommended_action = "No Action Required"

    if not reasons:
        reasons.append("Normal transaction pattern")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_reasons": reasons,
        "recommended_action": recommended_action,
    }


def add_simulated_transaction(transaction: Dict):
    risk_result = calculate_simulated_risk(transaction)

    event = {
        "event_id": str(uuid.uuid4()),
        "event_type": "live_transaction_received",
        "customer_id": transaction.get("customer_id"),
        "customer_name": transaction.get("customer_name"),
        "transaction_type": transaction.get("transaction_type"),
        "amount": transaction.get("amount"),
        "currency": transaction.get("currency", "INR"),
        "receiver_country": transaction.get("receiver_country"),
        "purpose": transaction.get("purpose"),
        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],
        "risk_reasons": risk_result["risk_reasons"],
        "recommended_action": risk_result["recommended_action"],
        "status": "Escalated" if risk_result["risk_level"] == "HIGH" else "Monitored",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    LIVE_EVENTS.insert(0, event)

    if len(LIVE_EVENTS) > 100:
        LIVE_EVENTS.pop()

    return event


def get_live_events():
    return {
        "total_events": len(LIVE_EVENTS),
        "events": LIVE_EVENTS,
    }


def clear_live_events():
    LIVE_EVENTS.clear()

    return {
        "message": "All live simulation events cleared",
        "total_events": len(LIVE_EVENTS),
    }