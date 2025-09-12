from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import TranslationCache
from services.translation_service import TranslationService

router = APIRouter()
translation_service = TranslationService()

class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str

class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    cached: bool = False

@router.post("/", response_model=TranslationResponse)
async def translate_text(
    request: TranslationRequest,
    db: Session = Depends(get_db)
):
    try:
        # Check cache first
        cached_translation = db.query(TranslationCache).filter(
            TranslationCache.source_text == request.text,
            TranslationCache.source_language == request.source_language,
            TranslationCache.target_language == request.target_language
        ).first()
        
        if cached_translation:
            return TranslationResponse(
                translated_text=cached_translation.translated_text,
                source_language=request.source_language,
                target_language=request.target_language,
                cached=True
            )
        
        # Translate text
        translated_text = await translation_service.translate(
            text=request.text,
            source_lang=request.source_language,
            target_lang=request.target_language
        )
        
        # Cache the translation
        cache_entry = TranslationCache(
            source_text=request.text,
            source_language=request.source_language,
            target_language=request.target_language,
            translated_text=translated_text,
            translation_service="google_translate"
        )
        db.add(cache_entry)
        db.commit()
        
        return TranslationResponse(
            translated_text=translated_text,
            source_language=request.source_language,
            target_language=request.target_language,
            cached=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    return {
        "languages": [
            {"code": "english", "name": "English"},
            {"code": "french", "name": "French"},
            {"code": "ewondo", "name": "Ewondo"},
            {"code": "douala", "name": "Douala"},
            {"code": "bassa", "name": "Bassa"}
        ]
    }