import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db, auth } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import {
  Trophy,
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Flame,
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle,
  PlayCircle
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const EnhancedDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    totalResources: 0,
    completedResources: 0,
    learningResources: 0,
    totalPaths: 0,
    totalHours: 0,
    streakDays: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadDashboardData()
    }
  }, [currentUser])

  const loadDashboardData = async () => {
    if (!auth.currentUser) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Load user's learning paths from Firestore
      const pathsRef = collection(db, 'users', auth.currentUser.uid, 'learningPaths')
      const pathsSnapshot = await getDocs(pathsRef)
      const paths = pathsSnapshot.docs.map(doc => doc.data())

      // Calculate stats from Firestore data
      const activePaths = paths.filter(p => p.status === 'active').length
      const completedPaths = paths.filter(p => p.status === 'completed').length

      // Calculate total hours from paths
      const totalHours = paths.reduce((sum, path) => {
        return sum + (path.totalHours || 0)
      }, 0)

      // Calculate completed hours based on progress
      const completedHours = paths.reduce((sum, path) => {
        const pathHours = path.totalHours || 0
        const progress = path.progress || 0
        return sum + (pathHours * (progress / 100))
      }, 0)

      setStats({
        totalResources: paths.length,
        completedResources: completedPaths,
        learningResources: activePaths,
        totalPaths: paths.length,
        totalHours: Math.round(completedHours),
        streakDays: 0 // TODO: Implement streak calculation
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, Learner! 👋
              </h1>
              <p className="text-blue-100">
                Keep up the great work on your learning journey
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.streakDays}</span>
            </div>
            <p className="text-orange-100 text-sm">Day Streak 🔥</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalHours}h</span>
            </div>
            <p className="text-blue-100 text-sm">Total Learning Time</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalResources}</span>
            </div>
            <p className="text-green-100 text-sm">Resources in Library</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.completedResources}</span>
            </div>
            <p className="text-purple-100 text-sm">Resources Completed</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Learning Progress
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-blue-600" />
                    Currently Learning
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.learningResources}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.learningResources / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Completed
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedResources}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.completedResources / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.totalResources > 0 ? Math.round((stats.completedResources / stats.totalResources) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Paths */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Your Learning Paths
              </h2>
              <button
                onClick={() => navigate('/my-paths')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {stats.totalPaths > 0 ? (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                    <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {stats.totalPaths} Active Path{stats.totalPaths !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You're making great progress!
                  </p>
                  <button
                    onClick={() => navigate('/my-paths')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View My Paths
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Learning Paths Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Generate your first personalized learning path
                </p>
                <button
                  onClick={() => navigate('/path-generator')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Path
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/competencies')}
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Browse Competencies</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Explore skills to learn</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Find Resources</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Discover learning materials</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/path-generator')}
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Generate Path</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Create learning journey</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
