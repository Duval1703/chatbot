# MediChat AI Model Directory

This directory is intended for your local language model files.

## Model Setup

Place your `tinyllama-1.1b-chat-v1.0.Q4_K_M` model files in this directory.

The model should be accessible by your FastAPI backend for chat completions.

## File Structure

```
model/
├── README.md (this file)
├── tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf (your model file)
└── config.json (model configuration if needed)
```

## Integration Notes

Your FastAPI backend should:
1. Load the model from this directory
2. Handle multi-language inputs (English, French, Ewondo, Douala, Bassa)
3. Provide medical assistance with appropriate disclaimers
4. Return responses in the requested language

## API Endpoints Expected

The frontend expects these endpoints:
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/history` - Get user's chat history
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/translate` - Translation service

## Medical AI Guidelines

Ensure your model responses:
- Include appropriate medical disclaimers
- Suggest consulting healthcare professionals
- Provide educational information only
- Are culturally appropriate for Cameroon context