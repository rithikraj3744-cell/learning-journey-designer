# 🚀 Deploy to Vercel - Step by Step Guide

**Last Updated:** September 10, 2026

## ✅ Pre-Deployment Checklist

- [x] `vercel.json` configured ✓
- [x] Firebase environment variables ready ✓
- [x] Production environment file exists ✓
- [x] Score display and topic recommendations implemented ✓
- [ ] Backend deployed (or backend URL ready)
- [ ] Git repository pushed to GitHub

---

## 📋 Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

---

## 🚀 Step 2: Deploy Using Vercel Dashboard (Easiest)

### 2.1 Create Vercel Account
1. Go to **https://vercel.com/signup**
2. Sign up with **GitHub** (recommended for auto-deployments)
3. Authorize Vercel to access your repositories

### 2.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Select your repository: `learning-journey-designer`
3. Click **"Import"**

### 2.3 Configure Build Settings
Vercel should auto-detect these settings, but verify:

```
Framework Preset: Vite
Root Directory: ./
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: cd frontend && npm install
```

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these (one by one):

**Required Firebase Variables:**
```
VITE_FIREBASE_API_KEY=<from frontend/.env.production>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

**Backend URL:**
```
VITE_API_BASE_URL=<your-backend-url-from-render>
```

**App Configuration:**
```
VITE_APP_NAME=Learning Journey Designer
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

> 💡 **Tip:** Copy values from `frontend/.env.production`

### 2.5 Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Get your deployment URL: `https://your-app.vercel.app`

---

## 💻 Step 3: Deploy Using Vercel CLI (Alternative)

### 3.1 Login to Vercel
```bash
vercel login
```

### 3.2 Deploy from Project Root
```bash
cd "C:\Users\Rithi\Desktop\s5 with claude\learning-journey-designer"
vercel
```

### 3.3 Follow the Prompts
```
? Set up and deploy? Yes
? Which scope? Your account
? Link to existing project? No
? What's your project's name? learning-journey-designer
? In which directory is your code located? ./
? Want to override settings? Yes
? Build Command: cd frontend && npm install && npm run build
? Output Directory: frontend/dist
? Development Command: cd frontend && npm run dev
```

### 3.4 Add Environment Variables via CLI
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID
vercel env add VITE_API_BASE_URL
vercel env add VITE_APP_NAME
vercel env add VITE_APP_VERSION
vercel env add VITE_APP_ENV
vercel env add VITE_ENABLE_ANALYTICS
```

### 3.5 Deploy to Production
```bash
vercel --prod
```

---

## 🔗 Step 4: Connect Backend (If Not Done Yet)

### 4.1 Get Your Vercel URL
After deployment, copy your URL: `https://your-app.vercel.app`

### 4.2 Update Backend CORS Settings
Go to your backend deployment (Render/Railway) and add:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 4.3 Redeploy Backend
Trigger a redeploy for CORS settings to take effect.

---

## ✅ Step 5: Test Your Deployment

Visit your Vercel URL and test:

- [ ] Homepage loads correctly
- [ ] User registration/login works
- [ ] Firebase authentication functional
- [ ] Browse competencies page loads
- [ ] AI features work (if backend is deployed)
- [ ] No console errors in browser DevTools

---

## 🔄 Step 6: Enable Auto-Deployments

With GitHub integration:
- Every push to `main` branch → Auto-deploys to production
- Every pull request → Creates a preview deployment
- Automatic HTTPS certificates
- Global CDN distribution

---

## 🎯 Quick Commands Reference

### Check deployment status:
```bash
vercel ls
```

### View deployment logs:
```bash
vercel logs
```

### Open project dashboard:
```bash
vercel dashboard
```

### Rollback to previous deployment:
Go to Vercel Dashboard → Deployments → Click on previous deployment → "Promote to Production"

---

## 🆘 Troubleshooting

### Build fails with "Module not found"
**Solution:** Check that `vercel.json` has correct paths:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

### Blank page after deployment
**Solution:** 
1. Check browser console for errors
2. Verify all environment variables are set in Vercel dashboard
3. Ensure `VITE_` prefix is on all variables

### Firebase authentication not working
**Solution:**
1. Add Vercel domain to Firebase authorized domains:
   - Go to Firebase Console → Authentication → Settings
   - Add `your-app.vercel.app` to authorized domains

### API calls failing (CORS errors)
**Solution:**
1. Ensure `VITE_API_BASE_URL` is set correctly
2. Update backend `FRONTEND_URL` environment variable
3. Redeploy backend

### Environment variables not updating
**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update the variable
3. Redeploy: Deployments → Click "..." → "Redeploy"

---

## 🎉 Success!

Your app is now live at: `https://your-app.vercel.app`

### Next Steps:
1. **Custom Domain:** Vercel Settings → Domains → Add your domain
2. **Analytics:** Check Vercel Analytics for traffic insights
3. **Monitoring:** Set up error tracking (Sentry, LogRocket)
4. **Performance:** Check Lighthouse scores

---

## 📞 Need Help?

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: Check `DEPLOYMENT_GUIDE.md`

---

**Deployment Date:** September 10, 2026  
**Project:** Learning Journey Designer  
**Frontend:** Vite + React + Firebase  
**New Features:** Assessment score persistence, topic recommendations on node click
