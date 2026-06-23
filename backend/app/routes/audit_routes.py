from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db_connection import get_db
from app.models.db_models import AuditLog

router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"]
)


@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).all()

    return {
        "count": len(logs),
        "logs": logs
    }