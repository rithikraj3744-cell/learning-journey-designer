import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Calendar, TrendingUp, Plus, Trash2, CheckCircle, Clock } from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'

const GoalSetting = () => {
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [competencies, setCompetencies] = useState([])
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetCompetencies: [],
    timeline: 3,
    timelineUnit: 'months',
    status: 'active'
  })

  useEffect(() => {
    loadGoals()
    loadCompetencies()
  }, [])

  const loadGoals = async () => {
    if (!auth.currentUser) return

    const goalsRef = collection(db, 'users', auth.currentUser.uid, 'goals')
    const snapshot = await getDocs(goalsRef)
    const goalsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      targetDate: doc.data().targetDate?.toDate()
    }))
    setGoals(goalsData)
  }

  const loadCompetencies = async () => {
    const competenciesRef = collection(db, 'competencies')
    const snapshot = await getDocs(competenciesRef)
    const competenciesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setCompetencies(competenciesData)
  }

  const handleCreateGoal = async () => {
    if (!auth.currentUser || !newGoal.title || newGoal.targetCompetencies.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    const targetDate = new Date()
    if (newGoal.timelineUnit === 'months') {
      targetDate.setMonth(targetDate.getMonth() + newGoal.timeline)
    } else if (newGoal.timelineUnit === 'weeks') {
      targetDate.setDate(targetDate.getDate() + (newGoal.timeline * 7))
    } else {
      targetDate.setDate(targetDate.getDate() + newGoal.timeline)
    }

    const goalData = {
      ...newGoal,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      targetDate,
      progress: 0,
      completedCompetencies: []
    }

    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'goals'), goalData)

      // Create notification
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'notifications'), {
        type: 'goal_created',
        title: 'New Goal Created!',
        message: `You've set a goal: ${newGoal.title}`,
        timestamp: new Date(),
        read: false
      })

      setShowCreateModal(false)
      setNewGoal({
        title: '',
        description: '',
        targetCompetencies: [],
        timeline: 3,
        timelineUnit: 'months',
        status: 'active'
      })
      loadGoals()
    } catch (error) {
      console.error('Error creating goal:', error)
      alert('Failed to create goal')
    }
  }

  const handleGeneratePath = async (goal) => {
    try {
      // Fetch full competency data for the goal's target competencies
      const selectedCompetencyData = competencies.filter(c =>
        goal.targetCompetencies.includes(c.id)
      );

      // Calculate total estimated time
      const totalHours = selectedCompetencyData.reduce((sum, comp) =>
        sum + (comp.estimatedHours || 10), 0
      );

      // Calculate estimated completion weeks (assuming 10 hours/week default)
      const timeAvailable = 10; // Default hours per week
      const estimatedWeeks = Math.ceil(totalHours / timeAvailable);

      // Auto-generate learning path from goal
      const pathData = {
        userId: auth.currentUser.uid,
        title: `Path to ${goal.title}`,
        name: `Path to ${goal.title}`,
        description: goal.description,
        competencies: selectedCompetencyData, // Full competency objects
        targetCompetencies: goal.targetCompetencies, // Keep the IDs too
        targetDate: goal.targetDate,
        goalId: goal.id,
        totalHours,
        estimatedWeeks,
        timeAvailable,
        preferences: {
          learningStyle: 'visual',
          preferredResourceTypes: ['video', 'course']
        },
        progress: 0,
        completedCompetencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      }

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'learningPaths'), pathData)
      navigate('/my-paths')
    } catch (error) {
      console.error('Error generating path:', error)
      alert('Failed to generate learning path. Please try again.')
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'goals', goalId))
      loadGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const toggleCompetency = (competencyId) => {
    setNewGoal(prev => ({
      ...prev,
      targetCompetencies: prev.targetCompetencies.includes(competencyId)
        ? prev.targetCompetencies.filter(id => id !== competencyId)
        : [...prev.targetCompetencies, competencyId]
    }))
  }

  const calculateProgress = (goal) => {
    if (goal.targetCompetencies.length === 0) return 0
    return Math.round((goal.completedCompetencies?.length || 0) / goal.targetCompetencies.length * 100)
  }

  const getDaysRemaining = (targetDate) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Target className="w-8 h-8" />
                My Learning Goals
              </h1>
              <p className="text-purple-100">
                Set goals, track progress, and achieve your learning objectives
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Goal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Active Goals */}
        {goals.filter(g => g.status === 'active').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.filter(g => g.status === 'active').map(goal => (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{goal.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {calculateProgress(goal)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${calculateProgress(goal)}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{getDaysRemaining(goal.targetDate)} days left</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>{goal.targetCompetencies.length} competencies</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGeneratePath(goal)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Generate Path
                    </button>
                    <button
                      onClick={() => navigate(`/goals/${goal.id}`)}
                      className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {goals.filter(g => g.status === 'completed').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Completed Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.filter(g => g.status === 'completed').map(goal => (
                <div key={goal.id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{goal.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Completed on {goal.completedAt?.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-6">
              <Target className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Goals Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Set your first learning goal and start your journey to mastery. Goals help you stay focused and motivated.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Goal</h2>

              {/* Goal Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Learn Data Science"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe what you want to achieve..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Timeline */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeline *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={newGoal.timeline}
                    onChange={(e) => setNewGoal({ ...newGoal, timeline: parseInt(e.target.value) })}
                    className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={newGoal.timelineUnit}
                    onChange={(e) => setNewGoal({ ...newGoal, timelineUnit: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              {/* Target Competencies */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Competencies * ({newGoal.targetCompetencies.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                  {competencies.map(comp => (
                    <label key={comp.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newGoal.targetCompetencies.includes(comp.id)}
                        onChange={() => toggleCompetency(comp.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{comp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGoal}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalSetting
