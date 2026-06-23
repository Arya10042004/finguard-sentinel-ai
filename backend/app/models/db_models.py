from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime

from app.database.db_connection import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, nullable=True)
    account_type = Column(String, nullable=True)
    country = Column(String, nullable=True)
    kyc_status = Column(String, nullable=True)
    risk_score = Column(Float, default=0)
    risk_level = Column(String, nullable=True)
    ml_anomaly_status = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True, nullable=False)
    risk_score = Column(Float, default=0)
    risk_level = Column(String, nullable=True)
    alert_reason = Column(Text, nullable=True)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)


class ComplianceAction(Base):
    __tablename__ = "compliance_actions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)
    performed_by = Column(String, nullable=False)
    remarks = Column(Text, nullable=True)
    status = Column(String, default="RECORDED")
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs_backend"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    customer_id = Column(String, index=True, nullable=True)
    performed_by = Column(String, nullable=True)
    event_status = Column(String, default="SUCCESS")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)