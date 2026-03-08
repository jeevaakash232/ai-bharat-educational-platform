# 🚀 Complete Deployment Guide - GitHub & Public URL

## ✨ What's Configured

Your project is already configured for seamless deployment:

✅ **API URL Configuration**: Frontend automatically uses `VITE_API_URL` environment variable  
✅ **CORS Setup**: Backend accepts requests from Vercel domains  
✅ **Environment Examples**: Both `.env.example` files are ready  
✅ **Build Configuration**: Vite configured for production builds  
✅ **Package Scripts**: Deployment scripts included  

**After deployment, both frontend and backend will work together automatically!**

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Prepare Your Project](#prepare-your-project)
3. [Upload to GitHub](#upload-to-github)
4. [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
5. [Deploy Backend (Render)](#deploy-backend-render)
6. [Configure Environment Variables](#configure-environment-variables)
7. [Test Your Deployment](#test-your-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### 1. Install Git (if not already installed)
**Windows:**
- Download from: https://git-scm.com/download/win
- Run installer with default settings
- Verify: Open Command Prompt and type `git --version`

**Check if Git is installed:**
```bash
git --version
```

### 2. Create Accounts (Free)
- ✅ **GitHub Account:** https://github.com/signup
- ✅ **Vercel Account:** https://vercel.com/signup (use GitHub to sign up)
- ✅ **Render Account:** https://render.com/register (use GitHub to sign up)

---

## 📦 Step 1: Prepare Your Project

### 1.1 Update .gitignore
Make sure your `.gitignore` file includes:

```bash
# Open .gitignore and verify it contains:
node_modules/
dist/
.env
.env.local
backend/node_modules/
backend/.env
*.log
.DS_Store
```

### 1.2 Secure Your Environment Variables
**IMPORTANT:** Never commit `.env` files to GitHub!

**Create `.env.example` files:**

**Frontend `.env.example`:**
```bash
# Copy your .env to .env.example and replace values with placeholders
VITE_API_URL=your_backend_url_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Backend `.env.example`:**
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# AWS Services
S3_BUCKET_NAME=your_bucket_name
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
DYNAMODB_TABLE_USER_HISTORY=UserHistory
DYNAMODB_TABLE_FOCUS=FocusTracking
DYNAMODB_TABLE_HEALTH=HealthLogs

# Server
PORT=3001
NODE_ENV=production
```

### 1.3 Update package.json Scripts
Verify your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 📤 Step 2: Upload to GitHub

### 2.1 Initialize Git Repository

Open Command Prompt or PowerShell in your project folder:

```bash
# Navigate to your project
cd "AI-Bharat (2)/AI-Bharat"

# Initialize Git (if not already initialized)
git init

# Check status
git status
```

### 2.2 Configure Git (First Time Only)

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.3 Add Files to Git

```bash
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# Commit the files
git commit -m "Initial commit: AI-Bharat Educational Platform"
```

### 2.4 Create GitHub Repository

1. **Go to GitHub:** https://github.com/new
2. **Repository Settings:**
   - Repository name: `ai-bharat-educational-platform`
   - Description: `AI-powered educational platform for Indian students`
   - Visibility: **Public** (for free deployment)
   - ❌ Don't initialize with README (you already have one)
3. **Click "Create repository"**

### 2.5 Push to GitHub

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/ai-bharat-educational-platform.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

✅ **Your code is now on GitHub!**

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Connect Vercel to GitHub

1. **Go to Vercel:** https://vercel.com/login
2. **Sign in with GitHub**
3. **Click "Add New Project"**
4. **Import your repository:**
   - Find `ai-bharat-educational-platform`
   - Click "Import"

### 3.2 Configure Vercel Project

**Framework Preset:** Vite
**Root Directory:** `./` (leave as is)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 3.3 Add Environment Variables

Click "Environment Variables" and add:

```
VITE_API_URL = https://your-backend-url.onrender.com
VITE_FIREBASE_API_KEY = AIzaSyBrKkpwV4LqGyFMZPuRp-hWlo6n_bLXDnE
VITE_FIREBASE_AUTH_DOMAIN = ai-bharat-769a6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = ai-bharat-769a6
VITE_FIREBASE_STORAGE_BUCKET = ai-bharat-769a6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 158011790496
VITE_FIREBASE_APP_ID = 1:158011790496:web:768dcc1a4989a40f7b65c5
```

**Note:** You'll update `VITE_API_URL` after deploying the backend.

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://ai-bharat-educational-platform.vercel.app`

✅ **Frontend is now live!** (But backend isn't connected yet)

---

## 🖥️ Step 4: Deploy Backend (Render)

### 4.1 Create Web Service

1. **Go to Render:** https://dashboard.render.com/
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub repository:**
   - Click "Connect account" if needed
   - Select `ai-bharat-educational-platform`

### 4.2 Configure Render Service

**Settings:**
- **Name:** `ai-bharat-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (for testing)

### 4.3 Add Environment Variables

Click "Environment" tab and add:

```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY = your_actual_aws_secret_key
S3_BUCKET_NAME = your_actual_bucket_name
BEDROCK_MODEL_ID = anthropic.claude-3-sonnet-20240229-v1:0
DYNAMODB_TABLE_USER_HISTORY = UserHistory
DYNAMODB_TABLE_FOCUS = FocusTracking
DYNAMODB_TABLE_HEALTH = HealthLogs
PORT = 3001
NODE_ENV = production
```

### 4.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://ai-bharat-backend.onrender.com`

✅ **Backend is now live!**

---

## 🔗 Step 5: Connect Frontend to Backend

### 5.1 Update Frontend Environment Variable

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Update `VITE_API_URL`:**
   ```
   VITE_API_URL = https://ai-bharat-backend.onrender.com
   ```
5. **Click "Save"**

### 5.2 Redeploy Frontend

1. **Go to Deployments tab**
2. **Click "..." on latest deployment**
3. **Click "Redeploy"**
4. Wait 2-3 minutes

✅ **Frontend and Backend are now connected!**

---

## 🔐 Step 6: Configure CORS (Backend)

Your backend needs to allow requests from your Vercel URL.

### 6.1 Update Backend CORS

**Edit `backend/server.js`:**

```javascript
// Update CORS configuration
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-bharat-educational-platform.vercel.app',
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true
}));
```

### 6.2 Push Changes to GitHub

```bash
# In your project directory
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

**Render will automatically redeploy!**

---

## 🧪 Step 7: Test Your Deployment

### 7.1 Automated Verification (Recommended)

Run the verification script to test your deployment:

```bash
node verify-deployment.js https://your-app.vercel.app https://your-backend.onrender.com
```

This will check:
- ✅ Backend health endpoint
- ✅ Backend API endpoints
- ✅ Frontend accessibility
- ✅ CORS configuration
- ✅ Response times

### 7.2 Manual Testing

**Test Frontend:**
1. Visit your Vercel URL
2. Check if the landing page loads
3. Try to register/login
4. Navigate through different pages

**Test Backend:**
1. Open browser console (F12)
2. Check for any API errors
3. Test AI chat feature
4. Test quiz generation
5. Test video/book features

**Test Full Flow:**
1. Register a new account
2. Complete profile setup
3. Use AI assistant
4. Take a quiz
5. Watch a video
6. Check dashboard

### 7.3 Use Deployment Checklist

Follow the comprehensive checklist: `DEPLOYMENT_CHECKLIST.md`

This includes:
- Pre-deployment verification
- Step-by-step deployment
- Post-deployment testing
- Troubleshooting guide

---

## 🎯 Your Live URLs

After deployment, you'll have:

### Frontend (Vercel)
```
Production: https://ai-bharat-educational-platform.vercel.app
```

### Backend (Render)
```
API: https://ai-bharat-backend.onrender.com
```

### API Endpoints
```
Health Check: https://ai-bharat-backend.onrender.com/health
Chat: https://ai-bharat-backend.onrender.com/api/chat
Quiz: https://ai-bharat-backend.onrender.com/api/quiz
Videos: https://ai-bharat-backend.onrender.com/api/videos
Books: https://ai-bharat-backend.onrender.com/api/books
```

---

## 🔄 Future Updates

### To Update Your Deployment:

```bash
# Make your changes
# Then commit and push

git add .
git commit -m "Description of changes"
git push origin main
```

**Both Vercel and Render will automatically redeploy!**

---

## 🐛 Troubleshooting

### Issue: Build Failed on Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Check for missing environment variables

### Issue: Backend Not Responding

**Solution:**
1. Check Render logs
2. Verify environment variables are set
3. Check AWS credentials are correct
4. Verify DynamoDB tables exist

### Issue: CORS Errors

**Solution:**
1. Update CORS in `backend/server.js`
2. Add your Vercel URL to allowed origins
3. Push changes to GitHub
4. Wait for Render to redeploy

### Issue: API Calls Failing

**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is correct
3. Test backend URL directly in browser
4. Check network tab in DevTools

### Issue: Firebase Authentication Not Working

**Solution:**
1. Go to Firebase Console
2. Add your Vercel domain to authorized domains
3. Go to Authentication → Settings → Authorized domains
4. Add: `ai-bharat-educational-platform.vercel.app`

---

## 💰 Cost Breakdown

### Free Tier Limits:

**Vercel (Frontend):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domain support

**Render (Backend):**
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Cold start: 30-60 seconds
- ✅ Automatic HTTPS

**AWS (Services):**
- ⚠️ Pay per use
- S3: ~$0.023/GB/month
- DynamoDB: Free tier 25GB
- Bedrock: Pay per API call

**Firebase (Auth):**
- ✅ Free for up to 50,000 MAU

---

## 🎓 Best Practices

### 1. Security
- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Vercel/Render)
- ✅ Regularly update dependencies

### 2. Performance
- ✅ Enable caching
- ✅ Optimize images
- ✅ Minimize bundle size
- ✅ Use CDN for static assets

### 3. Monitoring
- ✅ Check Vercel Analytics
- ✅ Monitor Render logs
- ✅ Set up error tracking (Sentry)
- ✅ Monitor AWS costs

### 4. Backups
- ✅ Regular GitHub commits
- ✅ DynamoDB backups
- ✅ S3 versioning
- ✅ Database exports

---

## 📞 Support Resources

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Render
- Docs: https://render.com/docs
- Support: https://render.com/support

### GitHub
- Docs: https://docs.github.com
- Support: https://support.github.com

---

## ✅ Deployment Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] `.env` files not committed
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Firebase domains authorized
- [ ] AWS services configured
- [ ] DynamoDB tables created
- [ ] S3 buckets created
- [ ] All features tested
- [ ] Mobile responsive checked
- [ ] Error handling tested
- [ ] Performance optimized

---

## 🎉 Congratulations!

Your AI-Bharat Educational Platform is now live and accessible to the world!

**Share your project:**
- Frontend: `https://ai-bharat-educational-platform.vercel.app`
- GitHub: `https://github.com/YOUR_USERNAME/ai-bharat-educational-platform`

---

**Last Updated:** March 2026  
**Deployment Platform:** Vercel + Render  
**Estimated Setup Time:** 30-45 minutes
