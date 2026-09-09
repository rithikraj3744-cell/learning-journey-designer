import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)
  const userId = 'demo-user' // TODO: Replace with auth context

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/analytics/user/${userId}/detailed`)
      if (response.data.success) {
        setAnalyticsData(response.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format data for charts
  const formatLearningTimeData = () => {
    if (!analyticsData?.velocity?.velocity_per_week) return []
    return Object.entries(analyticsData.velocity.velocity_per_week)
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        competencies: count
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week))
  }

  const formatCategoryProgress = () => {
    if (!analyticsData?.competency_mastery) return []
    return Object.entries(analyticsData.competency_mastery).map(([category, level]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      level: level,
      percentage: (level / 5) * 100
    }))
  }

  const formatResourceBreakdown = () => {
    const completed = analyticsData?.summary?.resources_completed || 0
    const inProgress = analyticsData?.learning_paths?.reduce((acc, path) =>
      acc + (path.progress > 0 && path.progress < 100 ? 1 : 0), 0) || 0
    const notStarted = Math.max(0, 20 - completed - inProgress)

    return [
      { name: 'Completed', value: completed, color: '#10B981' },
      { name: 'In Progress', value: inProgress, color: '#F59E0B' },
      { name: 'Not Started', value: notStarted, color: '#6B7280' }
    ]
  }

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Completed your first competency', earned: true, icon: '🎯' },
    { id: 2, title: 'Week Warrior', description: 'Maintained a 7-day streak', earned: analyticsData?.summary?.streak_days >= 7, icon: '🔥' },
    { id: 3, title: 'Knowledge Seeker', description: 'Studied 10 competencies', earned: analyticsData?.summary?.competencies_count >= 10, icon: '📚' },
    { id: 4, title: 'Time Master', description: 'Logged 20 hours of learning', earned: (analyticsData?.summary?.total_time_minutes || 0) >= 1200, icon: '⏰' },
    { id: 5, title: 'Path Pioneer', description: 'Completed a learning path', earned: analyticsData?.learning_paths?.some(p => p.progress === 100), icon: '🗺️' },
    { id: 6, title: 'Resource Master', description: 'Completed 15 resources', earned: analyticsData?.summary?.resources_completed >= 15, icon: '📖' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const summary = analyticsData?.summary || {}
  const learningTimeData = formatLearningTimeData()
  const categoryData = formatCategoryProgress()
  const resourceData = formatResourceBreakdown()

  return (
    <div className="min-h-screen bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Learning Analytics</h1>
              <p className="text-gray-400">
                Track your progress and insights
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-900/50 rounded-lg">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.competencies_count || 0}</p>
                <p className="text-sm text-gray-400">Competencies</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-900/50 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.resources_completed || 0}</p>
                <p className="text-sm text-gray-400">Resources Done</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-900/50 rounded-lg">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {(analyticsData?.velocity?.average_velocity || 0).toFixed(1)}
                </p>
                <p className="text-sm text-gray-400">Comp/Week</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-900/50 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.floor((summary.total_time_minutes || 0) / 60)}h
                </p>
                <p className="text-sm text-gray-400">Total Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Learning Velocity Over Time */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Learning Velocity (12 Weeks)
            </h2>
            {learningTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={learningTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="competencies"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    name="Competencies"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No data available yet</p>
              </div>
            )}
          </div>

          {/* Resources Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Resources Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Progress by Category */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Progress by Category
            </h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="level" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Mastery Level (out of 5)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements & Badges */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements & Badges
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-lg p-4 border ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50'
                    : 'bg-gray-700/30 border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-3xl ${
                      achievement.earned ? 'grayscale-0' : 'grayscale opacity-50'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      achievement.earned ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                    {achievement.earned && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">📊 Learning Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total Activities</p>
              <p className="text-3xl font-bold">{summary.total_activities || 0}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Current Streak</p>
              <p className="text-3xl font-bold">{summary.streak_days || 0} days 🔥</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Avg. Learning Velocity</p>
              <p className="text-3xl font-bold">
                {(analyticsData?.velocity?.average_velocity || 0).toFixed(1)} comp/week
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
