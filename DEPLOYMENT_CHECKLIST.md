# ✅ Deployment Checklist - AI-Bharat Platform

## Pre-Deployment Verification

### 1. Code Preparation
- [ ] All code changes committed to Git
- [ ] `.env` files NOT committed (check `.gitignore`)
- [ ] `.env.example` files are up to date
- [ ] No console.log statements with sensitive data
- [ ] All dependencies installed (`npm install`)
- [ ] Build works locally (`npm run build`)

### 2. Environment Variables Ready

#### Frontend Environment Variables (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend Environment Variables (backend/.env)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
S3_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
DYNAMODB_TABLE_USER_HISTORY=UserHistory
DYNAMODB_TABLE_FOCUS=FocusTracking
DYNAMODB_TABLE_HEALTH=HealthLogs
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### 3. AWS Services Setup
- [ ] AWS Account created
- [ ] IAM user created with programmatic access
- [ ] Bedrock access enabled (Claude/Gemma models)
- [ ] S3 bucket created
- [ ] S3 bucket CORS configured
- [ ] DynamoDB tables created:
  - [ ] UserHistory table
  - [ ] FocusTracking table
  - [ ] HealthLogs table
- [ ] AWS credentials tested locally

### 4. Firebase Setup
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firebase config copied to .env
- [ ] Test authentication locally

---

## Deployment Steps

### Step 1: Push to GitHub ✅

```bash
# Navigate to project
cd "AI-Bharat (2)/AI-Bharat"

# Initialize Git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI-Bharat Educational Platform"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-bharat-platform.git

# Push
git branch -M main
git push -u origin main
```

**Verification:**
- [ ] Code visible on GitHub
- [ ] No `.env` files in repository
- [ ] README.md displays correctly

---

### Step 2: Deploy Backend (Render) 🖥️

1. **Create Web Service**
   - [ ] Go to https://dashboard.render.com/
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect GitHub repository

2. **Configure Service**
   - [ ] Name: `ai-bharat-backend`
   - [ ] Region: Choose closest to you
   - [ ] Branch: `main`
   - [ ] Root Directory: `backend`
   - [ ] Runtime: `Node`
   - [ ] Build Command: `npm install`
   - [ ] Start Command: `npm start`
   - [ ] Instance Type: `Free` (or paid for better performance)

3. **Add Environment Variables**
   Copy all variables from `backend/.env.example` and fill with actual values:
   - [ ] AWS_REGION
   - [ ] AWS_ACCESS_KEY_ID
   - [ ] AWS_SECRET_ACCESS_KEY
   - [ ] BEDROCK_REGION
   - [ ] BEDROCK_MODEL_ID
   - [ ] S3_REGION
   - [ ] S3_BUCKET_NAME
   - [ ] DYNAMODB_TABLE_USER_HISTORY
   - [ ] DYNAMODB_TABLE_FOCUS
   - [ ] DYNAMODB_TABLE_HEALTH
   - [ ] PORT (set to 3001)
   - [ ] NODE_ENV (set to production)
   - [ ] FRONTEND_URL (will update after frontend deployment)

4. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait 5-10 minutes for deployment
   - [ ] Copy your backend URL: `https://ai-bharat-backend.onrender.com`

5. **Test Backend**
   - [ ] Visit: `https://your-backend.onrender.com/health`
   - [ ] Should see: `{"status":"ok","message":"Server is running"}`
   - [ ] Check logs for any errors

---

### Step 3: Deploy Frontend (Vercel) 🌐

1. **Import Project**
   - [ ] Go to https://vercel.com/new
   - [ ] Sign in with GitHub
   - [ ] Import your repository

2. **Configure Project**
   - [ ] Framework Preset: `Vite`
   - [ ] Root Directory: `./` (leave as is)
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`

3. **Add Environment Variables**
   - [ ] VITE_API_URL = `https://your-backend.onrender.com` (from Step 2)
   - [ ] VITE_FIREBASE_API_KEY = (from Firebase Console)
   - [ ] VITE_FIREBASE_AUTH_DOMAIN = (from Firebase Console)
   - [ ] VITE_FIREBASE_PROJECT_ID = (from Firebase Console)
   - [ ] VITE_FIREBASE_STORAGE_BUCKET = (from Firebase Console)
   - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID = (from Firebase Console)
   - [ ] VITE_FIREBASE_APP_ID = (from Firebase Console)

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait 2-3 minutes for build
   - [ ] Copy your frontend URL: `https://your-app.vercel.app`

5. **Test Frontend**
   - [ ] Visit your Vercel URL
   - [ ] Landing page loads correctly
   - [ ] No console errors (F12)

---

### Step 4: Connect Frontend & Backend 🔗

1. **Update Backend FRONTEND_URL**
   - [ ] Go to Render Dashboard
   - [ ] Select your backend service
   - [ ] Environment → Edit
   - [ ] Update `FRONTEND_URL` = `https://your-app.vercel.app`
   - [ ] Save (backend will auto-redeploy)

2. **Verify CORS**
   - [ ] Backend `server.js` already configured for Vercel domains
   - [ ] Check backend logs for CORS errors
   - [ ] Test API calls from frontend

---

### Step 5: Configure Firebase Authorized Domains 🔐

