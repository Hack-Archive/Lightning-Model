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

class TokenLimiter:
    """Custom token limiter that uses Redis for the token bucket algorithm"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_token_limit(self, session_token: str, tokens_to_use: int):
        """Check if token usage is within limits and track usage"""

        session = self.db.query(ChatSession).filter(
            ChatSession.session_token == session_token,
            ChatSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or inactive"
            )
        
        if session.plan_type != 'token':
            return session
        
        try:
            total_tokens_used = RedisTokenBucket.check_token_limit(
                session_token=session_token,
                tokens_to_use=tokens_to_use
            )
        
            session.token_count = total_tokens_used
            self.db.commit()
            
            return session
            
        except HTTPException as e:
            if e.status_code == status.HTTP_429_TOO_MANY_REQUESTS and "Total token limit" in e.detail:
                session.is_active = False
                self.db.commit()
            
            raise

def get_rate_limiter(db: Session = Depends(get_db)):
    """Create a rate limiter instance"""
    return RateLimiter(db)

def get_token_limiter(db: Session = Depends(get_db)):
    """Create a token limiter instance"""
    return TokenLimiter(db)

def check_rate_limit(
    session_token: str = Depends(get_session_token),
    rate_limiter: RateLimiter = Depends(get_rate_limiter),
    db: Session = Depends(get_db)
):
    """Check if the request is within rate limits"""
    return rate_limiter.check_rate_limit(session_token)

@chat_router.post("/message", response_model=ChatResponse)
def send_message(
    chat_request: ChatRequest,
    session: ChatSession = Depends(check_rate_limit),
    db: Session = Depends(get_db),
    token_limiter: TokenLimiter = Depends(get_token_limiter)
):
    if not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Session is inactive or terminated"
        )
    
    try:
        start_time = time.time()
        
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_k": 40,
                "top_p": 0.95,
                "max_output_tokens": 1024,
            }
        )
        
        history = []
        for msg in chat_request.history:
            history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [{"text": msg.content}]
            })
        
        chat = model.start_chat(history=history)

        input_tokens = 0
 
        if session.plan_type == 'token':
            input_tokens = len(chat_request.message) // 4
        
        result = chat.send_message(chat_request.message)
        response_text = result.text

        usage_metadata = getattr(result, 'usage_metadata', None)
        
        total_tokens = 0
        output_tokens = 0
        
        if usage_metadata:
            prompt_token_count = getattr(usage_metadata, 'prompt_token_count', 0)
            candidates_token_count = getattr(usage_metadata, 'candidates_token_count', 0)
            total_tokens = prompt_token_count + candidates_token_count
            input_tokens = prompt_token_count
            output_tokens = candidates_token_count
        else:
            output_tokens = len(response_text) // 4
            total_tokens = input_tokens + output_tokens
        
        if session.plan_type == 'token':
            token_limiter.check_token_limit(session.session_token, total_tokens)
        
        end_time = time.time()
        latency_ms = int((end_time - start_time) * 1000)
        
        db_user_msg = ChatMessage(
            session_id=session.id,
            role="user",
            content=chat_request.message,
            token_count=input_tokens
        )
        db.add(db_user_msg)
        
        db_assistant_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response_text,
            token_count=output_tokens
        )
        db.add(db_assistant_msg)
        
        db.commit()
        
        tokens_remaining = None
        requests_remaining = None
        
        if session.plan_type == 'token':
            token_usage = RedisTokenBucket.get_token_usage(session.session_token)
            tokens_remaining = token_usage.get('tokens_remaining')
        elif session.total_requests_limit is not None:
            requests_remaining = session.total_requests_limit - session.request_count
        
        return {
            "content": response_text,
            "latency_ms": latency_ms,
            "requests_remaining": requests_remaining,
            "tokens_remaining": tokens_remaining,
            "token_usage": total_tokens if session.plan_type == 'token' else None,
            "session_active": session.is_active
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with Gemini API: {str(e)}"
        )

@chat_router.get("/history", response_model=List[Message])
def get_chat_history(
    session: ChatSession = Depends(check_rate_limit),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return messages

@session_router.post("/create", response_model=Session)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db)
):
    session_token = str(uuid.uuid4())
    
    db_session = ChatSession(
        session_token=session_token,
        plan_type=session_data.plan_type,
        rate_limit_rpm=session_data.rate_limit_rpm,
        rate_limit_rpd=session_data.rate_limit_rpd,
        total_requests_limit=session_data.total_requests_limit,
        total_token_limit=session_data.total_token_limit
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    if session_data.plan_type == 'token':
        RedisTokenBucket.initialize_token_bucket(
            session_token=session_token,
            total_token_limit=session_data.total_token_limit
        )
    
    return db_session

@session_router.get("/status", response_model=Session)
def get_session_status(
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.session_token == session_token
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return session

@session_router.put("/config", response_model=Session)
def update_session_config(
    config: ApiLimitConfig,
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.session_token == session_token,
        ChatSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or inactive"
        )
    
    session.total_requests_limit = config.total_requests_limit
    
    db.commit()
    db.refresh(session)
    
    return session

@session_router.put("/token-config", response_model=Session)
def update_token_config(
    config: TokenLimitConfig,
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db)
):
    try:
        session = db.query(ChatSession).filter(
            ChatSession.session_token == session_token,
            ChatSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or inactive"
            )
        
        if session.plan_type != 'token':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token limit can only be set for token-based plans"
            )
        
        session.total_token_limit = config.total_token_limit
        db.commit()
        
        RedisTokenBucket.initialize_token_bucket(
            session_token=session_token,
            total_token_limit=config.total_token_limit
        )
        
        db.refresh(session)
        return session
    except Exception as e:
        print(f"Error setting token limit: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set token limit: {str(e)}"
        )

@session_router.post("/terminate", response_model=Session)
def terminate_session(
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.session_token == session_token
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session.is_active = False
    db.commit()
    db.refresh(session)
    
    return session