# 🎬 Fix Video Playback - Add CORS to S3

## ⚠️ Current Issue
Videos are stored in S3 but cannot play due to missing CORS configuration.

---

## ✅ Solution: Add CORS Configuration to S3 Bucket

### Step 1: Open AWS S3 Console
Click this link: https://s3.console.aws.amazon.com/s3/buckets/edulearn-books-storage?region=ap-south-1&tab=permissions

### Step 2: Find CORS Section
On the Permissions tab, scroll down until you see:
```
Cross-origin resource sharing (CORS)
```

### Step 3: Click "Edit" Button
Click the "Edit" button on the right side of the CORS section.

### Step 4: Paste This Configuration
Delete any existing content and paste this JSON:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "https://ai-bharat-educational-platform.vercel.app",
            "https://*.vercel.app"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Length",
            "Content-Range",
            "Accept-Ranges"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 5: Save Changes
Click the "Save changes" button at the bottom.

---

## 🧪 Test After Adding CORS

1. Wait 1-2 minutes for AWS to apply changes
2. Clear browser cache: `Ctrl + Shift + Delete`
3. Hard refresh video page: `Ctrl + F5`
4. Try playing the video again
5. Video should now play! 🎉

---

## 📊 What This Does

This CORS configuration:
- ✅ Allows your Vercel domain to access videos
- ✅ Allows localhost for development
- ✅ Allows all Vercel preview deployments
- ✅ Exposes necessary headers for video streaming
- ✅ Allows GET and HEAD requests (for video playback)

---

## 🔍 How to Verify It's Working

After adding CORS, when you try to play a video:
- ❌ Before: "Video playback error: undefined"
- ✅ After: Video plays smoothly

---

## 🆘 If You Still Have Issues

1. Check that CORS was saved correctly in S3
2. Verify the JSON format is correct (no syntax errors)
3. Make sure you're using the correct bucket: `edulearn-books-storage`
4. Try a different browser or incognito mode

---

**This is the ONLY remaining step to make videos work!**

Your deployment is complete and working perfectly except for this one S3 CORS configuration.
