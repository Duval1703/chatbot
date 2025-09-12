import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useTextToSpeech = (language: string = 'en-US') => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Language mapping for speech synthesis
  const getLanguageCode = useCallback((lang: string) => {
    const languageMap: { [key: string]: string } = {
      'english': 'en-US',
      'french': 'fr-FR',
      'ewondo': 'fr-FR', // Fallback to French for Cameroon languages
      'douala': 'fr-FR',
      'bassa': 'fr-FR'
    };
    return languageMap[lang] || 'en-US';
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech. Please try using a modern browser.",
        variant: "destructive"
      });
      return;
    }

    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // Wait a bit for the cancellation to complete
      setTimeout(() => speakText(text), 100);
      return;
    }

    speakText(text);
  }, [isSupported, language, getLanguageCode, toast]);

  const speakText = useCallback((text: string) => {
    if (!text.trim()) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set language with better voice selection
      const langCode = getLanguageCode(language);
      utterance.lang = langCode;
      
      // Set voice properties - optimized for medical content
      utterance.rate = 0.8; // Slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Enhanced voice selection for better French pronunciation
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice = null;
      
      // First, try to find an exact language match
      preferredVoice = voices.find(voice => 
        voice.lang === langCode && !voice.localService
      );
      
      // If no exact match, try language prefix with online voices
      if (!preferredVoice) {
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith(langCode.split('-')[0]) && !voice.localService
        );
      }
      
      // Fall back to any voice matching the language prefix
      if (!preferredVoice) {
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith(langCode.split('-')[0])
        );
      }
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Event listeners with improved error handling
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        
        // Don't show error toast for 'interrupted' errors (user stopped speech)
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event.error);
          toast({
            title: "Text-to-Speech Error",
            description: `Speech failed: ${event.error}. Try again or check your browser settings.`,
            variant: "destructive"
          });
        }
      };

      // Start speaking with a small delay to ensure clean state
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          window.speechSynthesis.speak(utterance);
        }
      }, 50);

    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "Failed to read the text aloud. Please try again.",
        variant: "destructive"
      });
    }
  }, [language, getLanguageCode, toast]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  const toggle = useCallback((text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop,
    toggle,
    isSpeaking,
    isSupported
  };
};
