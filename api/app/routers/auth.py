from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
from ..database import supabase

router = APIRouter()

class User(BaseModel):
    id: str
    email: str

class AuthCredentials(BaseModel):
    email: str
    password: str

@router.post("/signin")
async def sign_in(credentials: AuthCredentials, response: Response):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        user = auth_response.user
        if not user:
            raise HTTPException(
                status_code=401,
                detail="メールアドレスまたはパスワードが正しくありません"
            )

        # Set session cookie
        session = auth_response.session
        if session:
            response.set_cookie(
                key="sb-access-token",
                value=session.access_token,
                httponly=True,
                samesite='lax',
                secure=False  # 開発環境ではfalse
            )
            response.set_cookie(
                key="sb-refresh-token",
                value=session.refresh_token,
                httponly=True,
                samesite='lax',
                secure=False  # 開発環境ではfalse
            )

        return User(id=user.id, email=user.email)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="メールアドレスまたはパスワードが正しくありません"
        )

@router.post("/signup")
async def sign_up(credentials: AuthCredentials):
    try:
        auth_response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="アカウント作成に失敗しました"
            )

        return {"message": "アカウントが作成されました"}
    except Exception as e:
        if "User already registered" in str(e):
            raise HTTPException(
                status_code=400,
                detail="このメールアドレスは既に使用されています"
            )
        raise HTTPException(
            status_code=400,
            detail="アカウント作成に失敗しました"
        )

@router.get("/session")
async def get_session(response: Response):
    try:
        session = supabase.auth.get_session()
        if not session or not session.user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        user = session.user
        return User(id=user.id, email=user.email)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.post("/signout")
async def sign_out(response: Response):
    try:
        supabase.auth.sign_out()
        response.delete_cookie("sb-access-token")
        response.delete_cookie("sb-refresh-token")
        return {"message": "ログアウトしました"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="ログアウトに失敗しました"
        )