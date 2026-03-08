# ⚡ Quick Deploy Commands

## 🚀 Step-by-Step Commands

### Step 1: Initialize Git & Push to GitHub

```bash
# Navigate to project
cd "AI-Bharat (2)/AI-Bharat"

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI-Bharat Educational Platform"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-bharat-educational-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Frontend (Vercel)

**Via Website:**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variables (see below)
5. Click Deploy

**Environment Variables for Vercel:**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyBrKkpwV4LqGyFMZPuRp-hWlo6n_bLXDnE
VITE_FIREBASE_AUTH_DOMAIN=ai-bharat-769a6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-bharat-769a6
VITE_FIREBASE_STORAGE_BUCKET=ai-bharat-769a6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=158011790496
VITE_FIREBASE_APP_ID=1:158011790496:web:768dcc1a4989a40f7b65c5
```

---

### Step 3: Deploy Backend (Render)

**Via Website:**
1. Go to https://dashboard.render.com/
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `ai-bharat-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables (see below)
6. Click Create Web Service

**Environment Variables for Render:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_bucket_name
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
DYNAMODB_TABLE_USER_HISTORY=UserHistory
DYNAMODB_TABLE_FOCUS=FocusTracking
DYNAMODB_TABLE_HEALTH=HealthLogs
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

### Step 4: Update Frontend with Backend URL

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `VITE_API_URL` with your Render URL
4. Redeploy

---

### Step 5: Configure Firebase

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `ai-bharat-769a6`
3. Authentication → Settings → Authorized domains
4. Add your Vercel domain: `your-app.vercel.app`

---

## 🔄 Update Deployment

```bash
# Make changes to your code
# Then:

git add .
git commit -m "Your update message"
git push origin main

# Both Vercel and Render will auto-deploy!
```

---

## 🧪 Test Your Deployment

```bash
# Test Frontend
curl https://your-app.vercel.app

# Test Backend
curl https://your-backend.onrender.com/health

# Test API
curl https://your-backend.onrender.com/api/chat
```

---

## 📝 Important Notes

1. **Free Tier Limitations:**
   - Render: Spins down after 15 min inactivity (30-60s cold start)
   - Vercel: 100GB bandwidth/month
   - AWS: Pay per use

2. **Security:**
   - Never commit `.env` files
   - Keep AWS credentials secure
   - Use environment variables

3. **Monitoring:**
   - Check Vercel Analytics
   - Monitor Render logs
   - Watch AWS costs

---

## 🆘 Quick Fixes

### Build Failed?
```bash
# Test locally first
npm install
npm run build
```

### CORS Error?
- Check `backend/server.js` CORS config
- Verify Vercel URL is allowed
- Check browser console

### API Not Working?
- Verify `VITE_API_URL` in Vercel
- Check Render logs
- Test backend URL directly

---

## ✅ Deployment Checklist

- [ ] Code on GitHub
- [ ] Frontend on Vercel
- [ ] Backend on Render
- [ ] Environment variables set
- [ ] Firebase domains added
- [ ] CORS configured
- [ ] All features tested

---

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- GitHub: `https://github.com/YOUR_USERNAME/ai-bharat-educational-platform`

🎉 **You're Live!**
