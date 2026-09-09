import { useState, useMemo, useRef, useEffect } from 'react';
import { competencyList, categories, getCompetenciesByCategory, searchCompetencies } from '../data';
import { Brain, Loader2, AlertCircle, CheckCircle, XCircle, Search, X } from 'lucide-react';
import aiService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

const CompetenciesWithTest = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState(null);

  // Test states
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [testDifficulty, setTestDifficulty] = useState('intermediate');

  // Ref for scrolling to test area
  const testAreaRef = useRef(null);

  const filteredCompetencies = useMemo(() => {
    let result = competencyList;

    // Filter by category
    if (selectedCategory) {
      result = getCompetenciesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = searchCompetencies(searchQuery).filter(comp =>
        !selectedCategory || comp.category === selectedCategory
      );
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      result = result.filter(comp => comp.difficulty === parseInt(selectedDifficulty));
    }

    return result;
  }, [selectedCategory, searchQuery, selectedDifficulty]);

  const difficultyLabels = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  const difficultyColors = {
    1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    4: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    5: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const handleCompetencyClick = (comp) => {
    setSelectedCompetency(comp);
    setQuestions([]);
    setAnswers([]);
    setShowResults(false);
    setError(null);

    // Scroll to test area
    setTimeout(() => {
      testAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCompetency) {
      setError('Please select a competency first');
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);

    try {
      console.log('Generating quiz for:', selectedCompetency.name, 'Difficulty:', testDifficulty);
      const result = await aiService.generateQuiz(
        selectedCompetency.name,
        5,
        testDifficulty,
        `Focus on ${selectedCompetency.category} - ${selectedCompetency.subcategory}`
      );

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setAnswers(new Array(result.questions.length).fill(null));
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
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
    // Calculate score
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correct++;
      }
    });
    setScore(Math.round((correct / questions.length) * 100));
    setShowResults(true);
  };

  const handleRestart = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = answers.every(a => a !== null);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Competencies & Assessment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse competencies and take AI-generated tests. Click any competency to start a test.
        </p>
      </div>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE: Competencies List */}
        <div className="space-y-6">
          {/* Search Bar with Icon */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Levels</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>
                  Level {level} - {difficultyLabels[level]}
                </option>
              ))}
            </select>

            {(selectedCategory || searchQuery || selectedDifficulty) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchQuery('');
                  setSelectedDifficulty('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCompetencies.length} of {competencyList.length} competencies
          </p>

          {/* Competencies List - Scrollable */}
          <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {filteredCompetencies.map(comp => (
              <div
                key={comp.id}
                onClick={() => handleCompetencyClick(comp)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all p-5 border-2 cursor-pointer ${
                  selectedCompetency?.id === comp.id
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {comp.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[comp.difficulty]}`}>
                    L{comp.difficulty}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {comp.subcategory}
                </p>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                  {comp.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {comp.keywords.slice(0, 3).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                  {comp.keywords.length > 3 && (
                    <span className="text-xs px-2 py-0.5 text-gray-500 dark:text-gray-400">
                      +{comp.keywords.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredCompetencies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No competencies found matching your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Test Area */}
        <div ref={testAreaRef} className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          {!selectedCompetency ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select a Competency
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Click on any competency from the left to start a test
              </p>
            </div>
          ) : (
            <>
              {/* Selected Competency Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCompetency.name}
                  </h2>
                  <button
                    onClick={() => setSelectedCompetency(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {selectedCompetency.description}
                </p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[selectedCompetency.difficulty]}`}>
                    Level {selectedCompetency.difficulty} - {difficultyLabels[selectedCompetency.difficulty]}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {selectedCompetency.estimatedHours}h
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Quiz Setup */}
              {questions.length === 0 && !showResults && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Generate AI Quiz</h3>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Test Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['beginner', 'intermediate', 'advanced'].map(level => (
                        <button
                          key={level}
                          onClick={() => setTestDifficulty(level)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            testDifficulty === level
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Generate 5 Questions
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Quiz Questions */}
              {questions.length > 0 && !showResults && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                      <span>{answers.filter(a => a !== null).length} answered</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                            answers[currentQuestionIndex] === index
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                          }`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Results */}
              {showResults && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      score >= 70 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {score >= 70 ? (
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your Score: {score}%</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {score >= 90 ? 'Excellent! You have mastered this topic!' :
                       score >= 70 ? 'Good job! You have a solid understanding.' :
                       score >= 50 ? 'Not bad, but there\'s room for improvement.' :
                       'Keep learning! Practice makes perfect.'}
                    </p>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {questions.map((q, index) => {
                      const isCorrect = answers[index] === q.correct_answer;
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium mb-1">{q.question}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your answer: <span className="font-medium">{q.options[answers[index]]}</span>
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Correct answer: <span className="font-medium text-green-700 dark:text-green-400">{q.options[q.correct_answer]}</span>
                                </p>
                              )}
                              {q.explanation && (
                                <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                                  💡 {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleRestart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Take Another Quiz
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetenciesWithTest;
