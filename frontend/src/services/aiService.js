/**
 * AI Learning Service - Hybrid implementation
 * Uses backend API when available, provides helpful fallback when not
 */

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIService {
  constructor() {
    this.useBackend = true; // Try backend first
    this.backendAvailable = null; // null = unknown, true/false = known
  }

  /**
   * Check if backend is available
   */
  async checkBackend() {
    if (this.backendAvailable !== null) {
      return this.backendAvailable;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      this.backendAvailable = response.ok;
    } catch (error) {
      this.backendAvailable = false;
    }

    return this.backendAvailable;
  }

  /**
   * Call backend API
   */
  async callBackend(endpoint, data) {
    const response = await fetch(`${BACKEND_URL}/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Backend error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Call Gemini API directly (fallback)
   */
  async callGemini(prompt, retries = 2) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyBOti4mM-6x9WqMeM97kJWCk-JuLNsCDD0') {
      throw new Error('GEMINI_API_KEY_REQUIRED');
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          if (response.status === 429 && attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(error.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error('No response generated');
        }

        return text;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz(topic, numQuestions = 5, difficulty = 'intermediate', context = '') {
    try {
      console.log('AI Service - Generating quiz:', topic, numQuestions, difficulty);

      // Try backend first
      const backendAvailable = await this.checkBackend();

      if (backendAvailable) {
        try {
          const data = await this.callBackend('quiz', {
            competency_name: topic,
            num_questions: Math.min(Math.max(1, numQuestions), 10),
            difficulty: difficulty,
            context
          });

          return {
            questions: data.questions,
            cached: data.cached || false
          };
        } catch (backendError) {
          console.log('Backend failed, trying Gemini API:', backendError);
          // Fall through to Gemini API
        }
      }

      // Fallback to Gemini API
      const prompt = `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" at ${difficulty} level.
${context ? `Context: ${context}` : ''}

Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Why this answer is correct",
    "topic": "${topic}"
  }
]

Rules:
- Each question must have exactly 4 options
- correct_answer is the index (0-3) of the correct option
- Questions should test understanding, not just memorization
- Include practical scenarios when possible
- Return ONLY the JSON array, no other text`;

      const response = await this.callGemini(prompt);

      // Extract JSON from response
      let jsonText = response.trim();

      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const questions = JSON.parse(jsonText);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid quiz format');
      }

      return {
        questions,
        cached: false
      };
    } catch (error) {
      console.error('Error generating quiz:', error);

      if (error.message === 'GEMINI_API_KEY_REQUIRED') {
        throw new Error('AI features require the backend server to be running.\n\nPlease start the backend:\n1. cd backend\n2. python app.py\n\nOr set up a valid Gemini API key in Vercel environment variables.');
      }

      throw new Error(error.message || 'Failed to generate quiz');
    }
  }

  /**
   * Explain a concept
   */
  async explainConcept(concept, userLevel = 'beginner', context = '') {
    try {
      console.log('AI Service - Explaining concept:', concept, userLevel);

      const backendAvailable = await this.checkBackend();

      if (backendAvailable) {
        try {
          const data = await this.callBackend('explain', {
            competency_name: concept,
            user_level: userLevel,
            user_background: context
          });

          return {
            explanation: data.explanation,
            cached: data.cached || false
          };
        } catch (backendError) {
          console.log('Backend failed:', backendError);
        }
      }

      throw new Error('Backend server required for this feature');
    } catch (error) {
      console.error('Error explaining concept:', error);
      throw new Error('Please start the backend server to use this feature.');
    }
  }

  /**
   * Summarize resource
   */
  async summarizeResource(content, resourceType = 'article', title = 'Resource') {
    try {
      const backendAvailable = await this.checkBackend();

      if (backendAvailable) {
        try {
          const data = await this.callBackend('summarize', {
            content,
            title
          });

          return {
            summary: data.summary,
            cached: data.cached || false
          };
        } catch (backendError) {
          console.log('Backend failed:', backendError);
        }
      }

      throw new Error('Backend server required for this feature');
    } catch (error) {
      console.error('Error summarizing resource:', error);
      throw new Error('Please start the backend server to use this feature.');
    }
  }

  /**
   * Get recommendations
   */
  async getRecommendations(userProfile, goalCompetency, completedCompetencies = []) {
    throw new Error('Please start the backend server to use this feature.');
  }

  /**
   * Generate learning path
   */
  async generateLearningPath(goalRole, currentSkills = [], timeframe = '6 months') {
    throw new Error('Please start the backend server to use this feature.');
  }

  /**
   * Analyze skill gaps
   */
  async analyzeSkillGaps(targetRole, currentSkills = []) {
    throw new Error('Please start the backend server to use this feature.');
  }

  /**
   * Check if AI service is available
   */
  async checkHealth() {
    const backendAvailable = await this.checkBackend();

    if (backendAvailable) {
      return {
        status: 'ok',
        message: 'AI service is operational (using backend)',
        backend: true
      };
    }

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'AIzaSyBOti4mM-6x9WqMeM97kJWCk-JuLNsCDD0') {
      return {
        status: 'ok',
        message: 'AI service is operational (using Gemini API)',
        backend: false
      };
    }

    return {
      status: 'error',
      message: 'Backend server not running. Please start: cd backend && python app.py',
      backend: false
    };
  }
}

export default new AIService();

