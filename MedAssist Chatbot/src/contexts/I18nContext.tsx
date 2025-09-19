import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, TranslationKey } from '@/lib/translations';

interface I18nContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  translateText?: (text: string, targetLang?: string) => Promise<string>;
  availableLanguages: Array<{ value: string; label: string; }>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLanguage = 'english' 
}) => {
  const [language, setLanguageState] = useState<string>(() => {
    // Get language from localStorage or use default
    const saved = localStorage.getItem('medichat_language');
    return saved || defaultLanguage;
  });

  const availableLanguages = [
    { value: 'english', label: 'English' },
    { value: 'french', label: 'Français' },
    { value: 'ewondo', label: 'Ewondo' },
    { value: 'douala', label: 'Duala' },
    { value: 'bassa', label: 'Bassa' }
  ];

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('medichat_language', language);
  }, [language]);

  const setLanguage = (newLanguage: string) => {
    if (availableLanguages.some(lang => lang.value === newLanguage)) {
      setLanguageState(newLanguage);
    }
  };

  // Get nested translation value
  const getTranslationValue = (obj: TranslationKey, path: string[]): string => {
    let current: any = obj;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path.join('.'); // Return the key path if not found
      }
    }
    return typeof current === 'string' ? current : path.join('.');
  };

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const languageTranslations = translations[language] || translations.english;
    const path = key.split('.');
    let translatedText = getTranslationValue(languageTranslations, path);
    
    // If translation not found in current language, try English as fallback
    if (translatedText === key && language !== 'english') {
      translatedText = getTranslationValue(translations.english, path);
    }
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return translatedText;
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    availableLanguages
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
