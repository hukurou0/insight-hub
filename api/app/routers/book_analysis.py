import os
from fastapi import APIRouter, HTTPException
from ..schemas.book_analysis import BookAnalysisRequest, BookAnalysisResponse
import openai
import base64
from io import BytesIO

router = APIRouter()

# OpenAI APIキーの設定
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/analyze", response_model=BookAnalysisResponse)
async def analyze_book_cover(request: BookAnalysisRequest):
    try:
        # Base64画像をデコード
        image_data = base64.b64decode(request.image_base64.split(',')[1] if ',' in request.image_base64 else request.image_base64)
        
        # OpenAI APIを呼び出して画像を解析
        response = await openai.chat.completions.create(
            model="gpt-4o",
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
            ],
            max_tokens=300
        )

        content = response.choices[0].message.content
        if content:
            try:
                # JSONの部分を抽出して解析
                json_match = content.strip('`').strip()
                if json_match.startswith('json'):
                    json_match = json_match[4:]
                import json
                book_info = json.loads(json_match)
                return BookAnalysisResponse(
                    title=book_info["title"],
                    author=book_info["author"],
                    category=book_info.get("category")
                )
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"Failed to parse book info: {str(e)}")
        else:
            raise HTTPException(status_code=422, detail="No content in response")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")