# 🚀 Quick Start - Backend Server

## ✅ What's Fixed

Your backend now has:
- **Mock Quiz Generator** - Works immediately without API key
- **Knowledge Graph** - Full visualization support
- **Automatic Fallback** - Uses mock generator if Gemini API fails

## 🎯 Start the Server Now

### Option 1: Start Without Installing Dependencies (Recommended)

The server will work with the mock quiz generator even without installing Python packages!

```bash
cd backend
python app_local.py
```

### Option 2: Install Dependencies for Full Features

If you want to use the real Gemini AI (later), install dependencies:

```bash
cd backend
pip install flask flask-cors python-dotenv google-generativeai
```

Then start the server:
```bash
python app_local.py
```

## ✨ Expected Output

When the server starts, you should see:

```
✓ Loaded X resources from JSON
✓ Loaded X competencies from JSON
✓ Initialized knowledge graph service
✓ Using mock quiz generator (AI dependencies not installed)
Server: http://localhost:5000
```

## 🧪 Test Quiz Generation

### In Browser Console (F12):
```javascript
fetch('http://localhost:5000/api/ai/quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competency_name: 'Python',
    difficulty: 'beginner',
    num_questions: 3
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

### Or Using Curl:
```bash
curl -X POST http://localhost:5000/api/ai/quiz -H "Content-Type: application/json" -d "{\"competency_name\":\"Python\",\"difficulty\":\"beginner\",\"num_questions\":3}"
```

## 📋 Available Quiz Topics

The mock generator has pre-made questions for:
- **Python** - Variables, data structures, functions
- **JavaScript** - Variables, DOM, arrays
- **React** - JSX, Hooks, Virtual DOM
- **HTML-CSS** - Tags, styling, selectors
- **SQL** - SELECT, WHERE, basics

For other topics, it generates generic learning questions.

## 🔧 If You Get Errors

### "No module named 'flask'"
```bash
pip install flask flask-cors
```

### "Port 5000 already in use"
Stop any other process using port 5000, or change the port in app_local.py

### "Cannot find module"
Make sure you're in the backend directory:
```bash
cd backend
python app_local.py
```

## 🎉 Next Steps

1. **Start Backend** (this terminal)
   ```bash
   python app_local.py
   ```

2. **Start Frontend** (new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   Navigate to http://localhost:5173

4. **Test Features**
   - Knowledge Graph page should load
   - Quiz generation should work
   - All AI features use the mock generator

## 💡 Upgrade to Real AI Later

When you're ready to use actual Gemini AI:

1. Get API key from: https://aistudio.google.com/app/apikey
2. Add to backend/.env file:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Install dependencies:
   ```bash
   pip install python-dotenv google-generativeai
   ```
4. Restart backend - it will automatically use Gemini AI!

---

**Status**: ✅ Ready to run!  
**Last Updated**: 2026-08-28 16:50 UTC
