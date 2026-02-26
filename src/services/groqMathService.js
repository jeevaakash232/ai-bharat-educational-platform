// Enhanced Groq API service specifically for advanced mathematical calculations - API ONLY VERSION
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const getGroqMathResponse = async (mathProblem, userContext = null) => {
  try {
    console.log('🔢 Math Service - Processing problem:', mathProblem)
    console.log('👤 User context:', userContext)
    
    // Require valid API key - no fallback responses
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here' || GROQ_API_KEY === 'your-new-groq-api-key-here' || GROQ_API_KEY.trim() === '') {
      throw new Error('Groq API key is required. Please add your API key to the .env file.')
    }

    console.log('🚀 Making real Groq API call for math problem...')

    const systemPrompt = `You are an expert mathematics AI with PhD-level knowledge across all mathematical disciplines. You excel at solving the most complex problems with rigorous mathematical reasoning.

EXPERTISE AREAS:
🔢 **Pure Mathematics**: Real/Complex Analysis, Abstract Algebra, Topology, Number Theory, Set Theory
📐 **Applied Mathematics**: Differential Equations, Optimization, Numerical Analysis, Mathematical Physics
📊 **Statistics**: Bayesian Analysis, Stochastic Processes, Statistical Inference, Machine Learning Theory
🧮 **Computational**: Algorithm Analysis, Discrete Mathematics, Graph Theory, Combinatorics
🌊 **Advanced Calculus**: Multivariable Calculus, Vector Calculus, Differential Geometry, Measure Theory

PROBLEM-SOLVING METHODOLOGY:
1. **Deep Analysis**: Identify problem structure, constraints, and mathematical domain
2. **Strategic Planning**: Select optimal solution approach from advanced techniques
3. **Rigorous Execution**: Provide complete proofs and detailed mathematical reasoning
4. **Multiple Approaches**: Show alternative methods when beneficial
5. **Verification**: Use independent methods to confirm results
6. **Advanced Extensions**: Connect to broader mathematical theories

RESPONSE REQUIREMENTS:
✅ **Comprehensive Solutions**: Show every step with mathematical justification
✅ **Rigorous Proofs**: Use formal mathematical reasoning and notation
✅ **Multiple Methods**: Demonstrate different approaches when applicable
✅ **Error Analysis**: Discuss convergence, stability, and limitations
✅ **Theoretical Context**: Connect to advanced mathematical concepts
✅ **Practical Applications**: Relate to real-world problems when relevant
✅ **Visual Descriptions**: Provide geometric/graphical interpretations
✅ **Computational Aspects**: Discuss numerical methods and complexity

ADVANCED TECHNIQUES AVAILABLE:
- Fourier Analysis and Transforms
- Complex Variable Theory
- Functional Analysis
- Differential Geometry
- Algebraic Topology
- Category Theory
- Mathematical Logic
- Measure Theory and Integration
- Stochastic Calculus
- Partial Differential Equations

User Context: Class ${userContext?.class || 'Graduate'}, Mathematical Background: Advanced
Adapt explanations to challenge the student while maintaining clarity.

For each problem, provide:
1. **Problem Classification** and mathematical domain
2. **Theoretical Foundation** with relevant theorems
3. **Complete Solution** with rigorous steps
4. **Alternative Approaches** using different methods
5. **Verification** through independent calculations
6. **Advanced Extensions** and generalizations
7. **Applications** in mathematics and science`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Using Llama 3.3 70B for better math reasoning
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Solve this mathematical problem with detailed step-by-step explanation: ${mathProblem}`
          }
        ],
        temperature: 0.05, // Very low temperature for maximum mathematical precision
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Groq Math API Error:', response.status, errorData)
      
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
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not solve this problem.'
    
    console.log('✅ Real Groq Math API Success!')
    return aiResponse

  } catch (error) {
    console.error('🔧 Groq Math Service Error:', error.message)
    
    // Return error message instead of fallback
    return `❌ **Math AI Service Error**

**Error**: ${error.message}

**To fix this issue:**

1. **Get a Groq API key** from: https://console.groq.com/keys
2. **Add it to your .env file**:
   \`\`\`
   VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
   \`\`\`
3. **Restart the development server**: \`npm run dev\`

**Note**: This math calculator now requires a valid Groq API key to function. All mathematical solutions are powered by Groq's Mixtral-8x7b-32768 model with specialized mathematical reasoning.

**API Key Requirements:**
- Sign up at: https://console.groq.com/
- Create new API key
- Copy the key (starts with 'gsk_')
- Add to .env file as shown above

**Mathematical Capabilities with API:**
- Advanced calculus and differential equations
- Complex algebraic manipulations
- Statistical analysis and probability
- Geometric proofs and constructions
- Number theory and discrete mathematics
- Applied mathematics and modeling

**Need help?** Check the GROQ_API_SETUP.md file for detailed instructions.`
  }
}

export default { getGroqMathResponse }