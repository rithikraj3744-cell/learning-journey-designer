import { useState } from 'react';
import { X, Brain, Loader2, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import aiService from '../services/aiService';

const AIExplainModal = ({ isOpen, onClose, competencyName, competencyDescription }) => {
  const [userLevel, setUserLevel] = useState('intermediate');
  const [userBackground, setUserBackground] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setExplanation(null);
    setFeedback(null);

    try {
      const result = await aiService.explainConcept(
        competencyName,
        userLevel,
        userBackground || competencyDescription
      );
      setExplanation(result.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleFeedback = (isPositive) => {
    setFeedback(isPositive ? 'positive' : 'negative');
    // You can also send this to your backend for analytics
    console.log(`User feedback: ${isPositive ? 'positive' : 'negative'} for explanation`);
  };

  const handleClose = () => {
    setExplanation(null);
    setError(null);
    setUserBackground('');
    setFeedback(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Explain
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {competencyName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!explanation && !loading && (
            <>
              {/* User Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Current Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setUserLevel(level)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        userLevel === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Background (Optional)
                </label>
                <textarea
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value)}
                  placeholder="E.g., I have experience with Python but new to React..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Generate Explanation
              </button>
            </>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                AI is crafting a personalized explanation...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                Error generating explanation
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
              <button
                onClick={handleGenerate}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Explanation Display */}
          {explanation && !loading && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {explanation}
                  </div>
                </div>
              </div>

              {/* Feedback Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Was this explanation helpful?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(true)}
                    disabled={feedback !== null}
                    className={`p-2 rounded-lg transition-colors ${
                      feedback === 'positive'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    disabled={feedback !== null}
                    className={`p-2 rounded-lg transition-colors ${
                      feedback === 'negative'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Regenerate Button */}
              <button
                onClick={handleRegenerate}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Explanation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIExplainModal;
