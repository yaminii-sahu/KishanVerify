from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.seed import seed_database
from app.api.verify import router as verify_router
from app.api.schemes import router as schemes_router
from app.api.reports import router as reports_router
from app.api.grievances import router as grievances_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router
from app.api.ocr import router as ocr_router
from app.api.farmers import router as farmers_router
from app.api.documents import router as documents_router
from app.api.mandi import router as mandi_router
from app.api.weather import router as weather_router
from app.api.offices import router as offices_router
from app.api.contact import router as contact_router
from app.api.tts import router as tts_router
from app.api.loans import router as loans_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-init DB tables and run seed ONLY if database is empty
    try:
        from app.core.database import Base, engine
        Base.metadata.create_all(bind=engine)
        seed_database()
    except Exception as e:
        print(f"Startup DB auto-init warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KisanVerify: Agricultural Financial Transparency Platform API ('Every rupee. Every benefit. Verified.')",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(verify_router, prefix=settings.API_V1_STR)
app.include_router(schemes_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(grievances_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(ocr_router, prefix=settings.API_V1_STR)
app.include_router(farmers_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(mandi_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(offices_router, prefix=settings.API_V1_STR)
app.include_router(contact_router, prefix=settings.API_V1_STR)
app.include_router(tts_router, prefix=settings.API_V1_STR)
app.include_router(loans_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "llm_key_configured": bool(settings.GEMINI_API_KEY),
    }

# Static frontend mounting and SPA fallback
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.is_dir() and (frontend_dist / "index.html").is_file():
    assets_dir = frontend_dist / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "tagline": "Every rupee. Every benefit. Verified.",
            "status": "online",
            "docs": "/docs"
        }
