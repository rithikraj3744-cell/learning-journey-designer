import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, Target, TrendingUp, CheckCircle, XCircle, ArrowRight, Star,
  Palette, Settings, Smartphone, Bot, Lock, Cloud, Image, Wrench, Database,
  Code, BarChart3, Layers
} from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

const CAREER_ROLES = [
  {
    id: 'full-stack-dev',
    title: 'Full Stack Developer',
    description: 'Build end-to-end web applications with frontend and backend expertise',
    iconColor: 'from-blue-400 to-cyan-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    salary: '$80k - $150k',
    demand: 'Very High',
    requiredCompetencies: [
      'JavaScript', 'React', 'Node.js', 'Databases', 'REST APIs', 'Git',
      'HTML/CSS', 'TypeScript', 'Testing', 'DevOps Basics'
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Extract insights from data using statistics, ML, and analytics',
    iconColor: 'from-purple-400 to-pink-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    salary: '$90k - $170k',
    demand: 'Very High',
    requiredCompetencies: [
      'Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization',
      'Pandas/NumPy', 'Deep Learning', 'Feature Engineering', 'A/B Testing'
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Define product strategy and drive cross-functional execution',
    iconColor: 'from-orange-400 to-red-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    salary: '$85k - $160k',
    demand: 'High',
    requiredCompetencies: [
      'Product Strategy', 'User Research', 'Agile/Scrum', 'Data Analysis',
      'Roadmap Planning', 'Stakeholder Management', 'Wireframing', 'Metrics & KPIs'
    ]
  },
  {
    id: 'ux-ui-designer',
    title: 'UX/UI Designer',
    description: 'Create intuitive and beautiful user experiences',
    iconColor: 'from-pink-400 to-rose-400',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    salary: '$70k - $140k',
    demand: 'High',
    requiredCompetencies: [
      'Figma', 'User Research', 'Prototyping', 'Design Systems',
      'Information Architecture', 'Interaction Design', 'Usability Testing', 'HTML/CSS'
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Automate infrastructure and optimize deployment pipelines',
    iconColor: 'from-slate-400 to-gray-400',
    iconBg: 'bg-slate-100 dark:bg-slate-900/30',
    salary: '$90k - $160k',
    demand: 'Very High',
    requiredCompetencies: [
      'Docker', 'Kubernetes', 'CI/CD', 'AWS/Azure/GCP', 'Linux',
      'Terraform', 'Monitoring', 'Scripting', 'Networking', 'Security'
    ]
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Developer',
    description: 'Build native or cross-platform mobile applications',
    iconColor: 'from-violet-400 to-purple-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    salary: '$75k - $145k',
    demand: 'High',
    requiredCompetencies: [
      'React Native/Flutter', 'iOS/Android', 'Mobile UI/UX',
      'REST APIs', 'State Management', 'App Store Deployment', 'Performance Optimization'
    ]
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    description: 'Build and deploy ML models at scale',
    iconColor: 'from-indigo-400 to-blue-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    salary: '$100k - $180k',
    demand: 'Very High',
    requiredCompetencies: [
      'Python', 'TensorFlow/PyTorch', 'ML Algorithms', 'MLOps',
      'Model Deployment', 'Feature Engineering', 'Model Optimization', 'Cloud ML Services'
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Specialist',
    description: 'Protect systems and data from security threats',
    iconColor: 'from-amber-400 to-orange-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    salary: '$85k - $165k',
    demand: 'Very High',
    requiredCompetencies: [
      'Network Security', 'Penetration Testing', 'Cryptography',
      'Security Auditing', 'Threat Analysis', 'Incident Response', 'Compliance', 'Firewalls'
    ]
  },
  {
    id: 'cloud-architect',
    title: 'Cloud Architect',
    description: 'Design and implement cloud infrastructure solutions',
    iconColor: 'from-sky-400 to-blue-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    salary: '$95k - $175k',
    demand: 'Very High',
    requiredCompetencies: [
      'AWS/Azure/GCP', 'Cloud Architecture', 'Microservices', 'Serverless',
      'Infrastructure as Code', 'Cost Optimization', 'Security', 'High Availability'
    ]
  },
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    description: 'Create engaging user interfaces and experiences',
    iconColor: 'from-emerald-400 to-teal-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    salary: '$70k - $135k',
    demand: 'High',
    requiredCompetencies: [
      'JavaScript', 'React/Vue/Angular', 'HTML/CSS', 'Responsive Design',
      'Performance Optimization', 'Web Accessibility', 'TypeScript', 'State Management'
    ]
  },
  {
    id: 'backend-dev',
    title: 'Backend Developer',
    description: 'Build robust server-side applications and APIs',
    iconColor: 'from-gray-400 to-slate-400',
    iconBg: 'bg-gray-100 dark:bg-gray-700',
    salary: '$75k - $145k',
    demand: 'Very High',
    requiredCompetencies: [
      'Node.js/Python/Java', 'Databases', 'REST/GraphQL APIs', 'Microservices',
      'Authentication', 'Caching', 'Message Queues', 'API Design'
    ]
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    description: 'Build data pipelines and infrastructure',
    iconColor: 'from-cyan-400 to-blue-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    salary: '$85k - $155k',
    demand: 'Very High',
    requiredCompetencies: [
      'SQL', 'Python', 'ETL/ELT', 'Data Warehousing', 'Apache Spark',
      'Data Modeling', 'Cloud Data Services', 'Airflow', 'Stream Processing'
    ]
  }
]

const CareerPathways = () => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)
  const [userCompetencies, setUserCompetencies] = useState([])
  const [competencyGaps, setCompetencyGaps] = useState({})

  useEffect(() => {
    loadUserCompetencies()
  }, [])

  useEffect(() => {
    if (userCompetencies.length > 0) {
      calculateGaps()
    }
  }, [userCompetencies])

  const loadUserCompetencies = async () => {
    if (!auth.currentUser) return

    // Get user's completed resources and extract competencies
    const completedResources = JSON.parse(localStorage.getItem('completedResources') || '[]')
    const competencies = [...new Set(completedResources.flatMap(r => r.competencies || []))]
    setUserCompetencies(competencies)
  }

  const calculateGaps = () => {
    const gaps = {}
    CAREER_ROLES.forEach(role => {
      const required = role.requiredCompetencies
      const mastered = required.filter(comp =>
        userCompetencies.some(uc => uc.toLowerCase().includes(comp.toLowerCase()))
      )
      const missing = required.filter(comp =>
        !userCompetencies.some(uc => uc.toLowerCase().includes(comp.toLowerCase()))
      )

      gaps[role.id] = {
        total: required.length,
        mastered: mastered.length,
        missing: missing.length,
        percentage: Math.round((mastered.length / required.length) * 100),
        missingList: missing
      }
    })
    setCompetencyGaps(gaps)
  }

  const handleStartPath = async (role) => {
    try {
      // Check if user is authenticated
      console.log('Current user:', auth.currentUser)

      if (!auth.currentUser) {
        alert('Please sign in to start a career path')
        navigate('/login')
        return
      }

      console.log('Creating path for user:', auth.currentUser.uid)

      const pathData = {
        title: `Path to ${role.title}`,
        description: role.description,
        careerRole: role.id,
        targetCompetencies: role.requiredCompetencies,
        createdAt: new Date(),
        status: 'active',
        progress: competencyGaps[role.id]?.percentage || 0
      }

      console.log('Path data to save:', pathData)

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'learningPaths'), pathData)
      console.log('Path created with ID:', docRef.id)

      // Create notification
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'notifications'), {
        type: 'career_path_started',
        title: 'Career Path Started!',
        message: `You've started your journey to become a ${role.title}`,
        timestamp: new Date(),
        read: false
      })

      // Show success message and navigate
      alert(`Successfully started path to ${role.title}!`)
      navigate('/my-paths')
    } catch (error) {
      console.error('Error starting career path:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)

      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please make sure you are signed in and the Firestore rules are updated.')
      } else if (error.code === 'unavailable') {
        alert('Network error. Please check your internet connection.')
      } else {
        alert(`Failed to start career path: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const getRoleReadiness = (roleId) => {
    const gap = competencyGaps[roleId]
    if (!gap) return 'beginner'

    if (gap.percentage >= 80) return 'ready'
    if (gap.percentage >= 50) return 'intermediate'
    if (gap.percentage >= 20) return 'developing'
    return 'beginner'
  }

  const getReadinessColor = (readiness) => {
    switch (readiness) {
      case 'ready': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'intermediate': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
      case 'developing': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getRoleIcon = (roleId) => {
    const iconProps = { className: "w-8 h-8 text-gray-700 dark:text-gray-300", strokeWidth: 1.5 }
    switch (roleId) {
      case 'ux-ui-designer': return <Palette {...iconProps} />
      case 'devops-engineer': return <Settings {...iconProps} />
      case 'mobile-dev': return <Smartphone {...iconProps} />
      case 'ml-engineer': return <Bot {...iconProps} />
      case 'cybersecurity': return <Lock {...iconProps} />
      case 'cloud-architect': return <Cloud {...iconProps} />
      case 'frontend-dev': return <Image {...iconProps} />
      case 'backend-dev': return <Wrench {...iconProps} />
      case 'data-engineer': return <Database {...iconProps} />
      case 'full-stack-dev': return <Code {...iconProps} />
      case 'data-scientist': return <BarChart3 {...iconProps} />
      case 'product-manager': return <Target {...iconProps} />
      default: return <Briefcase {...iconProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-900 dark:to-cyan-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Briefcase className="w-8 h-8" />
                Explore Career Pathways
              </h1>
              <p className="text-blue-100">
                Discover career opportunities and chart your path to success
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Career Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAREER_ROLES.map(role => {
            const gap = competencyGaps[role.id]
            const readiness = getRoleReadiness(role.id)

            return (
              <div
                key={role.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRole(role)}
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-xl ${role.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {getRoleIcon(role.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Salary: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{role.salary}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Demand: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{role.demand}</span>
                  </div>
                </div>

                {/* Progress */}
                {gap && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Readiness
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {gap.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${gap.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{gap.mastered} of {gap.total} competencies</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${getReadinessColor(readiness)}`}>
                        {readiness}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartPath(role)
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Start Path to {role.title.split(' ')[0]}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Role Detail Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-20 h-20 rounded-2xl ${selectedRole.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {getRoleIcon(selectedRole.id)}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedRole.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedRole.description}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full font-medium">
                      {selectedRole.salary}
                    </div>
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                      {selectedRole.demand} Demand
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness Overview */}
              {competencyGaps[selectedRole.id] && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Your Readiness: {competencyGaps[selectedRole.id].percentage}%
                  </h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all"
                      style={{ width: `${competencyGaps[selectedRole.id].percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've mastered {competencyGaps[selectedRole.id].mastered} out of {competencyGaps[selectedRole.id].total} required competencies
                  </p>
                </div>
              )}

              {/* Required Competencies */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Required Competencies
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRole.requiredCompetencies.map(comp => {
                    const hasMastered = userCompetencies.some(uc =>
                      uc.toLowerCase().includes(comp.toLowerCase())
                    )
                    return (
                      <div
                        key={comp}
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          hasMastered
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                            : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {hasMastered ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${
                          hasMastered
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {comp}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartPath(selectedRole)
                    setSelectedRole(null)
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Start This Career Path
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CareerPathways
