import os
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from ..schemas.book_analysis import BookAnalysisRequest, BookAnalysisResponse
from openai import OpenAI
import base64
import json
from pydantic import BaseModel, Field
from enum import Enum
load_dotenv()

router = APIRouter()

# OpenAI APIキーの設定
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class BookCategory(Enum):
    BUSINESS = "ビジネス"
    TECHNOLOGY = "技術書" 
    NOVEL = "小説"
    SELF_HELP = "自己啓発"
    HISTORY = "歴史"
    SCIENCE = "科学"
    OTHER = "その他"
    
class BookModel(BaseModel):
    title: str = Field(..., description="本のタイトル")
    author: str = Field(..., description="著者名")
    category: BookCategory = Field(..., description="カテゴリー")

@router.post("/analyze", response_model=BookModel)
async def analyze_book_cover(request: BookAnalysisRequest):
    try:
        # Base64画像をデコード
        image_data = base64.b64decode(request.image_base64.split(',')[1] if ',' in request.image_base64 else request.image_base64)
        
        # OpenAI APIを呼び出して画像を解析
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "この本の表紙から本のタイトルと著者名を抽出してください。できるだけ正確に文字を認識してください。以下のJSON形式で返してください(マークダウンは使わないでください): {\"title\": \"タイトル\", \"author\": \"著者名\", \"category\": \"カテゴリー\"}"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64.b64encode(image_data).decode('utf-8')}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ]

        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=messages,
            response_format=BookModel,
            max_tokens=4096,
        )
        response_dict = json.loads(response.choices[0].message.content)
        book_info = BookModel(**response_dict)
        return BookAnalysisResponse(
            title=book_info.title,
            author=book_info.author,
            category=book_info.category
        )

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")