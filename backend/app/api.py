from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import time
import google.generativeai as genai
from typing import List, Optional, Dict, Any
import uuid

from app.data import ChatSession, ChatMessage, Message, Session, SessionCreate, ApiLimitConfig, TokenLimitConfig, ChatRequest, ChatResponse, get_db
from app.core import settings, get_session_token
from app.redis import RedisTokenBucket

genai.configure(api_key=settings.GEMINI_API_KEY)

chat_router = APIRouter(prefix="/chat", tags=["chat"])
session_router = APIRouter(prefix="/sessions", tags=["sessions"])

class RateLimiter:
    """Custom rate limiter that uses the database and Redis"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_rate_limit(self, session_token: str):
        """Check if a request is within rate limits"""
        from app.core import RedisRateLimiter
        
        session = self.db.query(ChatSession).filter(
            ChatSession.session_token == session_token,
            ChatSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or inactive"
            )
        
        if session.total_requests_limit is not None and session.request_count >= session.total_requests_limit:
            session.is_active = False
            self.db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Total request limit reached. Session terminated."
            )
        
        if session.plan_type == 'request':
            RedisRateLimiter.check_rate_limit(
                session_token=session_token,
                rpm_limit=session.rate_limit_rpm,
                rpd_limit=session.rate_limit_rpd,
                plan_type=session.plan_type
            )
        
        session.request_count += 1
        self.db.commit()
        
        return session