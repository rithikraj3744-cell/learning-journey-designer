# 🚀 Backend AI Services Setup Guide

## Problem
You're seeing "Failed to load" errors for AI features (quiz generation, AI summary, knowledge graph) because the backend server isn't running.

## Solution

### Step 1: Setup Backend (First Time Only)
1. Open the `backend` folder
2. Double-click `SETUP_BACKEND.bat`
3. Wait for all dependencies to install (may take 2-5 minutes)

### Step 2: Start Backend Server
1. Double-click `START_BACKEND.bat`
2. Wait until you see: "🚀 Learning Journey Designer API"
3. Leave this window open while using the app

### Step 3: Verify It's Working
Open your browser and go to: http://localhost:5000/health

You should see:
```json
{
  "status": "healthy",
  "firebase": "connected",
  "ai_service": "configured"
}
```

### Step 4: Use Your App
Now when you use AI features in your frontend, they will work:
- ✅ Quiz Generator
- ✅ AI Summary
- ✅ Knowledge Graph
- ✅ AI Explanations

## Troubleshooting

### "Module not found" errors
Run `SETUP_BACKEND.bat` again to reinstall dependencies.

### Port 5000 already in use
1. Close any other apps using port 5000
2. Or edit `.env` file and change `PORT=5000` to another port like `PORT=5001`
3. Also update frontend's `.env` to match: `VITE_AI_BACKEND_URL=http://localhost:5001`

### API key issues
Your Gemini API key is already configured in `.env`. If you need a new one:
1. Go to https://makersuite.google.com/app/apikey
2. Create a free API key
3. Update `GEMINI_API_KEY` in the `.env` file

## Keep Backend Running
The backend must stay running for AI features to work. You'll see a terminal window - don't close it!

To stop the server: Press `Ctrl+C` in the terminal window.
