from fastapi import APIRouter, HTTPException
from app.services.data_service import get_all_customers, get_customer_by_id

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.get("/")
def customers():
    return {
        "count": len(get_all_customers()),
        "customers": get_all_customers()
    }


@router.get("/{customer_id}")
def customer_detail(customer_id: str):
    customer = get_customer_by_id(customer_id)

    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer