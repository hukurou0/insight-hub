from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: str
    status: str = "unread"
    category: Optional[str] = None
    cover_image: Optional[str] = None
    notes: Optional[str] = None
    last_read_date: Optional[datetime] = None

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    cover_image: Optional[str] = None
    notes: Optional[str] = None
    last_read_date: Optional[datetime] = None

class Book(BookBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True