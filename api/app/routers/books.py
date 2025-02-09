from fastapi import APIRouter, HTTPException, status
from typing import List
from ..schemas.book import BookCreate, BookUpdate, Book
from ..database import supabase
from uuid import UUID

router = APIRouter(
    prefix="/books",
    tags=["books"]
)

@router.post("/", response_model=Book)
async def create_book(book: BookCreate, user_id: UUID = None):  # user_id will be from auth
    try:
        data = supabase.table('books').insert({
            **book.model_dump(),
            'user_id': str(user_id)
        }).execute()
        
        if not data.data:
            raise HTTPException(status_code=400, detail="Failed to create book")
        
        return data.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Book])
async def get_books(user_id: UUID = None):
    try:
        data = supabase.table('books').select('*').eq('user_id', str(user_id)).execute()
        return data.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{book_id}", response_model=Book)
async def get_book(book_id: UUID, user_id: UUID = None):
    try:
        data = supabase.table('books').select('*').eq('id', str(book_id)).eq('user_id', str(user_id)).execute()
        if not data.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return data.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{book_id}", response_model=Book)
async def update_book(book_id: UUID, book: BookUpdate, user_id: UUID = None):
    try:
        data = supabase.table('books').update(
            book.model_dump(exclude_unset=True)
        ).eq('id', str(book_id)).eq('user_id', str(user_id)).execute()
        
        if not data.data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        return data.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: UUID, user_id: UUID = None):
    try:
        data = supabase.table('books').delete().eq('id', str(book_id)).eq('user_id', str(user_id)).execute()
        if not data.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))