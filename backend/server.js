import dotenv from 'dotenv';

// Load environment variables FIRST before anything else
dotenv.config();

import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import booksRouter from './routes/books.js';
import videosRouter from './routes/videos.js';
import studyTwinRouter from './routes/studyTwin.js';
import teacherAssistantRouter from './routes/teacherAssistant.js';
import emotionAwareRouter from './routes/emotionAware.js';
import translateRouter from './routes/translate.js';
import userHistoryRouter from './routes/userHistory.js';
import quizRouter from './routes/quiz.js';
import aiRouter from './routes/ai.js';
import multer from 'multer';
import { uploadBook } from './services/s3BooksService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ].filter(Boolean), // Remove undefined values
  credentials: true
}));
app.use(express.json());

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    name: 'AI-Bharat Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      books: {
        list: 'GET /api/books',
        get: 'GET /api/books/:key',
        upload: 'POST /api/upload-book',
        delete: 'DELETE /api/books/:key'
      },
      videos: {
        list: 'GET /api/videos',
        get: 'GET /api/videos/:key',
        download: 'GET /api/videos/:key/download',
        upload: 'POST /api/videos/upload',
        delete: 'DELETE /api/videos/:key'
      },
      studyTwin: {
        predict: 'POST /api/study-twin/predict',
        risk: 'POST /api/study-twin/risk',
        simulate: 'POST /api/study-twin/simulate',
        history: 'GET /api/study-twin/history/:studentId',
        stats: 'GET /api/study-twin/stats/:studentId'
      },
      teacherAssistant: {
        generate: 'POST /api/teacher-assistant/generate',
        questions: 'POST /api/teacher-assistant/questions',
        notes: 'POST /api/teacher-assistant/notes',
        homework: 'POST /api/teacher-assistant/homework',
        health: 'GET /api/teacher-assistant/health'
      },
      translate: {
        translate: 'POST /api/translate',
        batch: 'POST /api/translate/batch',
        health: 'GET /api/translate/health'
      },
      history: {
        track: 'POST /api/history/track',
        trackBatch: 'POST /api/history/track-batch',
        getUserHistory: 'GET /api/history/:userId',
        getStats: 'GET /api/history/:userId/stats',
        getSummary: 'GET /api/history/:userId/summary/:activityType',
        recentActivities: 'GET /api/history/admin/recent',
        activityTypes: 'GET /api/history/activity-types',
        health: 'GET /api/history/health'
      }
    },
    services: {
      bedrock: {
        region: process.env.BEDROCK_REGION || process.env.AWS_REGION,
        model: process.env.BEDROCK_MODEL_ID
      },
      s3: {
        region: process.env.S3_REGION || process.env.AWS_REGION,
        bucket: process.env.S3_BUCKET_NAME
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/books', booksRouter);
app.use('/api/videos', videosRouter);
app.use('/api/study-twin', studyTwinRouter);
app.use('/api/teacher-assistant', teacherAssistantRouter);
app.use('/api/emotion-aware', emotionAwareRouter);
app.use('/api/translate', translateRouter);
app.use('/api/history', userHistoryRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/ai', aiRouter);

// Book upload route (separate endpoint for clarity)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

app.post('/api/upload-book', upload.single('bookFile'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('File:', req.file ? req.file.originalname : 'No file');
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      title, author, subject, class: bookClass, type, state, medium, language,
      term, description, isbn, publisher, publishYear, uploadedBy, userType
    } = req.body;

    if (!title || !author || !subject || !bookClass || !state) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'author', 'subject', 'class', 'state']
      });
    }

    const result = await uploadBook(req.file, {
      title, author, subject, class: bookClass, type: type || 'textbook',
      state, medium: medium || 'both', language: language || 'English',
      term: term || '', description: description || '', isbn: isbn || '',
      publisher: publisher || '', publishYear: publishYear || '',
      uploadedBy: uploadedBy || 'unknown', userType: userType || 'teacher'
    });

    console.log('✅ Book uploaded successfully:', result.key);
    res.json({
      success: true,
      message: 'Book uploaded successfully',
      book: result
    });

  } catch (error) {
    console.error('❌ Error uploading book:', error);
    res.status(500).json({ 
      error: 'Failed to upload book',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📍 Region: ${process.env.AWS_REGION}`);
  console.log(`🤖 Model: ${process.env.BEDROCK_MODEL_ID}`);
  console.log(`📚 S3 Bucket: ${process.env.S3_BUCKET_NAME || 'edulearn-books-storage'}`);
});