1. **Add Vercel Domain**
   - [ ] Go to Firebase Console: https://console.firebase.google.com/
   - [ ] Select your project
   - [ ] Authentication → Settings → Authorized domains
   - [ ] Click "Add domain"
   - [ ] Add: `your-app.vercel.app`
   - [ ] Save

2. **Test Authentication**
   - [ ] Try to register a new account
   - [ ] Try to login with email/password
   - [ ] Try Google Sign-In
   - [ ] Check Firebase Console for new users

---

## Post-Deployment Testing

### Functional Testing
- [ ] **Landing Page**: Loads correctly, all links work
- [ ] **Registration**: Can create new account
- [ ] **Login**: Can login with email/password
- [ ] **Google Sign-In**: Works correctly
- [ ] **Profile Setup**: Can select state, class, subjects
- [ ] **Dashboard**: Displays correctly with user data
- [ ] **AI Chat**: Can send messages and get responses
- [ ] **Quiz**: Can generate and take quizzes
- [ ] **Videos**: Can view video list (if uploaded)
- [ ] **Books**: Can view book list (if uploaded)
- [ ] **Visualizations**: Interactive visualizations work
- [ ] **Focus Tracker**: Real-time tracking works
- [ ] **Health Tracker**: Can log health data
- [ ] **Activity History**: Tracks user activities
- [ ] **Logout**: Can logout successfully

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 2 seconds
- [ ] No console errors
- [ ] No network errors
- [ ] Images load correctly
- [ ] Mobile responsive (test on phone)

### Security Testing
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] No exposed API keys in frontend code
- [ ] CORS working correctly
- [ ] Authentication required for protected routes
- [ ] Firebase security rules configured

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check Vercel Analytics for traffic
- [ ] Check Render logs for errors
- [ ] Monitor AWS costs
- [ ] Check Firebase usage

### Weekly Checks
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Monitor user feedback
- [ ] Update dependencies if needed

### Monthly Checks
- [ ] Review AWS bill
- [ ] Check DynamoDB storage usage
- [ ] Review S3 storage costs
- [ ] Backup important data
- [ ] Update documentation

---

## Troubleshooting Common Issues

### Issue: Frontend can't connect to backend
**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify backend is running (visit `/health` endpoint)
3. Check CORS configuration in `backend/server.js`
4. Check browser console for specific errors

### Issue: Authentication not working
**Solution:**
1. Verify Firebase config in Vercel environment variables
2. Check Firebase Authorized Domains includes Vercel URL
3. Check Firebase Console for error logs
4. Verify Firebase Authentication is enabled

### Issue: AWS services not working
**Solution:**
1. Verify AWS credentials in Render environment variables
2. Check IAM permissions for Bedrock, S3, DynamoDB
3. Verify AWS region is correct
4. Check Render logs for AWS SDK errors

### Issue: Build fails on Vercel
**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Check for missing environment variables

### Issue: Backend spins down (Render Free Tier)
**Solution:**
1. First request after 15 min will take 30-60 seconds (cold start)
2. Consider upgrading to paid plan for always-on service
3. Implement frontend loading state for cold starts
4. Use Render's "Keep Alive" feature (paid plans)

---

## Cost Optimization

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month (usually sufficient)
- **Render**: 750 hours/month (enough for 1 service)
- **AWS Bedrock**: Pay per API call (~$0.003 per 1K tokens)
- **AWS S3**: ~$0.023/GB/month
- **AWS DynamoDB**: Free tier 25GB
- **Firebase**: Free for up to 50,000 MAU

### Tips to Reduce Costs
1. **Cache API responses** where possible
2. **Optimize images** before uploading to S3
3. **Use DynamoDB TTL** to auto-delete old data
4. **Monitor AWS costs** regularly
5. **Set up billing alerts** in AWS Console
6. **Use Bedrock efficiently** (shorter prompts, cache responses)

---

## Scaling Considerations

### When to Upgrade

**Vercel (Frontend):**
- Upgrade to Pro ($20/mo) when:
  - Exceeding 100GB bandwidth
  - Need team collaboration
  - Want advanced analytics

**Render (Backend):**
- Upgrade to Starter ($7/mo) when:
  - Need always-on service (no cold starts)
  - Require more memory/CPU
  - Need faster response times

**AWS:**
- Monitor costs and optimize:
  - Use S3 lifecycle policies
  - Implement caching layers
  - Optimize Bedrock usage
  - Use DynamoDB on-demand pricing

---

## Success Criteria ✅

Your deployment is successful when:
- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Render URL
- [ ] Users can register and login
- [ ] AI chat works correctly
- [ ] All features functional
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Authentication secure
- [ ] Performance acceptable

---

## Support & Resources

### Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **AWS Bedrock**: https://docs.aws.amazon.com/bedrock/
- **Firebase**: https://firebase.google.com/docs

### Community
- **GitHub Issues**: Report bugs and request features
- **Stack Overflow**: Search for solutions
- **Discord/Slack**: Join developer communities

---

## 🎉 Congratulations!

Your AI-Bharat Educational Platform is now live and serving students across India!

**Your Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- GitHub: `https://github.com/YOUR_USERNAME/ai-bharat-platform`

**Next Steps:**
1. Share with beta testers
2. Gather feedback
3. Monitor performance
4. Iterate and improve
5. Scale as needed

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Made with ❤️ for Indian Education** 🇮🇳
