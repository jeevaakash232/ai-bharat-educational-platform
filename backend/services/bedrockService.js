import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

let bedrockClient = null;

function getBedrockClient() {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim()
      }
    });
    
    console.log('🔑 Bedrock client initialized:', {
      region: process.env.BEDROCK_REGION || process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
  }
  return bedrockClient;
}

const CLEAR_EXPLANATION_PROMPT = `You are a helpful AI assistant that explains things clearly and simply.

When answering questions, follow these guidelines:
1. **Explain in Simple Terms**: Use everyday language that anyone can understand
2. **Step-by-Step Explanation**: Break down complex topics into easy steps
3. **Real-Life Examples**: Provide practical examples from daily life
4. **Avoid Technical Jargon**: Use simple words instead of technical terms
5. **Be Encouraging**: Make learning feel easy and fun

Your goal is to make the user feel confident and help them understand completely.`;

/**
 * Get AI response from Amazon Bedrock (Claude) using Converse API
 * @param {string} userMessage
 * @param {object} options - { maxTokens, temperature, systemPrompt }
 */
export async function getBedrockResponse(userMessage, options = {}) {
  try {
    const client = getBedrockClient();

    const {
      maxTokens = 2000,
      temperature = 0.7,
      systemPrompt = CLEAR_EXPLANATION_PROMPT,
    } = options;
    
    const command = new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      messages: [
        {
          role: 'user',
          content: [{ text: userMessage }]
        }
      ],
      system: [{ text: systemPrompt }],
      inferenceConfig: {
        maxTokens,
        temperature,
        topP: 0.9
      }
    });

    const response = await client.send(command);
    
    // Extract AI response from Converse API format
    const aiResponse = response.output?.message?.content?.[0]?.text || 'Sorry, I could not generate a response.';
    
    console.log('✅ Bedrock Converse API Success!');
    console.log('📊 Usage:', {
      inputTokens: response.usage?.inputTokens,
      outputTokens: response.usage?.outputTokens,
      totalTokens: response.usage?.totalTokens
    });

    return aiResponse;
  } catch (error) {
    console.error('❌ Bedrock Error:', error);
    throw new Error(`AI service error: ${error.message}`);
  }
}
