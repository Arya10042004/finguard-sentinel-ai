from fastapi import APIRouter
from app.services.data_quality_service import (
    calculate_data_quality_report,
    get_entity_resolution_drilldown,
)

router = APIRouter(
    prefix="/data-quality",
    tags=["Data Quality"]
)


@router.get("/summary")
def get_data_quality_summary():
    return calculate_data_quality_report()


@router.get("/entity-resolution")
def get_entity_resolution_report():
    return get_entity_resolution_drilldown()