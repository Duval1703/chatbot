import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Mic, MicOff, History, LogOut, Languages, Bot, User, Trash2, Plus, Volume2, VolumeX, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { apiService } from '@/lib/api';

interface ChatInterfaceProps {
  onSignOut: () => void;
}

const ChatInterface = ({ onSignOut }: ChatInterfaceProps) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { messages, setMessages, isLoading, sendMessage, loadChatHistory, loadSession, deleteSession, startNewSession, translateAllMessages, isTranslating, chatHistory, isLoadingHistory } = useChat();
  const { isListening, transcript, isSupported, toggleListening, resetTranscript } = useSpeechToText(language);
  const { speak, stop, isSpeaking } = useTextToSpeech(language);
  const [translateContent, setTranslateContent] = useState(false);

  // Use transcript from speech-to-text when available
  useEffect(() => {
    if (transcript && !isListening) {
      setCurrentMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Add welcome message when starting new session or language changes
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: '1',
        content: t('welcomeMessage'),
        sender: 'bot' as const,
        timestamp: new Date(),
        language: language
      };
      // Use a timeout to ensure state is properly set
      setTimeout(() => {
        setMessages([welcomeMessage]);
      }, 100);
    }
  }, [messages.length, t, language]);

  // Translate messages when language changes (but not on initial load)
  const [hasTranslated, setHasTranslated] = useState(false);
  const [previousLanguage, setPreviousLanguage] = useState(language);
  
  useEffect(() => {
    if (language !== previousLanguage && messages.length > 0 && !isTranslating) {
      translateAllMessages(language);
      setPreviousLanguage(language);
      setHasTranslated(true);
    }
  }, [language, previousLanguage, messages.length, translateAllMessages, isTranslating]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const messageToSend = currentMessage;
    setCurrentMessage('');
    // Enable translation for non-English languages
    const shouldTranslate = language !== 'english';
    await sendMessage(messageToSend, language, shouldTranslate);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isSupported) {
      toggleListening();
    } else {
      toast({
        title: t('speechNotSupported'),
        description: "Your browser doesn't support speech recognition. Please try using Chrome or Edge.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MediChat AI
              </h1>
              <p className="text-sm text-muted-foreground">{t('yourMedicalAssistant')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                  loadChatHistory();
                }
              }}
            >
              <History className="w-4 h-4" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg">
              <UserCircle className="w-6 h-6 text-primary" />
              <div className="text-sm">
                <p className="font-medium">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={() => {
                logout();
                onSignOut();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('signOut')}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isTranslating && (
              <div className="text-center p-4">
                <div className="inline-flex items-center space-x-2 text-primary">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Translating messages...</span>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'bg-white border-border'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {message.sender === 'bot' && (
                        <Bot className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      )}
                      {message.sender === 'user' && (
                        <User className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${
                          message.sender === 'user' ? 'text-white' : 'text-foreground'
                        }`}>
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${
                            message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString()} - {
                              availableLanguages.find(l => l.value === message.language)?.label
                            }
                          </p>
                          {message.sender === 'bot' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => isSpeaking ? stop() : speak(message.content)}
                              title={isSpeaking ? "Stop reading" : "Read aloud"}
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3 h-3 text-destructive" />
                              ) : (
                                <Volume2 className="w-3 h-3 text-muted-foreground hover:text-primary" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-white border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-6 h-6 text-primary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-white p-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('typeMessage', { language: availableLanguages.find(l => l.value === language)?.label || 'English' })}
                  disabled={isLoading}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleVoiceToggle}
                  disabled={isLoading}
                  title={isListening ? 'Stop' : 'Start'}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                variant="medical"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t('disclaimer')}
            </p>
          </div>
        </div>

        {/* Chat History Sidebar */}
        {showHistory && (
          <div className="w-80 border-l border-border bg-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{t('chatHistory')}</h3>
              <Button size="icon" variant="outline" onClick={() => startNewSession()} title={t('newChat')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 overflow-y-auto">
              {isLoadingHistory && (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}

              {!isLoadingHistory && chatHistory.length === 0 && (
                <p className="text-sm text-muted-foreground">No chat history yet.</p>
              )}

              {chatHistory.map((session) => (
                <Card key={session.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div onClick={() => loadSession(session.id)} className="flex-1 pr-2">
                      <p className="font-medium text-sm truncate">{session.session_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleString()} • {session.message_count} messages
                      </p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="opacity-0 group-hover:opacity-100" 
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      title={t('deleteChat')}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;