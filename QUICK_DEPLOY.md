# Quick Deployment Guide - Make Backend Accessible to All Users

## Overview
Your AI features currently require a backend server. This guide will help you deploy it to Render (free hosting) so ALL users from ANY device can access the AI Explain, Quiz, and other AI features.

## Step-by-Step Deployment

### 1. Commit and Push Your Code
```bash
git add .
git commit -m "Configure backend for Render deployment"
git push origin main
```

### 2. Deploy Backend to Render

#### A. Create Render Account
1. Go to https://render.com
2. Sign up using your GitHub account
3. Click "Authorize Render" to connect to your repositories

#### B. Create New Web Service
1. Click **"New +"** button in top right
2. Select **"Web Service"**
3. Connect your repository: `learning-journey-designer`
4. Render will auto-detect your `render.yaml` configuration
5. Click **"Apply"** to create the service

#### C. Configure Environment Variables
1. In your new service dashboard, click **"Environment"** in left sidebar
2. Add environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `YOUR_ACTUAL_GEMINI_API_KEY`
3. Click **"Save Changes"**

#### D. Deploy
1. Render automatically starts building and deploying
2. Wait 3-5 minutes for the first deployment
3. Your backend URL will be: `https://learning-journey-backend.onrender.com`
4. Copy this URL - you'll need it for the next step

### 3. Update Frontend Configuration

#### A. Update Local Environment File
Edit `frontend/.env`:
```env
VITE_API_BASE_URL=https://learning-journey-backend.onrender.com
```

#### B. Update Vercel Environment Variables
1. Go to https://vercel.com
2. Open your project: `learning-journey-designer`
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://learning-journey-backend.onrender.com`
   - **Environments**: Check all (Production, Preview, Development)
5. Click **"Save"**

#### C. Redeploy Frontend
```bash
cd frontend
git add .
git commit -m "Update API URL to use Render backend"
git push origin main
```

Vercel will automatically redeploy with the new environment variable.

### 4. Test Your Deployment

1. Wait 2-3 minutes for Vercel to finish deploying
2. Visit your live site: `https://learning-journey-designer.vercel.app`
3. Navigate to any competency
4. Click **"AI Explain"** button
5. Select your level and click **"Generate Explanation"**
6. It should work now! 🎉

## Important Notes

### Render Free Tier Limitations
- **Cold Starts**: Free tier services spin down after 15 minutes of inactivity
- **First Request**: After inactivity, first request may take 30-60 seconds to respond
- **Solution**: Consider upgrading to paid tier ($7/month) for always-on service

### Troubleshooting

#### Backend Not Responding
1. Check Render logs:
   - Go to your service dashboard
   - Click **"Logs"** tab
   - Look for errors
2. Verify `GEMINI_API_KEY` is set correctly
3. Test the backend directly: `https://your-backend-url.onrender.com/api/health`

#### Frontend Can't Connect
1. Clear browser cache and hard reload (Ctrl+Shift+R)
2. Check browser console for errors (F12)
3. Verify `VITE_API_BASE_URL` in Vercel matches your Render URL exactly
4. Make sure you redeployed the frontend after changing environment variables

#### CORS Errors
- Already configured in `backend/deploy/app.py` (line 13)
- If still getting CORS errors, check Render logs

## Alternative: Deploy to Railway

If Render doesn't work, you can try Railway:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variable: `GEMINI_API_KEY`
6. Railway auto-detects Python and deploys
7. Copy the generated URL and update frontend `.env`

## Cost Comparison

| Service | Free Tier | Paid Tier | Cold Starts |
|---------|-----------|-----------|-------------|
| Render | 750 hours/month | $7/month | Yes |
| Railway | $5 credit/month | $5/month usage-based | No |
| Heroku | No free tier | $7/month | No |

## Getting Your Gemini API Key

If you don't have a Gemini API key:

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key
5. Add it to Render environment variables

**Free Tier**: 60 requests per minute, plenty for testing!

## Need Help?

- Check Render logs for backend errors
- Check Vercel logs for frontend deployment issues
- Check browser console (F12) for API connection errors
- Make sure both services are using the same backend URL
