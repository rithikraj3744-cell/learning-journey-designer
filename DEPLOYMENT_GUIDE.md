# 🚀 Deployment Guide - Learning Journey Designer

## Overview
This guide covers deploying your full-stack Learning Journey Designer application:
- **Frontend (React + Vite)** → Vercel
- **Backend (Flask + AI)** → Render (free tier)

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at vercel.com)
- ✅ Render account (sign up at render.com)
- ✅ Your Firebase credentials
- ✅ Your Gemini API key

---

## Part 1: Deploy Backend to Render 🐍

### Step 1: Prepare Backend for Deployment

Your backend is already prepared! But let's verify the files:

**Files needed:**
- ✅ `requirements.txt` - Already exists
- ✅ `app.py` - Already exists
- ✅ `.env` - Will be configured on Render

### Step 2: Create Render Account & Deploy

1. **Go to** https://render.com
2. **Sign up** with GitHub
3. **Click** "New +" → "Web Service"
4. **Connect** your GitHub repository
5. **Configure** the service:

```
Name: learning-journey-backend
Environment: Python 3
Region: Choose closest to you
Branch: main (or your default branch)
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
Instance Type: Free
```

### Step 3: Add Environment Variables on Render

Go to Environment tab and add:

```
GEMINI_API_KEY=<your_gemini_api_key>
PORT=5000
FLASK_ENV=production
FRONTEND_URL=https://your-app.vercel.app
FIREBASE_PROJECT_ID=<your_firebase_project_id>
```

**Get these from your local `.env` file!**

### Step 4: Deploy!

Click "Create Web Service" and wait 5-10 minutes.

**Your backend URL will be:** `https://learning-journey-backend.onrender.com`

**⚠️ Copy this URL! You'll need it for the frontend.**

---

## Part 2: Deploy Frontend to Vercel ⚡

### Step 1: Update Frontend Environment Variables

Create `.env.production` in the `frontend` folder:

```env
VITE_AI_BACKEND_URL=https://learning-journey-backend.onrender.com
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
```

### Step 2: Push to GitHub

```bash
# In your project root
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/learning-journey-designer.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to** https://vercel.com
2. **Click** "Add New" → "Project"
3. **Import** your GitHub repository
4. **Configure:**

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. **Add Environment Variables** (same as .env.production)

6. **Click** "Deploy"

Wait 2-3 minutes. Your app will be live!

**Your frontend URL:** `https://your-app-name.vercel.app`

---

## Part 3: Connect Frontend & Backend 🔗

### Update Backend CORS

After deployment, update your backend's CORS settings:

In Render, go to Environment and update:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

Then manually restart the backend service in Render.

---

## Part 4: Test Your Deployment ✅

1. **Visit** your Vercel URL
2. **Test:**
   - ✅ User registration/login
   - ✅ Browse competencies
   - ✅ Generate quiz (AI feature)
   - ✅ AI explanations
   - ✅ Knowledge graph

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Backend not responding
**Solution:**
- Check Render logs
- Verify all environment variables are set
- Make sure `gunicorn` is in requirements.txt

**Problem:** AI features not working
**Solution:**
- Verify GEMINI_API_KEY is set correctly on Render
- Check backend logs for model loading errors

### Frontend Issues

**Problem:** Can't connect to backend
**Solution:**
- Verify VITE_AI_BACKEND_URL points to your Render URL
- Check browser console for CORS errors
- Make sure backend FRONTEND_URL matches your Vercel URL

**Problem:** Firebase errors
**Solution:**
- Double-check all Firebase environment variables
- Make sure they start with `VITE_`
- Verify Firebase project settings allow your Vercel domain

---

## 💰 Cost Breakdown

**Free Tier Limits:**

**Render (Backend):**
- ✅ 750 hours/month free
- ⚠️ Sleeps after 15 min of inactivity
- ⚠️ Cold start: ~30 seconds

**Vercel (Frontend):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Always-on, no cold starts

**Total: $0/month** for moderate usage!

---

## 🚀 Optional: Custom Domain

### Add Custom Domain to Vercel

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records (Vercel will guide you)

### Update Backend CORS

After adding custom domain:
```
FRONTEND_URL=https://yourdomain.com
```

---

## 📊 Monitoring

**Render Dashboard:**
- Check backend logs
- Monitor API usage
- Track errors

**Vercel Dashboard:**
- View deployment history
- Check build logs
- Monitor performance

**Firebase Console:**
- User analytics
- Database usage
- Authentication logs

---

## 🔄 Future Deployments

**Frontend Updates:**
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys! ✨

**Backend Updates:**
```bash
git add backend/
git commit -m "Update backend"
git push
```
Render auto-deploys! ✨

---

## 🆘 Need Help?

Common issues and solutions:

1. **CORS errors** → Check FRONTEND_URL in backend
2. **AI not working** → Verify Gemini API key
3. **Firebase errors** → Check all VITE_ env vars
4. **Backend sleeping** → First request takes ~30s (free tier)

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed to Render
- [ ] All backend env vars configured
- [ ] Backend URL saved
- [ ] Frontend .env.production created
- [ ] Frontend pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] All frontend env vars configured
- [ ] Backend CORS updated with Vercel URL
- [ ] Tested all major features
- [ ] Firebase authentication working
- [ ] AI features working
- [ ] Custom domain added (optional)

---

🎉 **Congratulations! Your app is now live!**

Share your URL and start helping people design their learning journeys!
