from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..database import supabase

router = APIRouter()

class Book(BaseModel):
    id: str
    title: str
    author: str
    status: str
    category: Optional[str] = None
    cover_image: Optional[str] = None
    notes: Optional[str] = None
    last_read_date: Optional[datetime] = None
    user_id: str

class BookCreate(BaseModel):
    title: str
    author: str
    status: str
    category: Optional[str] = None
    cover_image: Optional[str] = None
    notes: Optional[str] = None
    last_read_date: Optional[datetime] = None

class BookUpdate(BaseModel):
    notes: Optional[str] = None
    status: Optional[str] = None
    last_read_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@router.get("", response_model=List[Book])
async def get_books(user_id: str = Header(..., alias="user-id")):
    try:
        response = supabase.table('books').select('*').eq('user_id', user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{book_id}", response_model=Book)
async def get_book(book_id: str, user_id: str = Header(..., alias="user-id")):
    try:
        response = supabase.table('books').select('*').eq('id', book_id).eq('user_id', user_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return response.data
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Book not found")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_book(book: BookCreate, user_id: str = Header(..., alias="user-id")):
    try:
        response = supabase.table('books').insert({
            **book.dict(),
            'user_id': user_id,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{book_id}/notes")
async def update_book_notes(
    book_id: str, 
    update: BookUpdate, 
    user_id: str = Header(..., alias="user-id")
):
    try:
        response = supabase.table('books').update({
            'notes': update.notes,
            'last_read_date': update.last_read_date,
            'updated_at': datetime.utcnow().isoformat(),
        }).eq('id', book_id).eq('user_id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return response.data[0]
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Book not found")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{book_id}/status")
async def update_book_status(
    book_id: str, 
    update: BookUpdate, 
    user_id: str = Header(..., alias="user-id")
):
    try:
        response = supabase.table('books').update({
            'status': update.status,
            'updated_at': update.updated_at or datetime.utcnow().isoformat(),
        }).eq('id', book_id).eq('user_id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return response.data[0]
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Book not found")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{book_id}/complete")
async def complete_book_notes(
    book_id: str, 
    update: BookUpdate, 
    user_id: str = Header(..., alias="user-id")
):
    try:
        response = supabase.table('books').update({
            'notes': update.notes,
            'status': '読了(ノート完成)' if update.status else None,
            'last_read_date': update.last_read_date,
            'updated_at': update.updated_at or datetime.utcnow().isoformat(),
        }).eq('id', book_id).eq('user_id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return response.data[0]
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Book not found")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{book_id}")
async def delete_book(book_id: str, user_id: str = Header(..., alias="user-id")):
    try:
        response = supabase.table('books').delete().eq('id', book_id).eq('user_id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return {"message": "Book deleted"}
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Book not found")
        raise HTTPException(status_code=500, detail=str(e))