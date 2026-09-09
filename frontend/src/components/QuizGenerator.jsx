import { useState } from 'react';
import { Brain, Loader2, CheckCircle, XCircle, RotateCcw, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import aiService from '../services/aiService';

const QuizGenerator = ({ competencyName, competencyDescription, isCompact = false }) => {
  const [difficulty, setDifficulty] = useState('intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setFeedback({});

    try {
      const result = await aiService.generateQuiz(
        competencyName,
        numQuestions,
        difficulty,
        competencyDescription
      );

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleRestart = () => {
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setFeedback({});
  };

  const handleQuestionFeedback = (questionIndex, isPositive) => {
    setFeedback({
      ...feedback,
      [questionIndex]: isPositive ? 'positive' : 'negative'
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  const currentQuestion = questions[currentQuestionIndex];
  const score = showResults ? calculateScore() : null;
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${isCompact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Practice Quiz Generator
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test your knowledge with AI-generated questions
          </p>
        </div>
      </div>

      {/* Quiz Setup */}
      {questions.length === 0 && !loading && (
        <div className="space-y-4">
          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    difficulty === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    numQuestions === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Brain className="w-5 h-5" />
            Generate Quiz
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Generating quiz questions...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 font-medium mb-2">
            Failed to generate quiz
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm mb-3">
            {error}
          </p>
          <button
            onClick={handleGenerateQuiz}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quiz Questions */}
      {questions.length > 0 && !showResults && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Object.keys(answers).length} answered</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {currentQuestion.question}
            </h4>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Navigation</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : answers[index] !== undefined
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && score && (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center py-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              score.percentage >= 70 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
            }`}>
              {score.percentage >= 70 ? (
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {score.percentage}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {score.correct} out of {score.total} correct
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {score.percentage >= 90 ? '🎉 Outstanding!' :
               score.percentage >= 70 ? '👍 Good job!' :
               score.percentage >= 50 ? '📚 Keep practicing!' :
               '💪 Don\'t give up!'}
            </p>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question, qIndex) => {
              const userAnswer = answers[qIndex];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={qIndex}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        Q{qIndex + 1}: {question.question}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Your answer: <span className={isCorrect ? 'font-medium text-green-700 dark:text-green-400' : 'font-medium text-red-700 dark:text-red-400'}>
                          {question.options[userAnswer]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          Correct answer: <span className="font-medium text-green-700 dark:text-green-400">
                            {question.options[question.correct_answer]}
                          </span>
                        </p>
                      )}
                      {question.explanation && (
                        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">💡 Explanation:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Feedback */}
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Was this question helpful?</span>
                    <button
                      onClick={() => handleQuestionFeedback(qIndex, true)}
                      disabled={feedback[qIndex] !== undefined}
                      className={`p-1.5 rounded transition-colors ${
                        feedback[qIndex] === 'positive'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      } disabled:opacity-50`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuestionFeedback(qIndex, false)}
                      disabled={feedback[qIndex] !== undefined}
                      className={`p-1.5 rounded transition-colors ${
                        feedback[qIndex] === 'negative'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      } disabled:opacity-50`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Generate New Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
