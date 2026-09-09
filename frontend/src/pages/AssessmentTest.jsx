import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  AlertCircle,
  Flag
} from 'lucide-react';
import aiService from '../services/aiService';

const AssessmentTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const competencyIds = location.state?.competencyIds || [];

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  useEffect(() => {
    if (competencyIds.length === 0) {
      navigate('/assessment');
      return;
    }
    loadQuestions();
  }, []);

  // Timer (optional - 90 seconds per question)
  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 10 && !showTimeWarning) {
      setShowTimeWarning(true);
    }

    if (timeRemaining <= 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Fetch actual competency data from backend
      const competenciesResponse = await fetch('http://localhost:5000/api/competencies');
      const competenciesData = await competenciesResponse.json();

      if (!competenciesData.success) {
        throw new Error('Failed to fetch competencies');
      }

      const allCompetencies = competenciesData.competencies;
      const allQuestions = [];

      // Generate AI questions for each selected competency
      // Fixed: 15 questions total distributed across competencies
      const questionsPerCompetency = Math.ceil(15 / competencyIds.length);

      for (const competencyId of competencyIds) {
        // Get the actual competency data
        const competency = allCompetencies[competencyId];
        if (!competency) {
          console.warn(`Competency ${competencyId} not found`);
          continue;
        }

        const competencyName = competency.name || competencyId;
        const competencyDescription = competency.description || '';
        const difficulty = competency.difficulty || 2; // 1=beginner, 2=intermediate, 3=advanced

        // Map difficulty to level
        const difficultyMap = { 1: 'beginner', 2: 'intermediate', 3: 'advanced' };
        const userLevel = difficultyMap[difficulty] || 'intermediate';

        try {
          // Create context with competency details for better AI questions
          const context = `Focus on practical knowledge and real-world applications. ${competencyDescription}`;

          // Call AI service to generate quiz
          console.log(`🤖 Generating AI questions for ${competencyName} (${userLevel} difficulty)`);
          const result = await aiService.generateQuiz(
            competencyName,
            questionsPerCompetency,
            userLevel,
            context
          );
          console.log('🤖 AI Service Response:', result);

          // Parse AI-generated questions
          if (result.questions && Array.isArray(result.questions)) {
            result.questions.forEach((q, index) => {
              // Handle options - can be array or object format
              let options = [];

              if (Array.isArray(q.options)) {
                // Backend returns array format: ["Option A", "Option B", "Option C", "Option D"]
                options = q.options;
              } else if (q.options && typeof q.options === 'object') {
                // Legacy object format: {A: "...", B: "...", C: "...", D: "..."}
                options = [q.options.A, q.options.B, q.options.C, q.options.D];
              }

              // Validate we have 4 options
              if (options.length === 4 && q.question) {
                allQuestions.push({
                  id: `${competencyId}-q${index + 1}`,
                  competencyId,
                  competencyName,
                  question: q.question,
                  options: options,
                  correctAnswer: q.correct_answer, // Backend returns 0-3 index
                  difficulty: userLevel,
                  explanation: q.explanation || 'No explanation provided.'
                });
                console.log(`✓ Added AI question ${index + 1} for ${competencyName}`);
              } else {
                console.warn(`⚠ Skipping invalid question ${index + 1} for ${competencyName}:`, q);
              }
            });
          }

          // Check if we got valid questions
          if (allQuestions.length === 0) {
            console.warn(`No valid AI questions generated for ${competencyName}, using mock questions`);
            const mockQs = generateMockQuestionsForCompetency(competencyId, competencyName, questionsPerCompetency);
            allQuestions.push(...mockQs);
          }
        } catch (error) {
          // Fallback to mock questions if AI fails
          console.error(`AI generation failed for ${competencyName}:`, error);
          const mockQs = generateMockQuestionsForCompetency(competencyId, competencyName, questionsPerCompetency);
          allQuestions.push(...mockQs);
        }
      }

      // Ensure exactly 15 questions
      const finalQuestions = allQuestions.slice(0, 15);

      if (finalQuestions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuestions(finalQuestions);
      setTimeRemaining(90); // 90 seconds per question

      console.log(`✓ Loaded ${finalQuestions.length} questions for assessment`);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Final fallback
      const mockQuestions = generateMockQuestions(competencyIds);
      setQuestions(mockQuestions.slice(0, 15));
      setTimeRemaining(90);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(90);
      setShowTimeWarning(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTimeRemaining(90);
      setShowTimeWarning(false);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length;

    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirm) return;
    }

    // Calculate results
    const results = calculateResults();

    // Navigate to results page
    navigate('/assessment/results', {
      state: { results, answers, questions }
    });
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    const competencyScores = {};

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      // Track per-competency scores
      if (!competencyScores[question.competencyId]) {
        competencyScores[question.competencyId] = {
          correct: 0,
          total: 0,
          name: question.competencyName
        };
      }

      competencyScores[question.competencyId].total++;
      if (isCorrect) {
        competencyScores[question.competencyId].correct++;
      }
    });

    return {
      totalQuestions: questions.length,
      correctAnswers,
      score: Math.round((correctAnswers / questions.length) * 100),
      competencyScores,
      timestamp: new Date().toISOString()
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There are no assessment questions for the selected competencies.
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuestion.competencyName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 ${
                  timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-mono font-semibold">
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
              <button
                onClick={toggleFlag}
                className={`p-2 rounded-lg transition-colors ${
                  flaggedQuestions.has(currentQuestionIndex)
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Flag for review"
              >
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                Q
              </span>
              <h3 className="text-xl text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>
            {currentQuestion.difficulty && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestionIndex] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`flex-1 ${
                      isSelected
                        ? 'text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option}
                    </span>
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
            className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <div className="flex gap-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Question Navigator
          </h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : flaggedQuestions.has(index)
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-green-600 bg-green-50 dark:bg-green-900/20"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600"></div>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-red-600 bg-red-50 dark:bg-red-900/20"></div>
              <span>Flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate mock questions for a single competency
const generateMockQuestionsForCompetency = (competencyId, competencyName, numQuestions) => {
  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    questions.push({
      id: `${competencyId}-q${i + 1}`,
      competencyId,
      competencyName,
      question: `Sample question ${i + 1} for ${competencyName}?`,
      options: [
        `Option A for question ${i + 1}`,
        `Option B for question ${i + 1}`,
        `Option C for question ${i + 1}`,
        `Option D for question ${i + 1}`
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    });
  }
  return questions;
};

// Mock question generator (fallback)
const generateMockQuestions = (competencyIds) => {
  const questions = [];
  const competencyNames = {
    'react': 'React.js',
    'python': 'Python Programming',
    'sql': 'SQL & Databases',
    'ml': 'Machine Learning',
    'statistics': 'Statistics',
    'project-mgmt': 'Project Management',
    'ui-design': 'UI Design'
  };

  competencyIds.forEach((competencyId) => {
    const numQuestions = Math.floor(Math.random() * 6) + 5; // 5-10 questions
    const competencyName = competencyNames[competencyId] || competencyId;
    questions.push(...generateMockQuestionsForCompetency(competencyId, competencyName, numQuestions));
  });

  return questions;
};

export default AssessmentTest;
