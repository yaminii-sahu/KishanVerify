import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Office

router = APIRouter(prefix="/offices", tags=["Offices"])

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    R = 6371.0  # Earth's radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class OfficeSchema(BaseModel):
    id: int
    office_code: str
    name: str
    name_hi: Optional[str] = None
    office_type: str
    category_label: Optional[str] = None
    address: str
    district: str
    state: str
    pin_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    lat: float
    lon: float
    opening_hours: str
    services_offered: Optional[List[str]] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class OfficesResponse(BaseModel):
    offices: List[OfficeSchema]
    total_count: int
    source: str = "Government Agriculture Extension Directory (Verified)"
    is_demo: bool = True
    last_updated: str = "2025-04-15"
    center: dict

@router.get("", response_model=OfficesResponse)
@router.get("/", response_model=OfficesResponse)
def get_nearby_offices(
    lat: Optional[float] = Query(None, description="User latitude"),
    lon: Optional[float] = Query(None, description="User longitude"),
    district: Optional[str] = Query(None, description="Filter by district"),
    state: Optional[str] = Query(None, description="Filter by state"),
    office_type: Optional[str] = Query(None, description="Filter by office type (KVK, APMC, DDA, Soil Lab, CSC, Bank)"),
    radius_km: Optional[float] = Query(100.0, description="Max radius in km"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Office)

    if district and district.lower() != "all":
        query = query.filter(Office.district.ilike(f"%{district.strip()}%"))
    if state and state.lower() != "all":
        query = query.filter(Office.state.ilike(f"%{state.strip()}%"))
    if office_type and office_type.lower() != "all":
        query = query.filter(Office.office_type == office_type.strip())

    records = query.all()

    # Default center coords (Patan, Durg, Chhattisgarh) if not supplied
    center_lat = lat if lat is not None else 21.0362
    center_lon = lon if lon is not None else 81.5375

    results = []
    for office in records:
        dist = None
        if lat is not None and lon is not None:
            dist = round(haversine_km(lat, lon, office.lat, office.lon), 1)
            if radius_km is not None and dist > radius_km:
                continue
        elif center_lat is not None and center_lon is not None:
            # calculate relative to default center for display
            dist = round(haversine_km(center_lat, center_lon, office.lat, office.lon), 1)

        data = OfficeSchema(
            id=office.id,
            office_code=office.office_code,
            name=office.name,
            name_hi=office.name_hi,
            office_type=office.office_type,
            category_label=office.category_label,
            address=office.address,
            district=office.district,
            state=office.state,
            pin_code=office.pin_code,
            phone=office.phone,
            email=office.email,
            lat=office.lat,
            lon=office.lon,
            opening_hours=office.opening_hours,
            services_offered=office.services_offered or [],
            distance_km=dist,
        )
        results.append(data)

    if lat is not None and lon is not None:
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999)
    else:
        # If district was selected, sort by distance to district center or by name
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999)

    paged_results = results[:limit]

    return OfficesResponse(
        offices=paged_results,
        total_count=len(results),
        source="Government Agriculture Extension Directory (Verified)",
        is_demo=True,
        last_updated="2025-04-15",
        center={"lat": center_lat, "lon": center_lon},
    )
