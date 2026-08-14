from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from backend.database import Base

def get_ist_now():
    # IST is UTC + 5:30
    ist_offset = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist_offset)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=get_ist_now)

    predictions = relationship("PredictionRecord", back_populates="user")

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_ist_now)
    
    crop_type = Column(String, index=True)
    soil_type = Column(String)
    soil_ph = Column(Float)
    nitrogen = Column(Float)
    phosphorus = Column(Float)
    potassium = Column(Float)
    temperature = Column(Float)
    rainfall = Column(Float)
    humidity = Column(Float)
    irrigation_level = Column(String)
    sunshine_hours = Column(Float)
    
    predicted_yield_kg_acre = Column(Float)
    predicted_yield_tons_ha = Column(Float)
    recommended_crop = Column(String)
    fertilizer_recommendation = Column(Text)
    irrigation_recommendation = Column(Text)
    optimization_summary = Column(Text)

    user = relationship("User", back_populates="predictions")

