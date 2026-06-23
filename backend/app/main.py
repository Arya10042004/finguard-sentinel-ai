from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.dashboard_routes import router as dashboard_router
from app.routes.customer_routes import router as customer_router
from app.routes.risk_routes import router as risk_router
from app.routes.compliance_routes import router as compliance_router
from app.routes.audit_routes import router as audit_router
from app.routes.data_quality_routes import router as data_quality_router

app = FastAPI(
    title="FINGUARD Sentinel AI",
    version="1.0.0",
    description="Autonomous Financial Risk & Compliance Intelligence Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(customer_router)
app.include_router(risk_router)
app.include_router(compliance_router)
app.include_router(audit_router)
app.include_router(data_quality_router)



@app.get("/")
def home():
    return {
        "message": "FINGUARD Sentinel AI Backend Running",
        "platform": "Autonomous Financial Risk & Compliance Intelligence Platform",
        "status": "active"
    }