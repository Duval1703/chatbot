from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os

from database import get_db
from models import User, ChatSession, Message
from routers.auth import get_current_user
from services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()

class ChatMessage(BaseModel):
    message: str
    language: str = "english"
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    session_id: int
    message_id: int

class ChatHistoryResponse(BaseModel):
    id: int
    session_name: str
    created_at: str
    message_count: int

@router.post("/", response_model=ChatResponse)
async def send_message(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get or create chat session
        if chat_message.session_id:
            session = db.query(ChatSession).filter(
                ChatSession.id == chat_message.session_id,
                ChatSession.user_id == current_user.id
            ).first()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            # Create new session with truncated message as name
            session_name = chat_message.message[:50] + "..." if len(chat_message.message) > 50 else chat_message.message
            session = ChatSession(
                user_id=current_user.id,
                session_name=session_name
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        
        # Save user message
        user_message = Message(
            session_id=session.id,
            user_id=current_user.id,
            content=chat_message.message,
            sender="user",
            language=chat_message.language
        )
        db.add(user_message)
        db.commit()
        
        # Get chat history for context
        recent_messages = db.query(Message).filter(
            Message.session_id == session.id
        ).order_by(Message.created_at.desc()).limit(10).all()
        
        # Generate AI response
        ai_response = await llm_service.generate_response(
            message=chat_message.message,
            language=chat_message.language,
            chat_history=[{
                "role": "assistant" if msg.sender == "bot" else "user",
                "content": msg.content
            } for msg in reversed(recent_messages[:-1])]  # Exclude the current message
        )
        
        # Save AI response
        bot_message = Message(
            session_id=session.id,
            user_id=current_user.id,
            content=ai_response,
            sender="bot",
            language=chat_message.language
        )
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)
        
        return ChatResponse(
            response=ai_response,
            session_id=session.id,
            message_id=bot_message.id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.get("/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatSession.is_active == True
    ).order_by(ChatSession.updated_at.desc()).all()
    
    history = []
    for session in sessions:
        message_count = db.query(Message).filter(Message.session_id == session.id).count()
        history.append(ChatHistoryResponse(
            id=session.id,
            session_name=session.session_name or f"Chat {session.id}",
            created_at=session.created_at.isoformat(),
            message_count=message_count
        ))
    
    return history

@router.get("/history/{session_id}")
async def get_session_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at.asc()).all()
    
    return {
        "session": {
            "id": session.id,
            "name": session.session_name,
            "created_at": session.created_at.isoformat()
        },
        "messages": [{
            "id": msg.id,
            "content": msg.content,
            "sender": msg.sender,
            "language": msg.language,
            "created_at": msg.created_at.isoformat()
        } for msg in messages]
    }

@router.delete("/history/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Soft delete
    session.is_active = False
    db.commit()
    
    return {"message": "Session deleted successfully"}