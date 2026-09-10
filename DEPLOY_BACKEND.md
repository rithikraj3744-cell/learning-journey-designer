# Deploy Backend to Render.com (Free)

## Quick Deploy Steps:

### 1. Push Backend to GitHub
Your backend code needs to be in the same repo (already is!)

### 2. Go to Render.com
Visit: https://render.com/

### 3. Sign Up / Log In
- Sign up with your GitHub account
- It's FREE for hobby projects

### 4. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository: `learning-journey-designer`
- Select branch: `main`
- Root directory: `backend`

### 5. Configure Service
**Name**: `learning-journey-backend`
**Region**: Oregon (US West) - free tier
**Branch**: `main`
**Root Directory**: `backend`
**Runtime**: Python 3
**Build Command**: `pip install -r requirements.txt`
**Start Command**: `gunicorn app:app`
**Plan**: Free

### 6. Add Environment Variables
Click "Environment" and add:
- **GEMINI_API_KEY**: (Your Google AI Studio API key)
- **PORT**: `10000`

### 7. Deploy
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- You'll get a URL like: `https://learning-journey-backend.onrender.com`

### 8. Update Frontend
Once deployed, update Vercel environment variable:
```bash
vercel env add VITE_API_BASE_URL production --value "https://your-backend-url.onrender.com" --yes
vercel --prod --yes
```

## Alternative: Use Railway.app

Railway is another free option that's even easier:

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `learning-journey-designer`
5. Set root directory: `backend`
6. Add environment variables
7. Deploy!

## Your Backend Will Be Available 24/7!

Once deployed, your AI features will work on any device without running a local server.
