from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db_connection import get_db
from app.models.db_models import ComplianceAction, AuditLog
from app.schemas.compliance_schema import ComplianceActionCreate

router = APIRouter(
    prefix="/compliance",
    tags=["Compliance"]
)


@router.post("/action")
def create_compliance_action(
    action_data: ComplianceActionCreate,
    db: Session = Depends(get_db)
):
    compliance_action = ComplianceAction(
        customer_id=action_data.customer_id,
        action=action_data.action,
        performed_by=action_data.performed_by,
        remarks=action_data.remarks,
        status="RECORDED"
    )

    db.add(compliance_action)

    audit_log = AuditLog(
        event_type="compliance_action_recorded",
        customer_id=action_data.customer_id,
        performed_by=action_data.performed_by,
        event_status="SUCCESS",
        remarks="Compliance action recorded: " + action_data.action
    )

    db.add(audit_log)

    db.commit()
    db.refresh(compliance_action)

    return {
        "message": "Compliance action saved in database successfully",
        "id": compliance_action.id,
        "customer_id": compliance_action.customer_id,
        "action": compliance_action.action,
        "performed_by": compliance_action.performed_by,
        "remarks": compliance_action.remarks,
        "status": compliance_action.status,
        "created_at": compliance_action.created_at
    }


@router.get("/actions")
def get_compliance_actions(db: Session = Depends(get_db)):
    actions = db.query(ComplianceAction).order_by(
        ComplianceAction.created_at.desc()
    ).all()

    return {
        "count": len(actions),
        "actions": actions
    }