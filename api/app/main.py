from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers.book_analysis import router as book_analysis_router
from .routers.auth import router as auth_router
from .routers.books import router as books_router
from .database import supabase

app = FastAPI(title="Book Tracker API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Viteのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# エラーハンドリング
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

# Supabaseセッション検証ミドルウェア
@app.middleware("http")
async def validate_supabase_session(request: Request, call_next):
    # /auth エンドポイントはセッション検証をスキップ
    if request.url.path.startswith("/api/auth"):
        return await call_next(request)

    # ヘルスチェックもスキップ
    if request.url.path == "/health":
        return await call_next(request)

    try:
        # user-idヘッダーがある場合は検証
        user_id = request.headers.get("user-id")
        if user_id:
            session = supabase.auth.get_session()
            if not session or not session.user or session.user.id != user_id:
                raise HTTPException(status_code=401, detail="Invalid session")

        return await call_next(request)
    except Exception as e:
        return JSONResponse(
            status_code=401,
            content={"detail": "Unauthorized"}
        )

# ルーターの登録
app.include_router(auth_router, prefix="/api/auth")
app.include_router(books_router, prefix="/api/books")
app.include_router(book_analysis_router, prefix="/api/book-analysis")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to Book Tracker API"}