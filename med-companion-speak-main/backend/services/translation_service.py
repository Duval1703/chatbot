import aiohttp
import asyncio
from typing import Optional
from urllib.parse import quote

class TranslationService:
    def __init__(self):
        self.session = None
    
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using free translation services"""
        
        # Handle local languages (placeholder for now)
        if source_lang in ["ewondo", "douala", "bassa"] or target_lang in ["ewondo", "douala", "bassa"]:
            return await self._translate_local_language(text, source_lang, target_lang)
        
        # Handle English <-> French translation
        if (source_lang == "english" and target_lang == "french") or (source_lang == "french" and target_lang == "english"):
            return await self._translate_free_service(text, source_lang, target_lang)
        
        # If same language, return original
        if source_lang == target_lang:
            return text
        
        return text  # Fallback
    
    async def _translate_free_service(self, text: str, source_lang: str, target_lang: str) -> str:
        """Use free translation service (Google Translate API alternative)"""
        try:
            # Convert language codes
            lang_map = {
                "english": "en",
                "french": "fr"
            }
            
            source_code = lang_map.get(source_lang, "en")
            target_code = lang_map.get(target_lang, "fr")
            
            # Using MyMemory API (free translation service)
            session = await self.get_session()
            url = f"https://api.mymemory.translated.net/get"
            params = {
                "q": text,
                "langpair": f"{source_code}|{target_code}"
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("responseStatus") == 200:
                        return data["responseData"]["translatedText"]
                    else:
                        raise Exception("Translation service error")
                else:
                    raise Exception(f"HTTP error: {response.status}")
                    
        except Exception as e:
            print(f"Translation error: {e}")
            # Fallback to simple dictionary translation for common medical terms
            return self._fallback_translation(text, source_lang, target_lang)
    
    async def _translate_local_language(self, text: str, source_lang: str, target_lang: str) -> str:
        """Placeholder for local language translation"""
        # This is where you would integrate your local language model
        # For now, return a placeholder message
        
        local_messages = {
            "ewondo": "Mbok nga ve ayos - Je vous comprends (I understand you)",
            "douala": "Na se ye - Je vous comprends (I understand you)", 
            "bassa": "M si i - Je vous comprends (I understand you)"
        }
        
        if target_lang in local_messages:
            return f"{local_messages[target_lang]}. [Translation to {target_lang} not yet fully implemented]"
        
        return self._fallback_translation(text, source_lang, target_lang)
    
    def _fallback_translation(self, text: str, source_lang: str, target_lang: str) -> str:
        """Simple fallback translation for common medical terms"""
        
        # Basic medical translation dictionary
        translations = {
            ("english", "french"): {
                "hello": "bonjour",
                "pain": "douleur",
                "fever": "fièvre",
                "headache": "mal de tête",
                "doctor": "docteur",
                "medicine": "médicament",
                "hospital": "hôpital",
                "help": "aide",
                "thank you": "merci",
                "symptoms": "symptômes"
            },
            ("french", "english"): {
                "bonjour": "hello",
                "douleur": "pain",
                "fièvre": "fever",
                "mal de tête": "headache",
                "docteur": "doctor",
                "médicament": "medicine",
                "hôpital": "hospital",
                "aide": "help",
                "merci": "thank you",
                "symptômes": "symptoms"
            }
        }
        
        translation_dict = translations.get((source_lang, target_lang), {})
        
        # Simple word replacement
        result = text.lower()
        for source_word, target_word in translation_dict.items():
            result = result.replace(source_word, target_word)
        
        return result.capitalize() if result != text.lower() else text
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()