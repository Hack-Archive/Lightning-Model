import os
import time
from datetime import datetime
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from pydantic_settings import BaseSettings
from redis import Redis

class Settings(BaseSettings):
    APP_NAME: str = "Lightning Model API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    DEFAULT_RATE_LIMIT_RPM: int = 15
    DEFAULT_RATE_LIMIT_RPD: int = 1500
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD", None)
    
    class Config:
        env_file = ".env"

settings = Settings()

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True,
    password=settings.REDIS_PASSWORD
)

def test_redis_connection():
    try:
        redis_client.ping()
        return True
    except Exception as e:
        print(f"Redis connection error: {e}")
        return False

class RedisRateLimiter:
    @staticmethod
    def _get_minute_key(session_token: str) -> str:
        current_minute = int(time.time() / 60)
        return f"ratelimit:rpm:{session_token}:{current_minute}"
    
    @staticmethod
    def _get_day_key(session_token: str) -> str:
        today = datetime.now().strftime("%Y-%m-%d")
        return f"ratelimit:rpd:{session_token}:{today}"
    
    @classmethod
    def check_rate_limit(cls, session_token: str, rpm_limit: int, rpd_limit: int, plan_type: str):
        if plan_type != "request":
            return True
            
        rpm_key = cls._get_minute_key(session_token)
        rpd_key = cls._get_day_key(session_token)
        
        current_rpm = redis_client.get(rpm_key)
        current_rpm = int(current_rpm) if current_rpm else 0
        
        if current_rpm >= rpm_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {rpm_limit} requests per minute"
            )
        
        current_rpd = redis_client.get(rpd_key)
        current_rpd = int(current_rpd) if current_rpd else 0
        
        if current_rpd >= rpd_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {rpd_limit} requests per day"
            )
        
        pipe = redis_client.pipeline()
        pipe.incr(rpm_key)
        pipe.expire(rpm_key, 60)
        pipe.incr(rpd_key)
        pipe.expire(rpd_key, 86400)
        pipe.execute()
        
        return True

def get_session_token(x_session_token: Optional[str] = Header(None)):
    if x_session_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token is required"
        )
    return x_session_token