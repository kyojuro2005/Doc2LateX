from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base


class ConversionJob(Base):
    __tablename__ = 'conversion_jobs'

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(50), nullable=False)
    status = Column(String(50), default='pending', nullable=False)
    source_path = Column(String(1024), nullable=False)
    tex_path = Column(String(1024), nullable=True)
    pdf_path = Column(String(1024), nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
