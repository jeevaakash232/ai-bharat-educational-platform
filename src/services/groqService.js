// Groq API service - API ONLY VERSION (No Simulated Responses)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const getGroqResponse = async (userMessage, userContext = null) => {
  try {
    // Check if API key is properly configured
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here' || GROQ_API_KEY === 'your-new-groq-api-key-here' || GROQ_API_KEY.trim() === '') {
      throw new Error('Groq API key is required. Please add your API key to the .env file.')
    }

    console.log('🚀 Making Groq API call...')
    
    const systemPrompt = `You are an expert AI tutor for Indian students. You help with all subjects across classes 1-12.

User Context:
- Name: ${userContext?.name || 'Student'}
- Class: ${userContext?.class || 'Not specified'}
- Board: ${userContext?.board || 'Not specified'}
- Subjects: ${userContext?.subjects?.join(', ') || 'All subjects'}

Instructions:
1. Provide clear, educational explanations appropriate for the student's class level
2. Give step-by-step solutions for mathematical problems
3. Use proper mathematical notation when needed
4. Include examples and real-world applications
5. Be encouraging and supportive
6. Adapt your language complexity to the student's class level
7. For mathematical problems, show all working steps
8. Provide comprehensive answers that help students understand concepts

Subjects you can help with:
- Mathematics (Algebra, Geometry, Calculus, Statistics)
- Physics (Mechanics, Thermodynamics, Optics, Electricity)
- Chemistry (Organic, Inorganic, Physical Chemistry)
- Biology (Botany, Zoology, Human Biology)
- English (Grammar, Literature, Writing)
- Tamil (Literature, Grammar)
- Social Science (History, Geography, Civics, Economics)
- Computer Science (Programming, Algorithms)

Always provide detailed, educational responses that help students learn.`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Groq API Error:', response.status, errorData)
      
      if (response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your API key in the .env file.')
      } else if (response.status === 429) {
        throw new Error('Groq API rate limit exceeded. Please try again in a moment.')
      } else if (response.status === 500) {
        throw new Error('Groq API server error. Please try again later.')
      }
      
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    
    console.log('✅ Groq API Success!')
    return aiResponse

  } catch (error) {
    console.error('🔧 Groq API Error:', error.message)
    
    // Return error message instead of fallback
    return `❌ **AI Service Error**

**Error**: ${error.message}

**To fix this issue:**

1. **Get a Groq API key** from: https://console.groq.com/keys
2. **Add it to your .env file**:
   \`\`\`
   VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
   \`\`\`
3. **Restart the development server**: \`npm run dev\`

**Note**: This platform requires a valid Groq API key to function. All responses are powered by Groq's Mixtral-8x7b-32768 model.

**Need help?** Visit the Groq documentation or check the troubleshooting guides in the project files.`
  }
}

export default { getGroqResponse }