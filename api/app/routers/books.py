from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from ..database import supabase
import os

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
        book_data = book.dict()
        if book_data.get('last_read_date'):
            book_data['last_read_date'] = book_data['last_read_date'].isoformat()
        
        response = supabase.table('books').insert({
            **book_data,
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }).execute()
        return response.data[0]
    except Exception as e:
        print(e)
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

@router.post("/img-upload")
async def upload_book_image(
    file: UploadFile = File(...),
):
    try:
        # Generate unique filename with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{timestamp}{file_extension}"
        
        # Create storage path
        storage_path = f"{unique_filename}"
        
        # Read file content
        content = await file.read()
        
        # Upload to Supabase Storage
        response = supabase.storage.from_("book-covers").upload(
            storage_path,
            content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        file_url = supabase.storage.from_("book-covers").get_public_url(storage_path)
        
        return {
            "filename": unique_filename,
            "url": file_url
        }
    except Exception as e:
        print(f"Error uploading image: {str(e)}")  # デバッグ用ログ
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