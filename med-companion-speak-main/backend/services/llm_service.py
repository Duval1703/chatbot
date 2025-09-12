import os
from typing import List, Dict, Any
from llama_cpp import Llama
from config import settings

class LLMService:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the local LLaMA model"""
        try:
            if os.path.exists(settings.model_path):
                self.model = Llama(
                    model_path=settings.model_path,
                    n_ctx=2048,  # Context window
                    n_threads=4,  # Number of CPU threads
                    verbose=False
                )
                print(f"Model loaded successfully from {settings.model_path}")
            else:
                print(f"Model file not found at {settings.model_path}")
                self.model = None
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    async def generate_response(
        self,
        message: str,
        language: str = "english",
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate AI response using the local model"""
        
        if self.model is None:
            return self._get_fallback_response(message, language)
        
        try:
            # Build conversation context
            system_prompt = self._get_system_prompt(language)
            
            # Format the prompt with context
            prompt = self._format_prompt(system_prompt, message, chat_history or [])
            
            # Generate response
            response = self.model(
                prompt,
                max_tokens=512,
                temperature=0.7,
                top_p=0.9,
                stop=["Human:", "Assistant:", "\n\n"],
                echo=False
            )
            
            # Extract and clean the response
            generated_text = response['choices'][0]['text'].strip()
            
            # Add medical disclaimer if needed
            if self._needs_medical_disclaimer(message):
                disclaimer = self._get_medical_disclaimer(language)
                generated_text += f"\n\n{disclaimer}"
            
            return generated_text
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return self._get_fallback_response(message, language)
    
    def _get_system_prompt(self, language: str) -> str:
        """Get system prompt based on language"""
        prompts = {
            "english": """You are MediChat AI, a helpful medical assistant for patients in Cameroon. 
You provide educational health information and support, but you are not a replacement for professional medical advice.
Always be compassionate, clear, and culturally sensitive. Encourage patients to consult healthcare professionals for medical concerns.
Keep responses concise and easy to understand.""",
            
            "french": """Vous êtes MediChat AI, un assistant médical utile pour les patients au Cameroun.
Vous fournissez des informations éducatives sur la santé et un soutien, mais vous ne remplacez pas les conseils médicaux professionnels.
Soyez toujours compatissant, clair et culturellement sensible. Encouragez les patients à consulter des professionnels de la santé pour les préoccupations médicales.
Gardez les réponses concises et faciles à comprendre.""",
            
            "ewondo": "Vous êtes MediChat AI, assistant médical pour les patients. Répondez avec compassion et clarté.",
            "douala": "Vous êtes MediChat AI, assistant médical pour les patients. Répondez avec compassion et clarté.", 
            "bassa": "Vous êtes MediChat AI, assistant médical pour les patients. Répondez avec compassion et clarté."
        }
        
        return prompts.get(language, prompts["english"])
    
    def _format_prompt(self, system_prompt: str, message: str, chat_history: List[Dict[str, str]]) -> str:
        """Format the conversation prompt"""
        prompt = f"System: {system_prompt}\n\n"
        
        # Add chat history
        for msg in chat_history[-5:]:  # Last 5 messages for context
            role = "Human" if msg["role"] == "user" else "Assistant"
            prompt += f"{role}: {msg['content']}\n"
        
        # Add current message
        prompt += f"Human: {message}\nAssistant:"
        
        return prompt
    
    def _needs_medical_disclaimer(self, message: str) -> bool:
        """Check if message needs medical disclaimer"""
        medical_keywords = [
            "pain", "symptoms", "diagnosis", "treatment", "medicine", "medication",
            "doctor", "hospital", "illness", "disease", "infection", "fever",
            "douleur", "symptômes", "diagnostic", "traitement", "médicament",
            "docteur", "hôpital", "maladie", "infection", "fièvre"
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in medical_keywords)
    
    def _get_medical_disclaimer(self, language: str) -> str:
        """Get medical disclaimer in specified language"""
        disclaimers = {
            "english": "⚠️ This information is for educational purposes only. Please consult a qualified healthcare professional for medical advice, diagnosis, or treatment.",
            "french": "⚠️ Cette information est à des fins éducatives seulement. Veuillez consulter un professionnel de la santé qualifié pour des conseils médicaux, un diagnostic ou un traitement.",
            "ewondo": "⚠️ Ces informations sont à des fins éducatives. Consultez un professionnel de la santé.",
            "douala": "⚠️ Ces informations sont à des fins éducatives. Consultez un professionnel de la santé.",
            "bassa": "⚠️ Ces informations sont à des fins éducatives. Consultez un professionnel de la santé."
        }
        
        return disclaimers.get(language, disclaimers["english"])
    
    def _get_fallback_response(self, message: str, language: str) -> str:
        """Fallback response when model is not available"""
        responses = {
            "english": "I'm sorry, I'm having technical difficulties right now. Please try again later or consult a healthcare professional if you have urgent medical concerns.",
            "french": "Je suis désolé, j'ai des difficultés techniques en ce moment. Veuillez réessayer plus tard ou consulter un professionnel de la santé si vous avez des préoccupations médicales urgentes.",
            "ewondo": "Je suis désolé, j'ai des problèmes techniques. Réessayez plus tard.",
            "douala": "Je suis désolé, j'ai des problèmes techniques. Réessayez plus tard.",
            "bassa": "Je suis désolé, j'ai des problèmes techniques. Réessayez plus tard."
        }
        
        return responses.get(language, responses["english"])