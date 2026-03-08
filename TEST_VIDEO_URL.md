# 🧪 Test Video URL Directly

## Step 1: Get the Presigned URL

1. Open your video page
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for a line that says: "Current video URL:"
5. Copy the full S3 URL (starts with https://edulearn-books-storage.s3...)

## Step 2: Test the URL

1. Open a new browser tab
2. Paste the URL
3. Press Enter

## Expected Results:

### ✅ If CORS is Working:
- Video should download or play in the browser
- No errors

### ❌ If CORS is Not Working:
- You'll see an XML error message
- Or "Access Denied" error

## Step 3: Report Back

Tell me what you see when you open the URL directly!

---

## Alternative: Check S3 Bucket Policy

The CORS might be correct, but the bucket policy might be blocking access.

### Go to S3 Bucket Policy:
1. AWS S3 Console → edulearn-books-storage
2. Permissions tab
3. Scroll to "Bucket policy"
4. Check if there's a policy that blocks public access

If the bucket policy is empty or blocks access, we need to add a policy that allows GetObject.
