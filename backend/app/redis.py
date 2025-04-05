from redis import Redis
from datetime import datetime
import time
from fastapi import HTTPException, status
from typing import Optional

from app.core import settings

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

class RedisTokenBucket:
    @staticmethod
    def _get_token_bucket_key(session_token: str) -> str:
        """Generate a key for token bucket in Redis"""
        return f"token_bucket:{session_token}"
    
    @staticmethod
    def _get_token_usage_key(session_token: str) -> str:
        """Generate a key for total token usage in Redis"""
        return f"token_usage:{session_token}"
    
    @staticmethod
    def _get_minute_key(session_token: str) -> str:
        """Generate a key for per minute token tracking"""
        current_minute = int(time.time() / 60)
        return f"tokenrate:tpm:{session_token}:{current_minute}"
    
    @staticmethod
    def _get_day_key(session_token: str) -> str:
        """Generate a key for per day token tracking"""
        today = datetime.now().strftime("%Y-%m-%d")
        return f"tokenrate:tpd:{session_token}:{today}"
    
    @classmethod
    def initialize_token_bucket(cls, session_token: str, total_token_limit: Optional[int] = None):
        """Initialize a token bucket for a session"""
        bucket_key = cls._get_token_bucket_key(session_token)
        usage_key = cls._get_token_usage_key(session_token)
        
        pipe = redis_client.pipeline()
        pipe.hset(bucket_key, "capacity", 1000000)  
        pipe.hset(bucket_key, "tokens", 1000000)    
        pipe.hset(bucket_key, "last_refill", time.time())
        
        if total_token_limit is not None:
            pipe.hset(bucket_key, "total_limit", total_token_limit)

        pipe.set(usage_key, 0)
        
        pipe.execute()
    
    @classmethod
    def check_token_limit(cls, session_token: str, tokens_to_use: int):
        """
        Check if token usage is within limits and consume tokens
        Returns the total tokens used so far
        """
        bucket_key = cls._get_token_bucket_key(session_token)
        usage_key = cls._get_token_usage_key(session_token)
        
        bucket = redis_client.hgetall(bucket_key)
        
        if not bucket:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token bucket not initialized"
            )
        
        capacity = int(bucket.get("capacity", 1000000))
        current_tokens = float(bucket.get("tokens", 0))
        last_refill = float(bucket.get("last_refill", 0))
        total_limit = int(bucket.get("total_limit", 0)) if "total_limit" in bucket else None
        
        current_usage = int(redis_client.get(usage_key) or 0)
        
        if total_limit is not None and current_usage + tokens_to_use > total_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Total token limit of {total_limit} exceeded"
            )
        
        now = time.time()
        time_elapsed = now - last_refill
        tokens_to_add = (time_elapsed * (capacity / 60))
        
        new_tokens = min(capacity, current_tokens + tokens_to_add)

        if new_tokens < tokens_to_use:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Token rate limit exceeded. Available: {int(new_tokens)}, Requested: {tokens_to_use}"
            )
        
        pipe = redis_client.pipeline()
        pipe.hset(bucket_key, "tokens", new_tokens - tokens_to_use)
        pipe.hset(bucket_key, "last_refill", now)
        
        pipe.incrby(usage_key, tokens_to_use)
        
        minute_key = cls._get_minute_key(session_token)
        day_key = cls._get_day_key(session_token)
        
        pipe.incrby(minute_key, tokens_to_use)
        pipe.expire(minute_key, 120)  
        
        pipe.incrby(day_key, tokens_to_use)
        pipe.expire(day_key, 86400 + 3600)  
        
        pipe.execute()

        return current_usage + tokens_to_use
    
    @classmethod
    def get_token_usage(cls, session_token: str):
        """Get current token usage statistics"""
        usage_key = cls._get_token_usage_key(session_token)
        bucket_key = cls._get_token_bucket_key(session_token)
        
        total_usage = int(redis_client.get(usage_key) or 0)

        bucket = redis_client.hgetall(bucket_key)
        total_limit = int(bucket.get("total_limit", 0)) if "total_limit" in bucket else None

        minute_key = cls._get_minute_key(session_token)
        minute_usage = int(redis_client.get(minute_key) or 0)

        day_key = cls._get_day_key(session_token)
        day_usage = int(redis_client.get(day_key) or 0)
        
        return {
            "total_usage": total_usage,
            "total_limit": total_limit,
            "minute_usage": minute_usage,
            "day_usage": day_usage,
            "tokens_remaining": total_limit - total_usage if total_limit else None
        }