import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, TrendingUp, Calendar, Plus } from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'

const GoalsDashboardWidget = () => {
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveGoals()
  }, [])

  const loadActiveGoals = async () => {
    if (!auth.currentUser) {
      setLoading(false)
      return
    }

    try {
      const goalsRef = collection(db, 'users', auth.currentUser.uid, 'goals')
      const q = query(
        goalsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(3)
      )
      const snapshot = await getDocs(q)
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        targetDate: doc.data().targetDate?.toDate()
      }))
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (goal) => {
    if (!goal.targetCompetencies || goal.targetCompetencies.length === 0) return 0
    return Math.round((goal.completedCompetencies?.length || 0) / goal.targetCompetencies.length * 100)
  }

  const getDaysRemaining = (targetDate) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          My Goals
        </h2>
        <button
          onClick={() => navigate('/goals')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View All
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map(goal => (
            <div
              key={goal.id}
              onClick={() => navigate('/goals')}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full font-medium">
                  {calculateProgress(goal)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${calculateProgress(goal)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getDaysRemaining(goal.targetDate)} days left
                </span>
                <span>{goal.targetCompetencies?.length || 0} competencies</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-3">
            <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            No goals yet. Set your first learning goal!
          </p>
          <button
            onClick={() => navigate('/goals')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
      )}
    </div>
  )
}

export default GoalsDashboardWidget
