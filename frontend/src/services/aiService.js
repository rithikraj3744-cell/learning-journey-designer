/**
 * AI Learning Backend Service
 * Connects to Flask AI backend for personalized learning features
 */

const API_BASE_URL = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:5000';

class AIService {
  /**
   * Explain a concept based on user level
   * @param {string} concept - The concept/competency name to explain
   * @param {string} userLevel - User's knowledge level: 'beginner', 'intermediate', 'advanced'
   * @param {string} context - Additional context (optional)
   * @returns {Promise<Object>} AI-generated explanation
   */
  async explainConcept(concept, userLevel = 'beginner', context = '') {
    try {
      console.log('AI Service - Explaining concept with params:', {
        competency_name: concept,
        user_level: userLevel,
        user_background: context
      });

      const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competency_name: concept,  // Backend expects 'competency_name'
          user_level: userLevel,
          user_background: context    // Backend expects 'user_background'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Please wait ${errorData.retry_after || 60} seconds.`);
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Service - Explanation generated successfully');

      return {
        explanation: data.explanation,
        cached: data.cached || false
      };
    } catch (error) {
      console.error('Error explaining concept:', error);
      throw new Error(error.message || 'Failed to explain concept. Please ensure the backend server is running.');
    }
  }

  /**
   * Summarize educational resource
   * @param {string} content - The content to summarize
   * @param {string} resourceType - Type: 'article', 'video', 'tutorial', 'book'
   * @param {string} title - Resource title (optional)
   * @returns {Promise<Object>} AI-generated summary
   */
  async summarizeResource(content, resourceType = 'article', title = 'Resource') {
    try {
      console.log('AI Service - Summarizing resource with params:', {
        content: content.substring(0, 100) + '...',
        title
      });

      const response = await fetch(`${API_BASE_URL}/api/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title   // Backend expects 'title', not 'resource_type'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Service - Summary generated successfully');

      return {
        summary: data.summary,
        cached: data.cached || false
      };
    } catch (error) {
      console.error('Error summarizing resource:', error);
      throw new Error(error.message || 'Failed to summarize resource. Please ensure the backend server is running.');
    }
  }

  /**
   * Generate practice quiz questions
   * @param {string} topic - The topic/competency name for quiz questions
   * @param {number} numQuestions - Number of questions (1-10)
   * @param {string} difficulty - Difficulty level: 'beginner', 'intermediate', 'advanced'
   * @param {string} context - Additional context (optional)
   * @returns {Promise<Object>} Array of quiz questions
   */
  async generateQuiz(topic, numQuestions = 5, difficulty = 'intermediate', context = '') {
    try {
      console.log('AI Service - Generating quiz with params:', {
        competency_name: topic,
        num_questions: numQuestions,
        difficulty,
        context
      });

      const response = await fetch(`${API_BASE_URL}/api/ai/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competency_name: topic,  // Backend expects 'competency_name', not 'topic'
          num_questions: Math.min(Math.max(1, numQuestions), 10),
          difficulty: difficulty,   // Backend expects 'difficulty', not 'user_level'
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Service - Quiz generated successfully:', data);

      return {
        questions: data.questions,
        cached: data.cached || false
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(error.message || 'Failed to generate quiz. Please ensure the backend server is running.');
    }
  }

  /**
   * Get personalized learning recommendations
   * @param {Object} userProfile - User's learning profile
   * @returns {Promise<Object>} Array of personalized recommendations
   */
  async getRecommendations(userProfile) {
    try {
      console.log('AI Service - Getting recommendations with params:', {
        user_competencies: userProfile.completedTopics || [],
        target_competencies: userProfile.goals || []
      });

      const response = await fetch(`${API_BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_competencies: userProfile.completedTopics || [],
          target_competencies: Array.isArray(userProfile.goals) ? userProfile.goals : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Service - Recommendations generated successfully');

      return {
        recommendations: data.recommendations,
        cached: data.cached || false
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error(error.message || 'Failed to get recommendations. Please ensure the backend server is running.');
    }
  }

  /**
   * Check backend health status
   * @returns {Promise<Object>} Backend health information
   */
  async checkHealth() {
    try {
      console.log('AI Service - Checking backend health at:', `${API_BASE_URL}/health`);

      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Service - Backend health:', data);

      return data;
    } catch (error) {
      console.error('Error checking backend health:', error);
      throw new Error(error.message || 'Failed to connect to backend server. Please ensure it is running.');
    }
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;

// Also export the class for custom instances
export { AIService };
