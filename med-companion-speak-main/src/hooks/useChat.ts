import { useState, useCallback, useEffect } from 'react';
import { apiService, ChatMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: string;
}

export interface ChatSession {
  id: number;
  session_name: string;
  created_at: string;
  message_count: number;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [originalMessages, setOriginalMessages] = useState<Message[]>([]); // Store original untranslated messages
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await apiService.getChatHistory();
      setChatHistory(history);
    } catch (error: any) {
      toast({
        title: "Failed to load history",
        description: error.message || "Could not load chat history.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  const sendMessage = useCallback(async (content: string, language: string = 'english', shouldTranslate: boolean = false) => {
    if (!content.trim()) return;

    let processedContent = content;
    
    // Translate user message if needed (from current language to English for AI)
    if (shouldTranslate && language !== 'english') {
      try {
        processedContent = await apiService.translateText(content, language, 'english');
      } catch (error) {
        console.warn('Translation failed, using original text:', error);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setOriginalMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const chatData: ChatMessage = {
        message: processedContent, // Send translated version to AI
        language: language, // Keep original language for storage
        session_id: currentSessionId || undefined
      };

      const response = await apiService.sendMessage(chatData);
      
      // Update session ID if this is a new session
      if (!currentSessionId) {
        setCurrentSessionId(response.session_id);
      }

      let botResponse = response.response;
      
      // Translate bot response back to user's language if needed
      if (shouldTranslate && language !== 'english') {
        try {
          botResponse = await apiService.translateText(response.response, 'english', language);
        } catch (error) {
          console.warn('Translation failed, using original response:', error);
        }
      }

      const botMessage: Message = {
        id: response.message_id.toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        language
      };

      setMessages(prev => [...prev, botMessage]);
      setOriginalMessages(prev => [...prev, {
        ...botMessage,
        content: response.response, // Store original AI response
        language: 'english' // AI always responds in English originally
      }]);
      
      // Refresh chat history to include new session
      if (!currentSessionId) {
        loadChatHistory();
      }
    } catch (error: any) {
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });

      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having technical difficulties right now. Please try again later or consult a healthcare professional if you have urgent medical concerns.",
        sender: 'bot',
        timestamp: new Date(),
        language
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, toast, loadChatHistory]);

  const loadSession = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    try {
      const sessionData = await apiService.getSessionMessages(sessionId);
      const sessionMessages: Message[] = sessionData.messages.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
        language: msg.language
      }));
      
      setMessages(sessionMessages);
      setOriginalMessages(sessionMessages); // Store as original messages
      setCurrentSessionId(sessionId);
      
      toast({
        title: "Session Loaded",
        description: `Loaded ${sessionMessages.length} messages from ${sessionData.session.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to load session",
        description: error.message || "Could not load chat session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      await apiService.deleteSession(sessionId);
      
      // Remove from history
      setChatHistory(prev => prev.filter(session => session.id !== sessionId));
      
      // If current session was deleted, start new session
      if (currentSessionId === sessionId) {
        startNewSession();
      }
      
      toast({
        title: "Session Deleted",
        description: "Chat session has been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete session",
        description: error.message || "Could not delete chat session.",
        variant: "destructive"
      });
    }
  }, [currentSessionId, toast]);

  const startNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setOriginalMessages([]);
  }, []);

  const translateAllMessages = useCallback(async (targetLanguage: string) => {
    if (originalMessages.length === 0 || isTranslating) return;
    
    // Check if messages are already in target language
    const needsTranslation = originalMessages.some(msg => msg.language !== targetLanguage);
    if (!needsTranslation) {
      console.log('Messages already in target language');
      return;
    }
    
    setIsTranslating(true);
    try {
      const translatedMessages = await Promise.all(
        originalMessages.map(async (message) => {
          // Skip welcome messages and already translated messages
          if (message.id === '1' || message.language === targetLanguage) {
            return {
              ...message,
              language: targetLanguage
            };
          }
          
          try {
            const translatedContent = await apiService.translateText(
              message.content, 
              message.language, 
              targetLanguage
            );
            return {
              ...message,
              content: translatedContent,
              language: targetLanguage
            };
          } catch (error) {
            console.warn(`Failed to translate message ${message.id}:`, error);
            return {
              ...message,
              language: targetLanguage // Still update language even if translation fails
            };
          }
        })
      );
      
      setMessages(translatedMessages);
    } catch (error) {
      console.error('Failed to translate messages:', error);
      toast({
        title: "Translation Failed",
        description: "Could not translate chat messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  }, [originalMessages, isTranslating, toast]);

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    loadChatHistory,
    loadSession,
    deleteSession,
    startNewSession,
    translateAllMessages,
    isTranslating,
    currentSessionId,
    chatHistory,
    isLoadingHistory
  };
};
