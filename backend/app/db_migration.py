from sqlalchemy import Column, Integer, text
from app.data import Base, engine, SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_total_token_limit_column():
    try:
        conn = engine.connect()

        result = conn.execute(text("PRAGMA table_info(chat_sessions)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'total_token_limit' not in columns:
            logger.info("Adding total_token_limit column to chat_sessions table...")
            conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN total_token_limit INTEGER"))
            conn.commit()
            logger.info("Column added successfully!")
        else:
            logger.info("Column total_token_limit already exists.")
        
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error adding column: {str(e)}")
        return False

if __name__ == "__main__":
    add_total_token_limit_column()