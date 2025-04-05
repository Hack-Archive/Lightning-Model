from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat_router, session_router
from app.data import Base, engine
from app.core import settings, test_redis_connection
from app.db_migration import add_total_token_limit_column
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)
2
add_total_token_limit_column()

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router, prefix=f"{settings.API_V1_STR}")
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Lightning Model API"}

@app.get("/health")
def health_check():
    redis_status = "connected" if test_redis_connection() else "disconnected"
    
    return {
        "status": "healthy",
        "services": {
            "api": "running",
            "redis": redis_status
        }
    }

@app.on_event("startup")
async def startup_event():
    if not test_redis_connection():
        logger.warning("Redis connection failed. Rate limiting will not work properly.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)