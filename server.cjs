const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

// Import S3 service
const { uploadToS3, getSignedFileUrl, deleteFromS3 } = require('./src/services/s3Service.cjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the built frontend (dist folder)
app.use(express.static(path.join(__dirname, 'dist')));

app.use(express.static('public'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/books')));

// Configure multer for memory storage (files will be uploaded to S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Books database (in production, use a real database)
const BOOKS_DB_PATH = path.join(__dirname, 'books-database.json');

const loadBooksDatabase = () => {
  try {
    if (fs.existsSync(BOOKS_DB_PATH)) {
      return JSON.parse(fs.readFileSync(BOOKS_DB_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading books database:', error);
  }
  return [];
};

const saveBooksDatabase = (books) => {
  try {
    fs.writeFileSync(BOOKS_DB_PATH, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error saving books database:', error);
  }
};

// API Routes

// Upload book endpoint with S3
app.post('/api/upload-book', upload.single('bookFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      title,
      author,
      subject,
      class: classNum,
      type,
      description,
      isbn,
      publisher,
      publishYear,
      state,
      medium,
      language,
      term,
      uploadedBy
    } = req.body;

    // Validate required fields
    if (!title || !author || !subject || !classNum || !state) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`📤 Uploading to S3: ${req.file.originalname}`);

    // Upload to S3
    const s3Result = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        state: state.toLowerCase().replace(/\s+/g, ''),
        class: classNum,
        subject: subject.toLowerCase(),
        uploadedBy: uploadedBy || 'unknown',
        title,
        author,
      }
    );

    console.log(`✅ S3 Upload successful: ${s3Result.fileName}`);

    // Generate signed URL for immediate access (valid for 7 days)
    const signedUrl = await getSignedFileUrl(s3Result.fileName, 7 * 24 * 3600);

    // Create book entry
    const bookId = `${subject.toLowerCase()}-${classNum}-${Date.now()}`;
    const bookEntry = {
      id: bookId,
      title,
      author,
      subject,
      class: classNum.toString(),
      type: type || 'textbook',
      board: "State Board",
      state,
      medium: medium || 'state',
      language: language || 'Hindi',
      pages: 0,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
      format: 'PDF',
      description: description || `Class ${classNum} ${subject} textbook`,
      chapters: [],
      downloadUrl: s3Result.fileUrl, // S3 URL
      signedUrl: signedUrl, // Signed URL for secure access
      s3Key: s3Result.fileName, // S3 file key
      viewUrl: `/book-viewer/${bookId}`,
      thumbnail: `/images/books/${state.toLowerCase().replace(/\s+/g, '')}/${subject.toLowerCase()}-${classNum}.jpg`,
      isRealBook: true,
      isS3Hosted: true, // Flag to indicate S3 storage
      lastUpdated: new Date().toISOString(),
      originalFileName: req.file.originalname,
      isbn: isbn || '',
      publisher: publisher || '',
      publishYear: publishYear || '',
      uploadedBy: uploadedBy || 'Unknown',
      uploadedAt: new Date().toISOString(),
      bucket: s3Result.bucket,
      region: s3Result.region,
    };

    // Add term if specified
    if (term && term !== '') {
      bookEntry.term = parseInt(term);
    }

    // Save to database
    const books = loadBooksDatabase();
    books.push(bookEntry);
    saveBooksDatabase(books);

    console.log(`📚 Book uploaded: ${title} by ${uploadedBy || 'Unknown'}`);
    
    res.json({ 
      success: true, 
      message: 'Book uploaded successfully to AWS S3!',
      book: bookEntry 
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Get signed URL for a book
app.get('/api/books/:bookId/signed-url', async (req, res) => {
  try {
    const { bookId } = req.params;
    const books = loadBooksDatabase();
    const book = books.find(b => b.id === bookId);

    if (!book || !book.s3Key) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Generate new signed URL (valid for 1 hour)
    const signedUrl = await getSignedFileUrl(book.s3Key, 3600);

    res.json({ 
      success: true,
      signedUrl,
      expiresIn: 3600 
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Serve PDF files with proper headers
app.get('/api/pdf/:bookId', (req, res) => {
  try {
    const { bookId } = req.params;
    const books = loadBooksDatabase();
    const book = books.find(b => b.id === bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // If S3 hosted, redirect to signed URL
    if (book.isS3Hosted && book.s3Key) {
      return res.redirect(book.downloadUrl);
    }

    // For local files
    const filePath = book.filePath || path.join(__dirname, book.downloadUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.originalFileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ error: 'Failed to serve PDF' });
  }
});

// Get all books endpoint
app.get('/api/books', (req, res) => {
  try {
    const books = loadBooksDatabase();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get books by filters
app.get('/api/books/filter', (req, res) => {
  try {
    const { state, medium, class: classNum, subject } = req.query;
    let books = loadBooksDatabase();

    if (state) {
      books = books.filter(book => book.state.toLowerCase() === state.toLowerCase());
    }
    if (medium) {
      books = books.filter(book => 
        book.medium === medium || 
        book.medium === 'both' ||
        (medium === 'state' && book.medium === 'hindi') // Handle Hindi as state medium
      );
    }
    if (classNum) {
      books = books.filter(book => book.class === classNum.toString());
    }
    if (subject) {
      books = books.filter(book => book.subject.toLowerCase() === subject.toLowerCase());
    }

    res.json(books);
  } catch (error) {
    console.error('Error filtering books:', error);
    res.status(500).json({ error: 'Failed to filter books' });
  }
});

// Delete book endpoint with S3
app.delete('/api/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const books = loadBooksDatabase();
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[bookIndex];
    
    // Delete from S3 if it's S3 hosted
    if (book.isS3Hosted && book.s3Key) {
      await deleteFromS3(book.s3Key);
      console.log(`🗑️  Deleted from S3: ${book.s3Key}`);
    }
    // Delete local file if it exists
    else if (book.filePath && fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    // Remove from database
    books.splice(bookIndex, 1);
    saveBooksDatabase(books);

    console.log(`📚 Book deleted: ${book.title}`);
    res.json({ success: true, message: 'Book deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Book upload server with AWS S3 is running',
    s3Enabled: true,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    region: process.env.AWS_REGION
  });
});

// Catch-all route - serve React app for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Run: npm run build');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`📚 Book Upload Server running on http://localhost:${PORT}`);
  console.log(`☁️  S3 Bucket: ${process.env.AWS_S3_BUCKET_NAME}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log(`🗄️  Database file: ${BOOKS_DB_PATH}`);
  console.log(`🌐 Frontend: Serving from dist folder`);
});

module.exports = app;