/**
 * React Hook for Bilingual AI Responses
 * Automatically translates AI responses to user's mother tongue
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translateAIResponse, getBilingualResponse } from '../services/bilingualService';

export const useBilingualAI = () => {
  const { user } = useAuth();
  const [userLanguage, setUserLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (user?.mediumName) {
      // User's mediumName is their preferred language
      console.log('🌐 Bilingual AI: User language detected:', user.mediumName);
      setUserLanguage(user.mediumName);
    } else if (user?.medium) {
      // Fallback to medium if mediumName doesn't exist
      console.log('🌐 Bilingual AI: User language detected (fallback):', user.medium);
      setUserLanguage(user.medium);
    } else {
      console.log('🌐 Bilingual AI: No language detected, defaulting to English');
      setUserLanguage('English');
    }
  }, [user]);

  /**
   * Translate a single AI response
   */
  const translateResponse = async (englishText) => {
    if (!englishText) return null;

    // If user's language is English, return as is
    if (userLanguage === 'English') {
      return {
        english: englishText,
        translated: null,
        language: 'English'
      };
    }

    setIsTranslating(true);
    try {
      const result = await translateAIResponse(englishText, userLanguage);
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return {
        english: englishText,
        translated: null,
        language: userLanguage
      };
    } finally {
      setIsTranslating(false);
    }
  };

  /**
   * Get bilingual response (both languages)
   */
  const getBilingual = async (englishText) => {
    if (!englishText) return null;

    setIsTranslating(true);
    try {
      const result = await getBilingualResponse(englishText, userLanguage);
      return result;
    } catch (error) {
      console.error('Bilingual response error:', error);
      return {
        english: englishText,
        motherTongue: null,
        language: userLanguage
      };
    } finally {
      setIsTranslating(false);
    }
  };

  /**
   * Check if bilingual mode is active
   */
  const isBilingualMode = () => {
    return userLanguage && userLanguage !== 'English';
  };

  return {
    userLanguage,
    isTranslating,
    translateResponse,
    getBilingual,
    isBilingualMode
  };
};

export default useBilingualAI;
