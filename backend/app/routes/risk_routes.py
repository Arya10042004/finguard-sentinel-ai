from fastapi import APIRouter, HTTPException
from app.services.data_service import (
    get_customer_by_id,
    get_customer_explanation,
    get_high_risk_customers
)

router = APIRouter(
    prefix="/risk",
    tags=["Risk Intelligence"]
)


@router.get("/profile/{customer_id}")
def risk_profile(customer_id: str):
    customer = get_customer_by_id(customer_id)

    if customer is None:
        raise HTTPException(status_code=404, detail="Customer risk profile not found")

    return {
        "customer_id": customer.get("normalized_customer_id"),
        "customer_name": customer.get("customer_name"),
        "account_type": customer.get("account_type"),
        "country": customer.get("normalized_country"),
        "risk_score": customer.get("hybrid_risk_score"),
        "risk_level": customer.get("hybrid_risk_level"),
        "ml_anomaly_status": customer.get("ml_anomaly_status"),
        "risk_reasons": customer.get("hybrid_risk_reasons")
    }


@router.get("/explain/{customer_id}")
def explain_risk(customer_id: str):
    explanation = get_customer_explanation(customer_id)

    if explanation is None:
        raise HTTPException(status_code=404, detail="Customer explanation not found")

    return explanation


@router.get("/high-risk-customers")
def high_risk_customers():
    customers = get_high_risk_customers()

    return {
        "count": len(customers),
        "customers": customers
    }