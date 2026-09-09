import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Target, Clock, BookOpen, TrendingUp } from 'lucide-react'

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    displayName: '',
    careerGoals: '',
    experience: 'beginner',
    timeAvailable: 10,
    learningStyle: 'visual',
    preferredResourceTypes: []
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        careerGoals: userProfile.profile?.careerGoals || '',
        experience: userProfile.profile?.experience || 'beginner',
        timeAvailable: userProfile.profile?.learningPreferences?.timeAvailable || 10,
        learningStyle: userProfile.profile?.learningPreferences?.learningStyle || 'visual',
        preferredResourceTypes: userProfile.profile?.learningPreferences?.preferredResourceTypes || []
      })
    }
  }, [userProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleResourceTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      preferredResourceTypes: prev.preferredResourceTypes.includes(type)
        ? prev.preferredResourceTypes.filter(t => t !== type)
        : [...prev.preferredResourceTypes, type]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await updateUserProfile({
        displayName: formData.displayName,
        profile: {
          ...userProfile.profile,
          careerGoals: formData.careerGoals,
          experience: formData.experience,
          learningPreferences: {
            timeAvailable: parseInt(formData.timeAvailable),
            learningStyle: formData.learningStyle,
            preferredResourceTypes: formData.preferredResourceTypes
          }
        }
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resourceTypes = ['video', 'article', 'course', 'tutorial', 'book', 'interactive']
  const experienceLevels = ['beginner', 'intermediate', 'advanced', 'expert']
  const learningStyles = ['visual', 'auditory', 'reading', 'kinesthetic']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile and learning preferences
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Overview */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4">
              <User className="h-12 w-12 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{userProfile?.displayName || 'User'}</h2>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {currentUser?.email}
              </div>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <BookOpen className="h-6 w-6 mx-auto text-primary-600 mb-2" />
            <p className="text-2xl font-bold">{userProfile?.stats?.completedPaths || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed Paths</p>
          </div>
          <div className="text-center">
            <Target className="h-6 w-6 mx-auto text-primary-600 mb-2" />
            <p className="text-2xl font-bold">{userProfile?.stats?.totalCompetencies || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Competencies</p>
          </div>
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto text-primary-600 mb-2" />
            <p className="text-2xl font-bold">{userProfile?.stats?.hoursLearned || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hours Learned</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-primary-600 mb-2" />
            <p className="text-2xl font-bold">{userProfile?.stats?.assessmentsTaken || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Assessments</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      {!editing ? (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Profile Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Career Goals</label>
              <p className="mt-1">{formData.careerGoals || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience Level</label>
              <p className="mt-1 capitalize">{formData.experience}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Time</label>
              <p className="mt-1">{formData.timeAvailable} hours per week</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Style</label>
              <p className="mt-1 capitalize">{formData.learningStyle}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Preferred Resource Types</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.preferredResourceTypes.length > 0 ? (
                  formData.preferredResourceTypes.map(type => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm capitalize"
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No preferences set</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="careerGoals" className="block text-sm font-medium mb-2">
                Career Goals
              </label>
              <textarea
                id="careerGoals"
                name="careerGoals"
                value={formData.careerGoals}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="What are your career goals?"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium mb-2">
                Experience Level
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="input-field"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level} className="capitalize">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timeAvailable" className="block text-sm font-medium mb-2">
                Available Time (hours per week)
              </label>
              <input
                type="number"
                id="timeAvailable"
                name="timeAvailable"
                value={formData.timeAvailable}
                onChange={handleChange}
                min="1"
                max="168"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="learningStyle" className="block text-sm font-medium mb-2">
                Learning Style
              </label>
              <select
                id="learningStyle"
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleChange}
                className="input-field"
              >
                {learningStyles.map(style => (
                  <option key={style} value={style} className="capitalize">
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preferred Resource Types
              </label>
              <div className="flex flex-wrap gap-2">
                {resourceTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleResourceTypeToggle(type)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      formData.preferredResourceTypes.includes(type)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setMessage({ type: '', text: '' })
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Account Information */}
      <div className="card mt-6">
        <h3 className="text-xl font-semibold mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Member Since</span>
            <span className="font-medium">
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Email Verified</span>
            <span className={`font-medium ${currentUser?.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {currentUser?.emailVerified ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Account ID</span>
            <span className="font-mono text-sm">{currentUser?.uid.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
