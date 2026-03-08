import express from 'express';
import { listBooks, getBookUrl } from '../services/s3BooksService.js';

const router = express.Router();

// GET /api/books - List all books from S3
router.get('/', async (req, res) => {
  try {
    console.log('📚 Fetching books from S3...');
    const books = await listBooks();
    console.log(`✅ Found ${books.length} books in S3`);
    res.json(books);
  } catch (error) {
    console.error('❌ Error fetching books:', error);
    res.status(500).json({ 
      error: 'Failed to fetch books',
      message: error.message 
    });
  }
});

// GET /api/books/:key - Get presigned URL for a specific book
router.get('/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    console.log('📖 Getting URL for book:', key);
    
    const url = await getBookUrl(key);
    res.json({ url });
  } catch (error) {
    console.error('❌ Error getting book URL:', error);
    res.status(500).json({ 
      error: 'Failed to get book URL',
      message: error.message 
    });
  }
});

export default router;
