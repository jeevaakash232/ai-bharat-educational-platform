// Secure Bedrock Service - Calls backend API instead of exposing AWS credentials
import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';

/**
 * Get AI response from backend (secure - no AWS credentials exposed)
 * @param {string} userMessage - The user's message/prompt
 * @param {object} userContext - User context (name, class, subjects, etc.)
 * @returns {Promise<string>} - AI response
 */
export const getBedrockResponse = async (userMessage, userContext = null) => {
  try {
    console.log('🚀 Sending message to secure backend API...');
    
    const response = await axios.post(`${BACKEND_API_URL}/chat`, {
      message: userMessage,
      userId: userContext?.email || userContext?.id || 'anonymous'
    });

    if (response.data.success) {
      console.log('✅ Backend API Success!');
      console.log(`🌐 Detected language: ${response.data.language.name}`);
      return response.data.response;
    } else {
      throw new Error('Backend API returned unsuccessful response');
    }

  } catch (error) {
    console.error('❌ Backend API Error:', error);
    
    if (error.response) {
      // Backend returned an error
      return `❌ **AI Service Error**

**Error**: ${error.response.data.message || error.response.data.error}

Please try again or contact support.`;
    } else if (error.request) {
      // Backend not reachable
      return `❌ **Backend Connection Error**

**Error**: Cannot connect to AI backend server

**To fix:**
1. Make sure the backend server is running: \`cd backend && npm start\`
2. Check if backend is running on http://localhost:3001
3. Verify VITE_BACKEND_API_URL in .env file

**Current backend URL**: ${BACKEND_API_URL}`;
    } else {
      return `❌ **Unexpected Error**

**Error**: ${error.message}

Please try again.`;
    }
  }
};

/**
 * Check if backend is configured and reachable
 * @returns {Promise<boolean>}
 */
export const isBedrockConfigured = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL.replace('/api', '')}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return false;
  }
};

/**
 * Get Bedrock configuration info
 * @returns {object}
 */
export const getBedrockConfig = () => {
  return {
    backendUrl: BACKEND_API_URL,
    configured: true
  };
};

export default {
  getBedrockResponse,
  isBedrockConfigured,
  getBedrockConfig
};
