from pydantic import BaseModel


class ComplianceActionCreate(BaseModel):
    customer_id: str
    action: str
    performed_by: str
    remarks: str