import { useState, useEffect } from 'react'
import aiService from '../services/aiService'
import { getAllCompetencies } from '../services/firestore'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Brain, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const Assessment = () => {
  const { currentUser } = useAuth()
  const [competencies, setCompetencies] = useState([])
  const [selectedCompetency, setSelectedCompetency] = useState(null)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [loading, setLoading] = useState(false)
  const [loadingCompetencies, setLoadingCompetencies] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState(null)

  // Load competencies on mount
  useEffect(() => {
    loadCompetencies()
  }, [])

  // Auto-select competency from URL params and generate quiz
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const competencyParam = params.get('competency')

    if (competencyParam && competencies.length > 0 && !selectedCompetency) {
      // Map knowledge graph ID to competency
      const mapKnowledgeGraphIdToCompetency = (graphId) => {
        let comp = competencies.find(c => c.id === graphId)
        if (comp) return comp

        const normalizedGraphId = graphId.toLowerCase().replace(/-/g, ' ')
        comp = competencies.find(c => {
          const normalizedName = c.name.toLowerCase()
          const normalizedKeywords = c.keywords?.map(k => k.toLowerCase()) || []
          return normalizedName.includes(normalizedGraphId) ||
                 normalizedGraphId.includes(normalizedName) ||
                 normalizedKeywords.some(k => k.includes(normalizedGraphId) || normalizedGraphId.includes(k))
        })

        if (comp) return comp

        const manualMappings = {
          'html-css': 'comp-007',
          'javascript': 'comp-002',
          'react': 'comp-003',
          'vue': 'comp-004',
          'angular': 'comp-005',
          'typescript': 'comp-006',
          'python': 'comp-001',
          'node': 'comp-010',
          'nodejs': 'comp-010',
          'express': 'comp-011',
          'sql': 'comp-012',
          'mongodb': 'comp-013',
          'databases': 'comp-012',
          'api-design': 'comp-014',
          'rest-api': 'comp-014',
          'graphql': 'comp-015',
          'git': 'comp-016',
          'docker': 'comp-017',
          'kubernetes': 'comp-018',
          'aws': 'comp-019',
          'ui-ux': 'comp-020',
          'responsive-design': 'comp-021'
        }

        const mappedId = manualMappings[graphId.toLowerCase()]
        if (mappedId) {
          return competencies.find(c => c.id === mappedId)
        }

        return null
      }

      const comp = mapKnowledgeGraphIdToCompetency(competencyParam)
      if (comp) {
        setSelectedCompetency(comp)
        // Auto-generate quiz after a short delay
        setTimeout(() => {
          handleGenerateQuizForCompetency(comp)
        }, 500)
      }
    }
  }, [competencies, selectedCompetency])

  const loadCompetencies = async () => {
    try {
      setLoadingCompetencies(true)
      const comps = await getAllCompetencies()
      setCompetencies(comps)
    } catch (err) {
      console.error('Error loading competencies:', err)
      setError('Failed to load competencies')
    } finally {
      setLoadingCompetencies(false)
    }
  }

  const handleGenerateQuizForCompetency = async (comp) => {
    if (!comp) {
      setError('Please select a competency first')
      return
    }

    setLoading(true)
    setError(null)
    setQuestions([])
    setAnswers([])
    setCurrentQuestionIndex(0)
    setShowResults(false)

    try {
      console.log('Generating quiz for:', comp.name, 'Difficulty:', difficulty)
      const result = await aiService.generateQuiz(
        comp.name,
        10,
        difficulty,
        `Focus on ${comp.category} - ${comp.subcategory}`
      )

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions)
        setAnswers(new Array(result.questions.length).fill(null))
      } else {
        throw new Error('No questions generated')
      }
    } catch (err) {
      console.error('Error generating quiz:', err)
      setError(err.message || 'Failed to generate quiz. Please ensure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    await handleGenerateQuizForCompetency(selectedCompetency)
  }

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    // Calculate score
    let correct = 0
    const wrongAnswers = []

    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correct++
      } else {
        wrongAnswers.push({
          question: q.question,
          yourAnswer: q.options[answers[index]] || 'Not answered',
          correctAnswer: q.options[q.correct_answer],
          topic: q.topic || selectedCompetency?.name
        })
      }
    })

    const finalScore = Math.round((correct / questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)

    console.log('Assessment completed:', {
      score: finalScore,
      correct,
      total: questions.length,
      wrongAnswers: wrongAnswers.length
    })

    // Save score to Firestore if user is authenticated
    if (currentUser && selectedCompetency) {
      try {
        const { db } = await import('../firebase')
        const { doc, setDoc, updateDoc, getDoc, serverTimestamp } = await import('firebase/firestore')

        const progressRef = doc(
          db,
          'users',
          currentUser.uid,
          'competencyProgress',
          selectedCompetency.id
        )

        const progressDoc = await getDoc(progressRef)
        const assessmentData = {
          competencyId: selectedCompetency.id,
          competencyName: selectedCompetency.name,
          score: finalScore,
          correctAnswers: correct,
          totalQuestions: questions.length,
          wrongAnswers: wrongAnswers,
          completedAt: new Date(),
          difficulty: difficulty
        }

        if (progressDoc.exists()) {
          // Update existing progress
          await updateDoc(progressRef, {
            lastAssessmentScore: finalScore,
            lastAssessmentDate: new Date(),
            assessmentHistory: progressDoc.data().assessmentHistory
              ? [...progressDoc.data().assessmentHistory, assessmentData]
              : [assessmentData],
            weakAreas: wrongAnswers.length > 0 ? wrongAnswers : null
          })
        } else {
          // Create new progress document
          await setDoc(progressRef, {
            competencyId: selectedCompetency.id,
            competencyName: selectedCompetency.name,
            userId: currentUser.uid,
            lastAssessmentScore: finalScore,
            lastAssessmentDate: new Date(),
            assessmentHistory: [assessmentData],
            weakAreas: wrongAnswers.length > 0 ? wrongAnswers : null,
            createdAt: new Date()
          })
        }

        console.log('Assessment score saved successfully')
      } catch (error) {
        console.error('Error saving assessment score:', error)
      }
    }
  }

  const handleRestart = () => {
    setQuestions([])
    setAnswers([])
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setScore(0)
    setSelectedCompetency(null)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const allAnswered = answers.every(a => a !== null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Skill Assessment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with AI-generated quizzes tailored to your level
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
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
            <h2 className="text-xl font-semibold">Generate AI Quiz</h2>
          </div>

          {/* Competency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Competency
            </label>
            {loadingCompetencies ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading competencies...</span>
              </div>
            ) : (
              <select
                value={selectedCompetency?.id || ''}
                onChange={(e) => {
                  const comp = competencies.find(c => c.id === e.target.value)
                  setSelectedCompetency(comp)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a competency...</option>
                {competencies.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Difficulty Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    difficulty === level
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
            disabled={!selectedCompetency || loading}
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
                Generate Quiz
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
          {/* Back Button */}
          <button
            onClick={handleRestart}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Assessment Selection
          </button>

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
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Your Score: {score}%</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {score >= 90 ? '🎉 Excellent! You have mastered this topic!' :
               score >= 70 ? '👍 Good job! You have a solid understanding.' :
               score >= 50 ? '📚 Not bad, but there\'s room for improvement.' :
               '💪 Keep learning! Practice makes perfect.'}
            </p>
            <div className="mt-4 inline-block px-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {questions.filter((_, i) => answers[i] === questions[i].correct_answer).length} / {questions.length} Correct
              </span>
            </div>
          </div>

          {/* Performance Summary */}
          {score < 70 && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Areas to Focus On
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Review the questions you missed below. Practice these topics to improve your understanding of {selectedCompetency?.name}.
              </p>
            </div>
          )}

          {/* Detailed Results */}
          <div className="space-y-4 mb-6">
            {questions.map((q, index) => {
              const isCorrect = answers[index] === q.correct_answer
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
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-1 text-gray-900 dark:text-white">{q.question}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Your answer: <span className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {q.options[answers[index]] || 'Not answered'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Correct answer: <span className="font-medium text-green-700 dark:text-green-400">{q.options[q.correct_answer]}</span>
                        </p>
                      )}
                      {q.explanation && (
                        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">💡 Explanation:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Take Another Assessment
            </button>
            <button
              onClick={() => {
                // Pass score data via URL parameters for immediate display
                const competencyId = selectedCompetency?.id || 'javascript'
                const competencyName = encodeURIComponent(selectedCompetency?.name || 'JavaScript')
                window.location.href = `/knowledge-graph?openNode=${competencyId}&name=${competencyName}&score=${score}&fromAssessment=true`
              }}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors"
            >
              View My Progress
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assessment
