import React, { useState } from 'react';
import { Sparkles, BookOpen, Brain, Target, Loader2, CheckCircle, XCircle } from 'lucide-react';
import aiService from '../services/aiService';

const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState('explain');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  // Form states
  const [conceptInput, setConceptInput] = useState('');
  const [userLevel, setUserLevel] = useState('beginner');
  const [quizTopic, setQuizTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);

  // Check backend health on mount
  React.useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await aiService.checkHealth();
      setBackendStatus(health);
    } catch (err) {
      setBackendStatus({ status: 'error', error: err.message });
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!conceptInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await aiService.explainConcept(conceptInput, userLevel);
      setResult({
        type: 'explanation',
        data: response
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await aiService.generateQuiz(quizTopic, numQuestions, userLevel);
      setResult({
        type: 'quiz',
        data: response
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await aiService.getRecommendations({
        level: userLevel,
        completedTopics: ['HTML', 'CSS', 'JavaScript Basics'],
        goals: 'Full Stack Web Development',
        strengths: 'Frontend development, UI/UX',
        weaknesses: 'Backend systems, databases'
      });
      setResult({
        type: 'recommendations',
        data: response
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'explain', label: 'Explain Concepts', icon: BookOpen },
    { id: 'quiz', label: 'Generate Quiz', icon: Brain },
    { id: 'recommend', label: 'Get Recommendations', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Learning</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Personalized explanations, quizzes, and recommendations powered by Gemini AI
          </p>
        </div>

        {/* Backend Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {backendStatus?.status === 'healthy' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Backend Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Backend Disconnected</span>
                </>
              )}
            </div>
            {backendStatus && (
              <div className="text-xs text-gray-500">
                {backendStatus.status === 'healthy' && (
                  <span>
                    Gemini: {backendStatus.gemini_configured ? '✓' : '✗'} |
                    Cache: {backendStatus.cache_enabled ? '✓' : '✗'}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={checkBackendHealth}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResult(null);
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Explain Concept Tab */}
            {activeTab === 'explain' && (
              <form onSubmit={handleExplainConcept} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What concept would you like explained?
                  </label>
                  <input
                    type="text"
                    value={conceptInput}
                    onChange={(e) => setConceptInput(e.target.value)}
                    placeholder="e.g., Machine Learning, React Hooks, Quantum Computing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Knowledge Level
                  </label>
                  <select
                    value={userLevel}
                    onChange={(e) => setUserLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading || !conceptInput.trim()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Explanation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Explain Concept
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Generate Quiz Tab */}
            {activeTab === 'quiz' && (
              <form onSubmit={handleGenerateQuiz} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Topic
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g., Python Functions, JavaScript ES6, Database Normalization"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={userLevel}
                      onChange={(e) => setUserLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !quizTopic.trim()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommend' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your Learning Profile</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Level:</strong> {userLevel}</p>
                    <p><strong>Completed:</strong> HTML, CSS, JavaScript Basics</p>
                    <p><strong>Goal:</strong> Full Stack Web Development</p>
                    <p><strong>Strengths:</strong> Frontend, UI/UX</p>
                    <p><strong>Areas to Improve:</strong> Backend, Databases</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Knowledge Level
                  </label>
                  <select
                    value={userLevel}
                    onChange={(e) => setUserLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Recommendations...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Get Personalized Recommendations
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Make sure the AI backend is running at http://localhost:5000
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Results</h2>
              {result.data.cached && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Cached Response
                </span>
              )}
            </div>

            {/* Explanation Result */}
            {result.type === 'explanation' && (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {result.data.explanation}
                </div>
              </div>
            )}

            {/* Quiz Result */}
            {result.type === 'quiz' && (
              <div className="space-y-4">
                {Array.isArray(result.data.questions) ? (
                  result.data.questions.map((q, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        {index + 1}. {q.question}
                      </h3>
                      <div className="space-y-2 mb-3">
                        {Object.entries(q.options || {}).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-2 rounded ${
                              key === q.correct_answer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Answer:</strong> {q.correct_answer}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(result.data.questions, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Result */}
            {result.type === 'recommendations' && (
              <div className="space-y-4">
                {Array.isArray(result.data.recommendations) ? (
                  result.data.recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {rec.topic}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">{rec.reason}</p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>📊 Difficulty: {rec.difficulty}</span>
                          <span>⏱️ Time: {rec.estimated_time}</span>
                        </div>
                        {rec.resources && rec.resources.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700">Recommended Resources:</p>
                            <ul className="list-disc list-inside text-gray-600">
                              {rec.resources.map((resource, idx) => (
                                <li key={idx}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(result.data.recommendations, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeatures;
