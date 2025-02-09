from pydantic import BaseModel

class BookAnalysisRequest(BaseModel):
    image_base64: str

class BookAnalysisResponse(BaseModel):
    title: str
    author: str
    category: str | None = None