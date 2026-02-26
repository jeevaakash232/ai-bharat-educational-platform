# EduLearn v3.0.0 - Deployment Guide

## 📦 Package Contents

This zip file contains the complete EduLearn platform source code with all latest features.

---

## ✨ Features Included

### 1. Student Notes/Clipboard
- Rich text editor with formatting
- Auto-save every 3 seconds
- Export to PDF, DOCX, TXT
- Available in AI Assistant, Books listing, and Book viewer
- Per-student storage

### 2. Voice Recording (24 Languages)
- 23 Indian languages + English
- Speech-to-text conversion
- Auto-send to AI
- Language auto-detection

### 3. Dual-Language AI Responses
- Responds in native language + English
- Powered by Groq AI
- Context-aware responses

### 4. Live Classes (Preview)
- Class scheduling interface
- Ready for video integration
- Full implementation guide included

### 5. Books & Guides
- State-wise textbooks
- PDF viewer with notes
- Upload custom books
- Download capability

### 6. AI Assistant
- Subject-specific help
- Math calculator
- Image & YouTube support
- Voice input

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git (optional)

### Installation

1. **Extract the zip file**
   ```bash
   unzip edulearn-v3.0.0-clean.zip
   cd edulearn-v3.0.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Add your Groq API key to .env**
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_GROQ_MODEL=llama-3.3-70b-versatile
   ```

5. **Start development servers**
   
   Terminal 1 - Frontend:
   ```bash
   npm run dev
   ```
   
   Terminal 2 - Backend:
   ```bash
   npm run server
   ```

6. **Access the app**
   ```
   http://localhost:5173
   ```

---

## 🔑 Getting API Keys

### Groq API (Required for AI features)
1. Go to https://console.groq.com/
2. Sign up for free account
3. Create API key
4. Add to `.env` file

### Agora.io (Optional - for Live Classes)
1. Go to https://www.agora.io/
2. Sign up and create project
3. Get App ID and Certificate
4. Add to `.env`:
   ```env
   VITE_AGORA_APP_ID=your_app_id
   AGORA_APP_CERTIFICATE=your_certificate
   ```

### AWS S3 (Optional - for book storage)
1. Create AWS account
2. Create S3 bucket
3. Get access keys
4. Add to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=ap-south-1
   S3_BUCKET_NAME=your_bucket_name
   ```

---

## 📁 Project Structure

```
edulearn-v3.0.0/
├── src/
│   ├── components/          # React components
│   │   ├── AIAssistant.jsx
│   │   ├── Dashboard.jsx
│   │   ├── GuideBooks.jsx
│   │   ├── NotesPanel.jsx
│   │   ├── LiveClasses/
│   │   │   └── ClassSchedule.jsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── groqService.js
│   │   ├── voiceService.js
│   │   ├── notesStorage.js
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   └── notesExport.js
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx
│   └── data/                # Static data
│       └── booksData.js
├── public/                  # Static assets
│   ├── troubleshoot.html
│   ├── fix-version.html
│   └── ...
├── server.cjs               # Backend server
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start frontend dev server
npm run server           # Start backend server
npm run dev:full         # Start both servers

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Mobile (Capacitor)
npm run mobile:build     # Build for mobile
npm run mobile:android   # Open Android Studio
npm run mobile:ios       # Open Xcode
```

---

## 🌐 Deployment

### Option 1: Vercel (Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

### Option 2: Netlify (Frontend)
1. Build: `npm run build`
2. Deploy `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Option 3: Heroku (Full Stack)
1. Create `Procfile`:
   ```
   web: node server.cjs
   ```
2. Deploy to Heroku
3. Add environment variables

### Option 4: VPS (DigitalOcean, AWS, etc.)
1. Set up Node.js on server
2. Clone/upload code
3. Install dependencies
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.cjs
   pm2 start "npm run dev" --name frontend
   ```
5. Set up Nginx as reverse proxy

---

## 📱 Mobile App Build

### Android
1. Install Android Studio
2. Run: `npm run mobile:android`
3. Build APK from Android Studio

### iOS
1. Install Xcode (Mac only)
2. Run: `npm run mobile:ios`
3. Build from Xcode

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# Required
VITE_GROQ_API_KEY=your_groq_api_key

# Optional
VITE_GROQ_MODEL=llama-3.3-70b-versatile
VITE_AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket
PORT=3001
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"
**Solution:** Run `npm install`

### Issue: "Port already in use"
**Solution:** 
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Issue: Voice recording not working
**Solution:** 
- Use Chrome or Edge browser
- Allow microphone permissions
- Check if HTTPS is enabled (required for mic access)

### Issue: Notes not saving
**Solution:**
- Check browser localStorage is enabled
- Clear browser cache
- Check console for errors

### Issue: AI not responding
**Solution:**
- Verify Groq API key in `.env`
- Check API quota/limits
- Check network connection

---

## 📚 Documentation

- **Notes Feature:** See `NOTES_IMPLEMENTATION_GUIDE.md`
- **Live Classes:** See `LIVE_CLASSES_IMPLEMENTATION_GUIDE.md`
- **Troubleshooting:** Visit `/troubleshoot.html` in browser

---

## 🔐 Security Notes

1. **Never commit .env file** to version control
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Implement rate limiting** for API endpoints
5. **Validate user input** on backend
6. **Use secure authentication** (JWT recommended)

---

## 📊 Performance Tips

1. **Enable caching** for static assets
2. **Use CDN** for images and videos
3. **Lazy load** components
4. **Optimize images** before upload
5. **Use production build** for deployment
6. **Enable gzip compression**

---

## 🆘 Support

### Common Issues
- Check `/troubleshoot.html` page
- Read implementation guides
- Check browser console for errors

### Resources
- Groq API Docs: https://console.groq.com/docs
- Agora Docs: https://docs.agora.io/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/

---

## 📝 Version History

### v3.0.0 (Current)
- ✅ Student Notes/Clipboard feature
- ✅ Voice recording (24 languages)
- ✅ Dual-language AI responses
- ✅ Live Classes preview
- ✅ Clear cache functionality
- ✅ Enhanced UI/UX

### v2.0.0
- Voice recording feature
- Dual-language support
- Cache management

### v1.0.0
- Initial release
- AI Assistant
- Books & Guides
- Quiz system

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Credits

Built with:
- React + Vite
- Groq AI
- Lucide Icons
- React Quill
- Agora.io (optional)

---

## 🎯 Next Steps

1. Install dependencies
2. Add Groq API key
3. Start development servers
4. Test all features
5. Customize for your needs
6. Deploy to production

**Happy Learning! 📚✨**
