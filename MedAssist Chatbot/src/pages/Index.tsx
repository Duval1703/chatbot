import { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import LandingPage from '@/components/LandingPage';
import ChatInterface from '@/components/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';

type AppState = 'loading' | 'landing' | 'chat';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setAppState('chat');
      } else {
        setAppState('landing');
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleSpinnerComplete = () => {
    // Will be handled by useEffect
  };

  const handleGetStarted = () => {
    // Authentication will be handled in LandingPage
    // Once authenticated, useEffect will update appState
  };

  const handleSignOut = () => {
    setAppState('landing');
  };

  return (
    <>
      {appState === 'loading' && <Spinner onComplete={handleSpinnerComplete} />}
      {appState === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {appState === 'chat' && <ChatInterface onSignOut={handleSignOut} />}
    </>
  );
};

export default Index;