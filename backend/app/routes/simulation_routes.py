from fastapi import APIRouter
from pydantic import BaseModel
from app.services.simulation_service import (
    add_simulated_transaction,
    get_live_events,
    clear_live_events,
)


router = APIRouter(
    prefix="/simulation",
    tags=["Live Simulation"]
)


class SimulatedTransaction(BaseModel):
    customer_id: str
    customer_name: str
    transaction_type: str
    amount: float
    currency: str
    receiver_country: str
    purpose: str


@router.post("/transaction")
def create_simulated_transaction(transaction: SimulatedTransaction):
    event = add_simulated_transaction(transaction.dict())

    return {
        "message": "Simulated transaction processed successfully",
        "event": event,
    }


@router.get("/events")
def read_live_events():
    return get_live_events()


@router.delete("/events")
def delete_live_events():
    return clear_live_events()