import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, TrendingUp, Calendar, CheckCircle, Award, Plus, Trash2, PlayCircle } from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const LearningPaths = () => {
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    console.log('LearningPaths component mounted')

    // Wait for auth state to be ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user')

      if (user) {
        console.log('Auth ready, loading paths for user:', user.uid)
        loadPaths()
      } else {
        console.log('No user signed in')
        setLoading(false)
      }
    })

    return () => {
      console.log('LearningPaths component unmounting')
      unsubscribe()
    }
  }, [])

  const loadPaths = async () => {
    if (!auth.currentUser) {
      setLoading(false)
      return
    }

    try {
      const pathsRef = collection(db, 'users', auth.currentUser.uid, 'learningPaths')
      const snapshot = await getDocs(pathsRef)

      const pathsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        targetDate: doc.data().targetDate?.toDate()
      }))

      // Sort in JavaScript instead of Firestore
      pathsData.sort((a, b) => {
        const dateA = a.createdAt || new Date(0)
        const dateB = b.createdAt || new Date(0)
        return dateB - dateA
      })

      setPaths(pathsData)
      console.log('Loaded paths:', pathsData)
    } catch (error) {
      console.error('Error loading paths:', error)
      alert(`Failed to load paths: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePath = async (pathId) => {
    if (!confirm('Are you sure you want to delete this learning path?')) return

    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'learningPaths', pathId))
      setPaths(paths.filter(p => p.id !== pathId))
    } catch (error) {
      console.error('Error deleting path:', error)
      alert('Failed to delete learning path')
    }
  }

  const filteredPaths = paths.filter(path => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return path.status === 'active'
    if (activeTab === 'completed') return path.status === 'completed'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your learning paths...</p>
        </div>
      </div>
    )
  }

  if (!auth.currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to view your learning paths</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Target className="w-8 h-8" />
                My Learning Paths
              </h1>
              <p className="text-blue-100">
                Track your personalized learning journeys
              </p>
            </div>
            <button
              onClick={() => navigate('/path-generator')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Generate New Path
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            All Paths ({paths.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Active ({paths.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Completed ({paths.filter(p => p.status === 'completed').length})
          </button>
        </div>

        {/* Paths Grid */}
        {filteredPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map(path => (
              <div
                key={path.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {path.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {path.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePath(path.id)}
                    className="text-red-500 hover:text-red-700 transition-colors ml-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Type Badge */}
                {path.type && (
                  <div className="mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">
                      {path.type === 'certification' ? 'Certification Prep' : 'Career Path'}
                    </span>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.round(path.progress || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${path.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{path.targetCompetencies?.length || 0} competencies</span>
                  </div>
                  {path.targetDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(path.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/learning-paths/${path.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No learning paths yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Generate your first personalized learning path to get started
            </p>
            <button
              onClick={() => navigate('/path-generator')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Learning Path
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LearningPaths
