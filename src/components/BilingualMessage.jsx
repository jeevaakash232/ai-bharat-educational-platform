import React, { useState } from 'react';
import { Globe, Languages, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * BilingualMessage Component
 * Displays AI responses in both mother tongue and English
 */
const BilingualMessage = ({ 
  englishText, 
  translatedText, 
  language, 
  nativeName,
  className = '' 
}) => {
  const [showBoth, setShowBoth] = useState(true);
  const [primaryLanguage, setPrimaryLanguage] = useState('motherTongue'); // 'motherTongue' or 'english'

  // If no translation, show only English
  if (!translatedText || language === 'English') {
    return (
      <div className={`bilingual-message ${className}`}>
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {englishText}
        </div>
      </div>
    );
  }

  return (
    <div className={`bilingual-message space-y-3 ${className}`}>
      {/* Language Toggle */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-200">
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-800">
            Bilingual Response
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPrimaryLanguage(primaryLanguage === 'motherTongue' ? 'english' : 'motherTongue')}
            className="text-xs px-3 py-1 bg-white rounded-full border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            <Globe className="h-3 w-3 inline mr-1" />
            {primaryLanguage === 'motherTongue' ? 'Show English First' : `Show ${nativeName} First`}
          </button>
          <button
            onClick={() => setShowBoth(!showBoth)}
            className="text-xs px-3 py-1 bg-white rounded-full border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            {showBoth ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />}
            {showBoth ? 'Show One' : 'Show Both'}
          </button>
        </div>
      </div>

      {/* Show Both Languages */}
      {showBoth ? (
        <div className="space-y-3">
          {/* Mother Tongue First */}
          {primaryLanguage === 'motherTongue' ? (
            <>
              {/* Mother Tongue */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-purple-800">
                    {nativeName || language}
                  </span>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                    Mother Tongue
                  </span>
                </div>
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                  {translatedText}
                </div>
              </div>

              {/* English */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-blue-800">
                    English
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                    Translation
                  </span>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {englishText}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* English First */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-blue-800">
                    English
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                    Original
                  </span>
                </div>
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                  {englishText}
                </div>
              </div>

              {/* Mother Tongue */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-purple-800">
                    {nativeName || language}
                  </span>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                    Translation
                  </span>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {translatedText}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Show Only One Language */
        <div>
          {primaryLanguage === 'motherTongue' ? (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-semibold text-purple-800">
                  {nativeName || language}
                </span>
              </div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                {translatedText}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-semibold text-blue-800">
                  English
                </span>
              </div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                {englishText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start space-x-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
        <Globe className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>
          Responses are provided in both {nativeName || language} and English to help you learn better.
        </span>
      </div>
    </div>
  );
};

export default BilingualMessage;
