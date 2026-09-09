# Learning Journey Designer - Setup Guide

## 🚀 Quick Start

This guide will help you get the AI quiz generation and knowledge graph features working.

---

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Google Gemini API Key (for AI features)

---

## 🔑 Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (it starts with `AIza...`)

---

## 🔧 Step 2: Configure Environment Variables

### Backend Configuration

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a `.env` file in the backend directory:
   ```bash
   # On Windows (Command Prompt)
   type nul > .env

   # On Windows (PowerShell)
   New-Item .env -ItemType File

   # On Mac/Linux
   touch .env
   ```

3. Open the `.env` file and add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

   Replace `your_api_key_here` with the API key you copied from Google AI Studio.

   Example:
   ```
   GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## 📦 Step 3: Install Dependencies

### Backend Dependencies

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend Dependencies (if needed)

```bash
cd frontend

# Install Node dependencies
npm install
```

---

## ▶️ Step 4: Start the Application

### 1. Start the Backend Server

Open a terminal in the `backend` folder and run:

```bash
python app_local.py
```

You should see:
```
✓ Loaded X resources from JSON
✓ Loaded X competencies from JSON
✓ Initialized knowledge graph service
✓ AI service initialized with Gemini API
Server: http://localhost:5000
```

**Important**: Make sure you see "✓ AI service initialized with Gemini API". If you see a warning instead, check your `.env` file.

### 2. Start the Frontend (in a separate terminal)

```bash
cd frontend
npm run dev
```

The frontend should start at `http://localhost:5173`

---

## ✅ Step 5: Test the Features

### Test Knowledge Graph
1. Navigate to **Knowledge Graph** page
2. You should see a network visualization of competencies
3. Try switching between "Full Graph", "By Category", and "Career Paths" views

### Test AI Quiz Generation
1. Navigate to a competency page (e.g., from Competencies list)
2. Look for a "Generate Quiz" or "Practice Questions" button
3. Click it to generate AI-powered quiz questions
4. The quiz should appear with multiple-choice questions

---

## 🐛 Troubleshooting

### Issue: "AI service not configured" error

**Solution**: 
- Check that your `.env` file exists in the `backend` folder
- Verify the API key is correct (no extra spaces)
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Restart the backend server after adding the API key

### Issue: "Failed to connect to server" on Knowledge Graph

**Solution**:
- Ensure the backend is running on port 5000
- Check backend terminal for any error messages
- Try accessing `http://localhost:5000/health` in your browser to verify the server is running

### Issue: Backend won't start - "ModuleNotFoundError"

**Solution**:
```bash
# Make sure you're in the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# If using a virtual environment, activate it first:
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### Issue: Port already in use

**Solution**:
- Check if another process is using port 5000 or 5173
- Stop that process or modify the port in the code
- On Windows: `netstat -ano | findstr :5000`
- On Mac/Linux: `lsof -i :5000`

---

## 🎯 What's Working Now

✅ **Knowledge Graph**
- Full competency graph visualization
- Category filtering
- Career path exploration
- Learning path recommendations

✅ **AI Features** (with API key)
- Quiz generation for any competency
- Personalized explanations
- Resource summaries
- Learning recommendations

✅ **Resources & Competencies**
- Browse learning resources
- Filter by category and difficulty
- View competency details

---

## 🔗 API Endpoints Available

### Knowledge Graph
- `GET /api/graph/full` - Full knowledge graph
- `GET /api/graph/roles` - All career roles
- `GET /api/graph/roles/{role_id}/graph` - Role-specific graph
- `POST /api/graph/path-to-role` - Find learning path

### AI Features
- `POST /api/ai/quiz` - Generate quiz questions
- `POST /api/ai/explain` - Get concept explanation
- `POST /api/ai/summarize` - Summarize resource
- `POST /api/ai/recommendations` - Get learning recommendations

### Resources
- `GET /api/resources` - List all resources
- `GET /api/resources/{id}` - Get resource details
- `GET /api/competencies` - List all competencies

---

## 📝 Notes

- The application uses **local JSON data** instead of Firebase
- Sample competency relationships are pre-configured
- Quiz questions are generated in real-time using AI
- All data resets when you restart the server

---

## 🆘 Need More Help?

If you encounter issues:
1. Check the backend terminal for error messages
2. Check the browser console for frontend errors
3. Verify all dependencies are installed
4. Make sure your API key is valid and active

---

**Last Updated**: August 28, 2026
