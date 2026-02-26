// Groq API service for MULTILINGUAL dual-language responses
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Get AI response in BOTH user's native language AND English
 * @param {string} userMessage - The user's question/input
 * @param {string} userLanguage - User's native language (e.g., 'Tamil', 'Hindi', 'Telugu')
 * @param {object} userContext - Optional user context (class, board, etc.)
 * @returns {object} - { nativeLanguage: string, english: string }
 */
export const getMultilingualResponse = async (userMessage, userLanguage = 'Tamil', userContext = null) => {
  try {
    // Check if API key is properly configured
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here' || GROQ_API_KEY.trim() === '') {
      throw new Error('Groq API key is required. Please add your API key to the .env file.')
    }

    console.log(`🌍 Making multilingual Groq API call (${userLanguage} + English)...`)
    
    const systemPrompt = `You are an expert multilingual AI tutor for Indian students. You help with all subjects across classes 1-12.

User Context:
- Name: ${userContext?.name || 'Student'}
- Class: ${userContext?.class || 'Not specified'}
- Board: ${userContext?.board || 'Not specified'}
- Native Language: ${userLanguage}
- Subjects: ${userContext?.subjects?.join(', ') || 'All subjects'}

CRITICAL INSTRUCTIONS:
1. You MUST provide TWO complete answers for every question
2. First answer in ${userLanguage} (user's native language)
3. Second answer in English
4. Both answers should be complete, detailed, and educational
5. Use proper mathematical notation in both languages
6. Adapt complexity to student's class level

Response Format (STRICTLY FOLLOW):
---NATIVE_LANGUAGE_START---
[Complete detailed answer in ${userLanguage}]
---NATIVE_LANGUAGE_END---

---ENGLISH_START---
[Complete detailed answer in English]
---ENGLISH_END---

Subjects you can help with:
- Mathematics, Physics, Chemistry, Biology
- English, Tamil, Hindi, Telugu (and other Indian languages)
- Social Science, Computer Science
- All CBSE, State Board subjects

Always provide detailed, step-by-step educational responses in BOTH languages.`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Best for multilingual support
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 4000 // Increased for dual-language responses
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Groq API Error:', response.status, errorData)
      
      if (response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your API key in the .env file.')
      } else if (response.status === 429) {
        throw new Error('Groq API rate limit exceeded. Please try again in a moment.')
      }
      
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || ''
    
    // Parse the dual-language response
    const parsedResponse = parseDualLanguageResponse(aiResponse, userLanguage)
    
    console.log('✅ Multilingual Groq API Success!')
    return parsedResponse

  } catch (error) {
    console.error('🔧 Groq Multilingual Service Error:', error.message)
    throw error
  }
}

/**
 * Parse the AI response to extract both language versions
 */
function parseDualLanguageResponse(response, userLanguage) {
  try {
    // Extract native language response
    const nativeMatch = response.match(/---NATIVE_LANGUAGE_START---([\s\S]*?)---NATIVE_LANGUAGE_END---/)
    const englishMatch = response.match(/---ENGLISH_START---([\s\S]*?)---ENGLISH_END---/)
    
    if (nativeMatch && englishMatch) {
      return {
        nativeLanguage: nativeMatch[1].trim(),
        english: englishMatch[1].trim(),
        language: userLanguage
      }
    }
    
    // Fallback: If markers not found, try to split response
    const parts = response.split(/\n\n+/)
    if (parts.length >= 2) {
      return {
        nativeLanguage: parts[0].trim(),
        english: parts.slice(1).join('\n\n').trim(),
        language: userLanguage
      }
    }
    
    // Last resort: Return same content for both
    return {
      nativeLanguage: response,
      english: response,
      language: userLanguage
    }
  } catch (error) {
    console.error('Error parsing dual-language response:', error)
    return {
      nativeLanguage: response,
      english: response,
      language: userLanguage
    }
  }
}

/**
 * Detect user's language from their input (optional helper)
 */
export const detectLanguage = (text) => {
  // Simple language detection based on Unicode ranges
  const tamilRegex = /[\u0B80-\u0BFF]/
  const hindiRegex = /[\u0900-\u097F]/
  const teluguRegex = /[\u0C00-\u0C7F]/
  const kannadaRegex = /[\u0C80-\u0CFF]/
  const malayalamRegex = /[\u0D00-\u0D7F]/
  
  if (tamilRegex.test(text)) return 'Tamil'
  if (hindiRegex.test(text)) return 'Hindi'
  if (teluguRegex.test(text)) return 'Telugu'
  if (kannadaRegex.test(text)) return 'Kannada'
  if (malayalamRegex.test(text)) return 'Malayalam'
  
  return 'English' // Default
}

export default { 
  getMultilingualResponse,
  detectLanguage
}
