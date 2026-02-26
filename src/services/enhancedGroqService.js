// Enhanced Groq AI service - API ONLY VERSION (No Simulated Responses)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const getEnhancedGroqResponse = async (userMessage, userContext = null) => {
  try {
    console.log('🔍 Enhanced Groq Service - Processing message:', userMessage)
    console.log('👤 User context:', userContext)
    
    // Check API key status
    console.log('🔑 API Key status:', GROQ_API_KEY ? 'Present' : 'Missing')
    
    // Require valid API key - no fallback responses
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here' || GROQ_API_KEY === 'your-new-groq-api-key-here' || GROQ_API_KEY.trim() === '') {
      throw new Error('Groq API key is required. Please add your API key to the .env file.')
    }

    console.log('🚀 Making real Groq API call...')
    
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
            content: `You are an advanced AI learning assistant specialized in solving complex problems across all academic subjects for Indian students.

CORE EXPERTISE:
🔢 Advanced Mathematics: Calculus, linear algebra, differential equations, complex analysis, number theory, topology
🔬 Sciences: Quantum physics, organic chemistry, molecular biology, genetics, thermodynamics, electromagnetism
📚 Academic Analysis: Literary criticism, historical analysis, philosophical reasoning, economic modeling
💻 Technical: Advanced algorithms, machine learning, system design, computational complexity

User Context:
- Name: ${userContext?.name || 'Student'}
- Class: ${userContext?.class || 'Not specified'}
- Board: ${userContext?.board || 'Not specified'}
- Subjects: ${userContext?.subjects?.join(', ') || 'All subjects'}

PROBLEM-SOLVING APPROACH:
1. **Analyze** the problem structure and identify key concepts
2. **Plan** the solution strategy with multiple approaches when possible
3. **Execute** step-by-step with clear mathematical/logical reasoning
4. **Verify** results through alternative methods or checks
5. **Explain** the broader significance and applications
6. **Connect** to related concepts and advanced topics

RESPONSE STYLE:
✅ Detailed step-by-step solutions with reasoning
✅ Multiple solution methods when applicable
✅ Clear mathematical notation and formatting
✅ Real-world applications and significance
✅ Verification and error checking
✅ Extensions to more advanced concepts
✅ Adapt complexity to student's class level
❌ Avoid oversimplification
❌ Don't skip important intermediate steps

For complex problems, provide comprehensive analysis including:
- Problem breakdown and strategy
- Detailed mathematical work
- Alternative approaches
- Verification methods
- Practical applications
- Related advanced concepts

Always provide educational, comprehensive responses that help students learn and understand concepts deeply.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
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
    
    console.log('✅ Real Groq API Success!')
    return aiResponse

  } catch (error) {
    console.error('🔧 Enhanced Groq Service Error:', error.message)
    
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

**Note**: This platform now requires a valid Groq API key to function. All responses are powered by Groq's Mixtral-8x7b-32768 model.

**API Key Requirements:**
- Sign up at: https://console.groq.com/
- Create new API key
- Copy the key (starts with 'gsk_')
- Add to .env file as shown above

**Need help?** Check the GROQ_API_SETUP.md file for detailed instructions.`
  }
}

export default { getEnhancedGroqResponse }