from __future__ import annotations

from pydantic import BaseModel, Field
from datetime import datetime


class JobCreateResponse(BaseModel):
    job_id: int
    status: str
    message: str


class JobStatusResponse(BaseModel):
    job_id: int
    status: str
    filename: str
    content_type: str
    error: str | None = None
    created_at: datetime
    updated_at: datetime


class TexUpdateRequest(BaseModel):
    tex: str = Field(..., min_length=1)
