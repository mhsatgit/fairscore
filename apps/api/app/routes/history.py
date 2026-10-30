"""
History Routes - Prediction history management
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import logging
from pathlib import Path

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

DB_PATH = settings.API_DIR / "predictions.db"

# Ensure the directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


class PredictionHistory(BaseModel):
    """Schema for prediction history"""
    id: Optional[int] = None
    timestamp: str
    prediction: str
    probability: float
    risk_score: int
    risk_level: str
    model: str


def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            prediction TEXT NOT NULL,
            probability REAL NOT NULL,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            model TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()


# Initialize database on import
init_db()


@router.post("/history")
async def add_prediction(prediction: PredictionHistory):
    """Add a prediction to history"""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Set timestamp if not provided
        if not prediction.timestamp:
            prediction.timestamp = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO predictions (timestamp, prediction, probability, risk_score, risk_level, model)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            prediction.timestamp,
            prediction.prediction,
            prediction.probability,
            prediction.risk_score,
            prediction.risk_level,
            prediction.model
        ))
        
        conn.commit()
        prediction.id = cursor.lastrowid
        conn.close()
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error adding prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=List[PredictionHistory])
async def get_prediction_history(limit: int = 50):
    """Get prediction history"""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, timestamp, prediction, probability, risk_score, risk_level, model
            FROM predictions
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [
            PredictionHistory(
                id=row[0],
                timestamp=row[1],
                prediction=row[2],
                probability=row[3],
                risk_score=row[4],
                risk_level=row[5],
                model=row[6]
            )
            for row in rows
        ]
        
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history")
async def clear_history():
    """Clear prediction history"""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        cursor.execute('DELETE FROM predictions')
        conn.commit()
        conn.close()
        
        return {"message": "History cleared"}
        
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
