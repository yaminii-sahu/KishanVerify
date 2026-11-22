from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-init DB tables and run seed ONLY if database is empty
    try:
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

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": "Every rupee. Every benefit. Verified.",
        "status": "online",
        "docs": "/docs"
    }

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
