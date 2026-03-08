import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { detectLanguage, translateToEnglish, translateFromEnglish } from '../services/translateService.js';
import { getBedrockResponse } from '../services/bedrockService.js';
import { storeChatSession } from '../services/s3Service.js';

const router = express.Router();

/**
 * POST /api/chat
 * Main chat endpoint with translation and AI response
 */
router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Validation
    if (!message || !userId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both message and userId are required'
      });
    }

    console.log(`\n📨 New chat request from user: ${userId}`);
    console.log(`💬 Message: ${message}`);

    // Step 1: Detect language
    const detectedLanguage = await detectLanguage(message);
    console.log(`🌐 Detected language: ${detectedLanguage.name} (${detectedLanguage.code})`);

    // Step 2: Translate to English (if not already English)
    let translatedMessage = message;
    if (detectedLanguage.code !== 'en') {
      translatedMessage = await translateToEnglish(message, detectedLanguage.code);
      console.log(`🔄 Translated to English: ${translatedMessage}`);
    }

    // Step 3: Get AI response from Bedrock
    const aiResponseEnglish = await getBedrockResponse(translatedMessage);
    console.log(`🤖 AI response received`);

    // Step 4: Translate AI response back to original language
    let finalResponse = aiResponseEnglish;
    if (detectedLanguage.code !== 'en') {
      finalResponse = await translateFromEnglish(aiResponseEnglish, detectedLanguage.code);
      console.log(`🔄 Translated back to ${detectedLanguage.name}`);
    }

    // Step 5: Store chat session in S3
    const chatData = {
      sessionId: uuidv4(),
      userId,
      timestamp: new Date().toISOString(),
      language: {
        code: detectedLanguage.code,
        name: detectedLanguage.name,
        confidence: detectedLanguage.confidence
      },
      userMessage: {
        original: message,
        translated: translatedMessage
      },
      aiResponse: {
        english: aiResponseEnglish,
        translated: finalResponse
      }
    };

    await storeChatSession(userId, chatData);

    // Step 6: Return response
    res.json({
      success: true,
      response: finalResponse,
      language: {
        code: detectedLanguage.code,
        name: detectedLanguage.name
      },
      sessionId: chatData.sessionId
    });

  } catch (error) {
    console.error('❌ Chat endpoint error:', error);
    res.status(500).json({
      error: 'Chat processing failed',
      message: error.message
    });
  }
});

export default router;
