import { useState } from 'react';
import { FileText, Loader2, Clock, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import aiService from '../services/aiService';

const AISummaryCard = ({ resourceContent, resourceTitle, resourceType = 'article' }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await aiService.summarizeResource(
        resourceContent,
        resourceType,
        resourceTitle
      );
      setSummary(result.summary);
      setIsExpanded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (isPositive) => {
    setFeedback(isPositive ? 'positive' : 'negative');
    console.log(`User feedback: ${isPositive ? 'positive' : 'negative'} for summary`);
  };

  // Calculate estimated time saved (rough estimate: reading speed 200 words/min)
  const estimateTimeSaved = (content) => {
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    return Math.max(1, readingTimeMinutes - 2); // Assume summary saves at least 1 min
  };

  const timeSaved = resourceContent ? estimateTimeSaved(resourceContent) : 0;

  // Parse summary into bullet points if not already formatted
  const formatSummary = (text) => {
    if (!text) return [];

    // Check if already has bullet points or numbered list
    const lines = text.split('\n').filter(line => line.trim());

    // If lines start with bullets/numbers, use them as-is
    if (lines.some(line => /^[-•*\d.)]/.test(line.trim()))) {
      return lines.map(line => line.replace(/^[-•*\d.)]\s*/, '').trim());
    }

    // Otherwise split by sentences and take key points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5); // Top 5 key points
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI Quick Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get key points in seconds
            </p>
          </div>
        </div>
        {timeSaved > 0 && !loading && !summary && (
          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Save ~{timeSaved} min</span>
          </div>
        )}
      </div>

      {/* Generate Button */}
      {!summary && !loading && !error && (
        <button
          onClick={handleGenerateSummary}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <FileText className="w-5 h-5" />
          Get AI Summary
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Analyzing content...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 font-medium text-sm mb-2">
            Failed to generate summary
          </p>
          <p className="text-red-700 dark:text-red-300 text-xs mb-3">
            {error}
          </p>
          <button
            onClick={handleGenerateSummary}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Summary Display */}
      {summary && !loading && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Key Points
              </h4>
              {timeSaved > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Saved ~{timeSaved} min
                </span>
              )}
            </div>

            {/* Bullet Points */}
            <ul className="space-y-2">
              {formatSummary(summary).map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback */}
          <div className="flex items-center justify-between pt-3 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Was this summary helpful?
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
                <ThumbsUp className="w-4 h-4" />
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
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISummaryCard;
