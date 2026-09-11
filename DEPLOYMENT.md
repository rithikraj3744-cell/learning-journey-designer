# Backend Deployment Guide

## Deploy to Render (Free Hosting)

### Step 1: Push Your Code to GitHub
```bash
git add .
git commit -m "Configure backend for Render deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create New Web Service
1. Click "New +" button → "Web Service"
2. Connect your GitHub repository
3. Render will auto-detect the `render.yaml` configuration
4. Click "Apply" to create the service

### Step 4: Add Environment Variable
1. In your new service dashboard, go to "Environment"
2. Add the environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
3. Click "Save Changes"

### Step 5: Deploy
1. Render will automatically deploy your backend
2. Wait 3-5 minutes for the build to complete
3. You'll get a public URL like: `https://learning-journey-backend.onrender.com`

### Step 6: Update Frontend Configuration
1. Copy your Render backend URL
2. Open `frontend/.env`
3. Update `VITE_API_URL` to your Render URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
4. Redeploy your frontend on Vercel

### Step 7: Test
Visit your frontend and try the AI Explain feature. It should now work for all users!

## Important Notes

- **Free Tier**: Render's free tier spins down after 15 minutes of inactivity
- **Cold Starts**: First request after inactivity may take 30-60 seconds
- **API Key Security**: Never commit your API key to GitHub
- **CORS**: Already configured to allow all origins in `deploy/app.py`

## Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Logs tab
- Verify GEMINI_API_KEY is set in environment variables

### Frontend can't connect
- Verify VITE_API_URL in frontend/.env matches your Render URL
- Check CORS settings in backend
- Clear browser cache and reload

### Build fails
- Check Python version (3.11.0)
- Verify all dependencies in backend/requirements.txt
- Check Render build logs for specific errors
