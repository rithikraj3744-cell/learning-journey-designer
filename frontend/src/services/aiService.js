/**
 * AI Learning Service - Client-side implementation using Google Gemini API
 * Works on all devices without backend
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBOti4mM-6x9WqMeM97kJWCk-JuLNsCDD0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIService {
  /**
   * Call Gemini API directly
   */
  async callGemini(prompt, retries = 2) {
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
            // Rate limit - wait and retry
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
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  /**
   * Explain a concept based on user level
   */
  async explainConcept(concept, userLevel = 'beginner', context = '') {
    try {
      console.log('AI Service - Explaining concept:', concept, userLevel);

      const prompt = `You are an expert technical educator. Explain the following concept for a ${userLevel} level learner.

Concept: ${concept}
${context ? `Additional Context: ${context}` : ''}

Provide a clear, concise explanation that:
1. Defines the concept in simple terms
2. Explains why it's important
3. Gives 1-2 practical examples
4. Suggests what to learn next

Keep the explanation under 300 words and appropriate for the ${userLevel} level.`;

      const explanation = await this.callGemini(prompt);

      return {
        explanation,
        cached: false
      };
    } catch (error) {
      console.error('Error explaining concept:', error);
      throw new Error(error.message || 'Failed to explain concept');
    }
  }

  /**
   * Summarize educational resource
   */
  async summarizeResource(content, resourceType = 'article', title = 'Resource') {
    try {
      console.log('AI Service - Summarizing resource:', title);

      const prompt = `Summarize the following ${resourceType} titled "${title}":

${content.substring(0, 3000)}

Provide:
1. A brief overview (2-3 sentences)
2. Key points (3-5 bullet points)
3. Main takeaways
4. Who should read/watch this

Keep the summary under 200 words.`;

      const summary = await this.callGemini(prompt);

      return {
        summary,
        cached: false
      };
    } catch (error) {
      console.error('Error summarizing resource:', error);
      throw new Error(error.message || 'Failed to summarize resource');
    }
  }

  /**
   * Generate practice quiz questions
   */
  async generateQuiz(topic, numQuestions = 5, difficulty = 'intermediate', context = '') {
    try {
      console.log('AI Service - Generating quiz:', topic, numQuestions, difficulty);

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

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const questions = JSON.parse(jsonText);

      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid quiz format');
      }

      return {
        questions,
        cached: false
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(error.message || 'Failed to generate quiz');
    }
  }

  /**
   * Get personalized learning recommendations
   */
  async getRecommendations(userProfile, goalCompetency, completedCompetencies = []) {
    try {
      console.log('AI Service - Getting recommendations');

      const prompt = `You are a personalized learning advisor. Based on the following information, provide learning recommendations:

Goal: Master ${goalCompetency}
User Level: ${userProfile.level || 'intermediate'}
Completed: ${completedCompetencies.join(', ') || 'None'}
Learning Style: ${userProfile.learningStyle || 'mixed'}

Provide:
1. Next 3 skills to learn (in order)
2. Why each skill is recommended
3. Estimated time for each
4. Best resources type for each

Keep recommendations practical and achievable.`;

      const recommendations = await this.callGemini(prompt);

      return {
        recommendations,
        cached: false
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error(error.message || 'Failed to get recommendations');
    }
  }

  /**
   * Generate learning path
   */
  async generateLearningPath(goalRole, currentSkills = [], timeframe = '6 months') {
    try {
      console.log('AI Service - Generating learning path');

      const prompt = `Create a structured learning path for someone who wants to become a ${goalRole}.

Current Skills: ${currentSkills.join(', ') || 'Beginner'}
Timeframe: ${timeframe}

Provide a week-by-week plan with:
1. Skills to learn each month
2. Project ideas to practice
3. Milestones to track progress
4. Resources needed

Format as a clear, actionable roadmap.`;

      const path = await this.callGemini(prompt);

      return {
        path,
        cached: false
      };
    } catch (error) {
      console.error('Error generating learning path:', error);
      throw new Error(error.message || 'Failed to generate learning path');
    }
  }

  /**
   * Analyze skill gaps
   */
  async analyzeSkillGaps(targetRole, currentSkills = []) {
    try {
      console.log('AI Service - Analyzing skill gaps');

      const prompt = `Analyze the skill gap for becoming a ${targetRole}.

Current Skills: ${currentSkills.join(', ') || 'None listed'}

Provide:
1. Critical missing skills (top 5)
2. Nice-to-have skills
3. Priority order for learning
4. Estimated time to bridge each gap

Be specific and practical.`;

      const analysis = await this.callGemini(prompt);

      return {
        analysis,
        cached: false
      };
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error(error.message || 'Failed to analyze skill gaps');
    }
  }

  /**
   * Check if AI service is available
   */
  async checkHealth() {
    try {
      const testPrompt = 'Say "OK" if you receive this message.';
      await this.callGemini(testPrompt);
      return { status: 'ok', message: 'AI service is operational' };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'AI service is unavailable'
      };
    }
  }
}

export default new AIService();
