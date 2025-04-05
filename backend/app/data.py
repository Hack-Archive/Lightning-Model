from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

from app.core import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    sessions = relationship("ChatSession", back_populates="user")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    rate_limit_rpm = Column(Integer, default=15)
    rate_limit_rpd = Column(Integer, default=1500)
    total_requests_limit = Column(Integer, nullable=True)
    
    total_token_limit = Column(Integer, nullable=True)
    
    plan_type = Column(String)
    
    request_count = Column(Integer, default=0)
    token_count = Column(Integer, default=0)
    
    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    token_count = Column(Integer, nullable=True)
    
    session = relationship("ChatSession", back_populates="messages")

class MessageBase(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    session_id: int
    created_at: datetime.datetime
    token_count: Optional[int] = None

    class Config:
        orm_mode = True

class SessionBase(BaseModel):
    plan_type: Literal["token", "request"]

class SessionCreate(SessionBase):
    rate_limit_rpm: Optional[int] = 15
    rate_limit_rpd: Optional[int] = 1500
    total_requests_limit: Optional[int] = None
    total_token_limit: Optional[int] = None

class SessionUpdate(BaseModel):
    rate_limit_rpm: Optional[int] = None
    rate_limit_rpd: Optional[int] = None
    total_requests_limit: Optional[int] = None
    total_token_limit: Optional[int] = None
    is_active: Optional[bool] = None

class Session(SessionBase):
    id: int
    session_token: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    is_active: bool
    rate_limit_rpm: int
    rate_limit_rpd: int
    total_requests_limit: Optional[int]
    total_token_limit: Optional[int]
    request_count: int
    token_count: int

    class Config:
        orm_mode = True

class ApiLimitConfig(BaseModel):
    total_requests_limit: int = Field(..., gt=0, description="Total number of API requests allowed")

class TokenLimitConfig(BaseModel):
    total_token_limit: int = Field(..., gt=0, description="Total number of tokens allowed")

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[MessageBase]] = []

class ChatResponse(BaseModel):
    content: str
    latency_ms: Optional[int] = None
    requests_remaining: Optional[int] = None
    tokens_remaining: Optional[int] = None
    token_usage: Optional[int] = None
    session_active: bool = True