# 🚀 Quick Start - Deploy to Vercel

## What We're Deploying

- **Frontend** (React) → Vercel
- **Backend** (Flask + AI) → Render.com

## ⚡ Quick Deploy (15 minutes)

### 1️⃣ Deploy Backend First (5 min)

1. Go to **https://render.com** and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub repository**
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

5. Add **Environment Variables**:
   ```
   GEMINI_API_KEY=<your_key_from_backend/.env>
   PORT=5000
   FLASK_ENV=production
   ```

6. Click **"Create Web Service"**

7. **Copy your backend URL**: `https://your-app.onrender.com`

### 2️⃣ Deploy Frontend to Vercel (5 min)

1. Go to **https://vercel.com** and sign up
2. Click **"Add New"** → **"Project"**
3. Import your **GitHub repository**
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add **Environment Variables** (get from `frontend/.env`):
   ```
   VITE_AI_BACKEND_URL=<your_render_backend_url>
   VITE_FIREBASE_API_KEY=<your_firebase_key>
   VITE_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<your_project_id>
   VITE_FIREBASE_STORAGE_BUCKET=<your_project>.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
   VITE_FIREBASE_APP_ID=<your_app_id>
   ```

6. Click **"Deploy"**

### 3️⃣ Connect Frontend & Backend (2 min)

1. Go back to **Render dashboard**
2. Add one more environment variable:
   ```
   FRONTEND_URL=<your_vercel_url>
   ```
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### ✅ Done!

Visit your Vercel URL and test:
- User registration
- Browse competencies
- Generate AI quiz
- AI explanations

---

## 📁 Files Created for Deployment

All necessary files have been created:

- ✅ `vercel.json` - Vercel configuration
- ✅ `backend/Procfile` - Render startup command
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `DEPLOYMENT_GUIDE.md` - Detailed guide
- ✅ `frontend/.env.production.example` - Example env vars

---

## 🆘 Common Issues

**Backend not responding?**
- Wait 30 seconds (free tier cold start)
- Check Render logs for errors

**CORS errors?**
- Make sure `FRONTEND_URL` is set in Render
- Redeploy backend after updating

**AI features not working?**
- Verify `GEMINI_API_KEY` in Render
- Check backend logs

---

## 💡 Next Steps

1. **Custom Domain**: Add in Vercel settings
2. **Monitoring**: Check Render logs for issues
3. **Updates**: Just push to GitHub - auto-deploys!

Need more details? Read `DEPLOYMENT_GUIDE.md`
