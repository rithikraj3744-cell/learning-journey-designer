import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award, Target, TrendingUp, CheckCircle, Book, ArrowRight, Star,
  Cloud, Lock, Shield, Bot, BarChart3, Container, Layers, Users, Server
} from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

const CERTIFICATIONS = [
  {
    id: 'aws-solutions-architect',
    name: 'AWS Solutions Architect - Associate',
    provider: 'Amazon Web Services',
    iconComponent: Cloud,
    iconColor: 'from-orange-400 to-orange-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    level: 'Associate',
    duration: '3-4 months',
    cost: '$150',
    popularity: 'Very High',
    requiredCompetencies: [
      'AWS Core Services', 'EC2', 'S3', 'VPC', 'IAM', 'RDS',
      'Lambda', 'CloudFormation', 'High Availability', 'Security Best Practices'
    ],
    recommendedResources: [
      'A Cloud Guru AWS Course',
      'AWS Official Documentation',
      'AWS Practice Tests',
      'Hands-on AWS Labs'
    ]
  },
  {
    id: 'google-cloud-architect',
    name: 'Google Cloud Professional Architect',
    provider: 'Google Cloud',
    iconComponent: Cloud,
    iconColor: 'from-blue-400 to-cyan-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    level: 'Professional',
    duration: '4-5 months',
    cost: '$200',
    popularity: 'High',
    requiredCompetencies: [
      'GCP Services', 'Compute Engine', 'Cloud Storage', 'Kubernetes Engine',
      'Cloud Functions', 'Networking', 'Security', 'Cost Optimization'
    ],
    recommendedResources: [
      'Google Cloud Training',
      'Coursera GCP Specialization',
      'GCP Practice Exams',
      'Qwiklabs'
    ]
  },
  {
    id: 'azure-fundamentals',
    name: 'Microsoft Azure Fundamentals (AZ-900)',
    provider: 'Microsoft',
    iconComponent: Cloud,
    iconColor: 'from-sky-400 to-blue-500',
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    level: 'Fundamentals',
    duration: '1-2 months',
    cost: '$99',
    popularity: 'Very High',
    requiredCompetencies: [
      'Azure Core Services', 'Virtual Machines', 'Azure Storage',
      'Azure Networking', 'Azure Identity', 'Azure Pricing'
    ],
    recommendedResources: [
      'Microsoft Learn',
      'Azure Fundamentals Course',
      'Practice Tests',
      'Azure Portal Hands-on'
    ]
  },
  {
    id: 'cissp',
    name: 'Certified Information Systems Security Professional',
    provider: 'ISC2',
    iconComponent: Lock,
    iconColor: 'from-red-400 to-rose-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    level: 'Professional',
    duration: '6-9 months',
    cost: '$749',
    popularity: 'Very High',
    requiredCompetencies: [
      'Security Architecture', 'Risk Management', 'Cryptography',
      'Network Security', 'Identity Management', 'Security Operations',
      'Software Security', 'Asset Security'
    ],
    recommendedResources: [
      'CISSP Official Study Guide',
      'Cybrary CISSP Course',
      'Practice Questions',
      'Security+ Foundation'
    ]
  },
  {
    id: 'pmp',
    name: 'Project Management Professional',
    provider: 'PMI',
    iconComponent: BarChart3,
    iconColor: 'from-purple-400 to-pink-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    level: 'Professional',
    duration: '4-6 months',
    cost: '$555',
    popularity: 'High',
    requiredCompetencies: [
      'Project Management', 'Agile Methodologies', 'Risk Management',
      'Stakeholder Management', 'Resource Planning', 'Quality Management',
      'Communication', 'Leadership'
    ],
    recommendedResources: [
      'PMBOK Guide',
      'PMP Exam Prep Course',
      'Practice Exams',
      'Project Management Tools'
    ]
  },
  {
    id: 'cka',
    name: 'Certified Kubernetes Administrator',
    provider: 'Cloud Native Computing Foundation',
    iconComponent: Container,
    iconColor: 'from-blue-400 to-indigo-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    level: 'Professional',
    duration: '2-3 months',
    cost: '$395',
    popularity: 'Very High',
    requiredCompetencies: [
      'Kubernetes Architecture', 'Pod Management', 'Services & Networking',
      'Storage', 'Security', 'Troubleshooting', 'Cluster Management'
    ],
    recommendedResources: [
      'Kubernetes Official Docs',
      'CKA Course',
      'Practice Clusters',
      'Hands-on Labs'
    ]
  },
  {
    id: 'tensorflow-cert',
    name: 'TensorFlow Developer Certificate',
    provider: 'Google',
    iconComponent: Bot,
    iconColor: 'from-orange-400 to-red-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    level: 'Professional',
    duration: '3-4 months',
    cost: '$100',
    popularity: 'High',
    requiredCompetencies: [
      'Python', 'TensorFlow', 'Neural Networks', 'Computer Vision',
      'NLP', 'Time Series', 'Model Training', 'Model Deployment'
    ],
    recommendedResources: [
      'TensorFlow in Practice Specialization',
      'Deep Learning Specialization',
      'TensorFlow Documentation',
      'Kaggle Competitions'
    ]
  },
  {
    id: 'comptia-security',
    name: 'CompTIA Security+',
    provider: 'CompTIA',
    iconComponent: Shield,
    iconColor: 'from-green-400 to-emerald-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    level: 'Entry',
    duration: '2-3 months',
    cost: '$381',
    popularity: 'Very High',
    requiredCompetencies: [
      'Network Security', 'Threats & Vulnerabilities', 'Identity Management',
      'Risk Management', 'Cryptography', 'Security Operations'
    ],
    recommendedResources: [
      'Professor Messer Videos',
      'CompTIA Study Guide',
      'Practice Tests',
      'Security Labs'
    ]
  },
  {
    id: 'ckad',
    name: 'Certified Kubernetes Application Developer',
    provider: 'Cloud Native Computing Foundation',
    iconComponent: Layers,
    iconColor: 'from-cyan-400 to-blue-500',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    level: 'Professional',
    duration: '2-3 months',
    cost: '$395',
    popularity: 'High',
    requiredCompetencies: [
      'Kubernetes Basics', 'Application Design', 'Application Deployment',
      'Application Observability', 'Services & Networking', 'Pod Configuration'
    ],
    recommendedResources: [
      'CKAD Course',
      'Kubernetes Docs',
      'Practice Exams',
      'Hands-on Labs'
    ]
  },
  {
    id: 'google-data-engineer',
    name: 'Google Cloud Professional Data Engineer',
    provider: 'Google Cloud',
    iconComponent: BarChart3,
    iconColor: 'from-indigo-400 to-purple-500',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    level: 'Professional',
    duration: '4-5 months',
    cost: '$200',
    popularity: 'High',
    requiredCompetencies: [
      'BigQuery', 'Dataflow', 'Pub/Sub', 'Cloud Storage', 'Data Modeling',
      'ETL Pipelines', 'Machine Learning', 'Data Security'
    ],
    recommendedResources: [
      'GCP Data Engineering Course',
      'Coursera Specialization',
      'Practice Labs',
      'BigQuery Tutorials'
    ]
  },
  {
    id: 'scrum-master',
    name: 'Certified ScrumMaster (CSM)',
    provider: 'Scrum Alliance',
    iconComponent: Users,
    iconColor: 'from-teal-400 to-green-500',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    level: 'Entry',
    duration: '1-2 months',
    cost: '$995',
    popularity: 'High',
    requiredCompetencies: [
      'Scrum Framework', 'Agile Principles', 'Sprint Planning',
      'Facilitation', 'Team Coaching', 'Product Backlog', 'Retrospectives'
    ],
    recommendedResources: [
      'Scrum Guide',
      'CSM Training Course',
      'Agile Practice',
      'Team Coaching'
    ]
  },
  {
    id: 'rhcsa',
    name: 'Red Hat Certified System Administrator',
    provider: 'Red Hat',
    iconComponent: Server,
    iconColor: 'from-red-400 to-orange-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    level: 'Associate',
    duration: '3-4 months',
    cost: '$400',
    popularity: 'High',
    requiredCompetencies: [
      'Linux Administration', 'System Configuration', 'User Management',
      'File Systems', 'Networking', 'Security', 'Shell Scripting'
    ],
    recommendedResources: [
      'RHCSA Study Guide',
      'Linux Academy',
      'Practice Labs',
      'Red Hat Documentation'
    ]
  }
]

const CertificationPrep = () => {
  const navigate = useNavigate()
  const [certifications, setCertifications] = useState(CERTIFICATIONS)
  const [userCompetencies, setUserCompetencies] = useState([])
  const [readinessScores, setReadinessScores] = useState({})
  const [selectedCert, setSelectedCert] = useState(null)
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    loadUserCompetencies()
  }, [])

  useEffect(() => {
    if (userCompetencies.length > 0) {
      calculateReadiness()
    }
  }, [userCompetencies])

  const loadUserCompetencies = async () => {
    if (!auth.currentUser) return

    // Get user's completed resources and extract competencies
    const completedResources = JSON.parse(localStorage.getItem('completedResources') || '[]')
    const competencies = [...new Set(completedResources.flatMap(r => r.competencies || []))]
    setUserCompetencies(competencies)
  }

  const calculateReadiness = () => {
    const scores = {}
    CERTIFICATIONS.forEach(cert => {
      const required = cert.requiredCompetencies
      const mastered = required.filter(comp =>
        userCompetencies.some(uc => uc.toLowerCase().includes(comp.toLowerCase()))
      )
      const missing = required.filter(comp =>
        !userCompetencies.some(uc => uc.toLowerCase().includes(comp.toLowerCase()))
      )

      scores[cert.id] = {
        total: required.length,
        mastered: mastered.length,
        missing: missing.length,
        percentage: Math.round((mastered.length / required.length) * 100),
        missingList: missing
      }
    })
    setReadinessScores(scores)
  }

  const handleStartPrep = async (cert) => {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        alert('Please sign in to start certification prep')
        navigate('/login')
        return
      }

      const pathData = {
        title: `Prep for ${cert.name}`,
        description: `Certification preparation path for ${cert.name}`,
        certificationId: cert.id,
        targetCompetencies: cert.requiredCompetencies,
        createdAt: new Date(),
        status: 'active',
        progress: readinessScores[cert.id]?.percentage || 0,
        type: 'certification'
      }

      // Add to Firestore
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'learningPaths'), pathData)

      // Create notification
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'notifications'), {
        type: 'cert_prep_started',
        title: 'Certification Prep Started!',
        message: `You've started preparing for ${cert.name}`,
        timestamp: new Date(),
        read: false
      })

      // Show success message and navigate
      alert(`Successfully started prep for ${cert.name}!`)
      navigate('/my-paths')
    } catch (error) {
      console.error('Error starting certification prep:', error)

      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please make sure you are signed in.')
      } else if (error.code === 'unavailable') {
        alert('Network error. Please check your internet connection.')
      } else {
        alert(`Failed to start certification prep: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const getReadinessLevel = (percentage) => {
    if (percentage >= 80) return { label: 'Ready', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20' }
    if (percentage >= 60) return { label: 'Almost Ready', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20' }
    if (percentage >= 40) return { label: 'In Progress', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20' }
    return { label: 'Getting Started', color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700' }
  }

  const filteredCertifications = filterLevel === 'all'
    ? certifications
    : certifications.filter(cert => cert.level === filterLevel)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-900 dark:to-orange-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Award className="w-8 h-8" />
                Certification Preparation
              </h1>
              <p className="text-yellow-100">
                Prepare for industry-recognized certifications and boost your career
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterLevel === 'all'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            All Certifications
          </button>
          <button
            onClick={() => setFilterLevel('Entry')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterLevel === 'Entry'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Entry Level
          </button>
          <button
            onClick={() => setFilterLevel('Associate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterLevel === 'Associate'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Associate
          </button>
          <button
            onClick={() => setFilterLevel('Professional')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterLevel === 'Professional'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Professional
          </button>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map(cert => {
            const score = readinessScores[cert.id]
            const readiness = score ? getReadinessLevel(score.percentage) : { label: 'Not Started', color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700' }

            return (
              <div
                key={cert.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                {/* Cert Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-xl ${cert.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <cert.iconComponent className="w-8 h-8 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {cert.provider}
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                        {cert.level}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">
                        {cert.popularity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <span>Duration:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cert.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <span>Cost:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cert.cost}</span>
                  </div>
                </div>

                {/* Readiness */}
                {score && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Readiness
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${readiness.color}`}>
                        {readiness.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${score.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>{score.mastered} of {score.total} competencies</span>
                      <span className="font-bold text-gray-900 dark:text-white">{score.percentage}%</span>
                    </div>
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartPrep(cert)
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Start Preparation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Certification Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-20 h-20 rounded-2xl ${selectedCert.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <selectedCert.iconComponent className="w-10 h-10 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedCert.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedCert.provider}
                  </p>
                  <div className="flex gap-3 text-sm flex-wrap">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                      {selectedCert.level}
                    </div>
                    <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                      {selectedCert.popularity} Popularity
                    </div>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full font-medium">
                      {selectedCert.duration}
                    </div>
                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                      {selectedCert.cost}
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness Score */}
              {readinessScores[selectedCert.id] && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Your Readiness Score: {readinessScores[selectedCert.id].percentage}%
                  </h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                    <div
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 h-3 rounded-full transition-all"
                      style={{ width: `${readinessScores[selectedCert.id].percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've mastered {readinessScores[selectedCert.id].mastered} out of {readinessScores[selectedCert.id].total} required competencies
                  </p>
                </div>
              )}

              {/* Required Competencies */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Required Competencies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCert.requiredCompetencies.map(comp => {
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
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                          hasMastered ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`} />
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

              {/* Recommended Resources */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Recommended Resources
                </h3>
                <div className="space-y-2">
                  {selectedCert.recommendedResources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                    >
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {resource}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartPrep(selectedCert)
                    setSelectedCert(null)
                  }}
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Start Preparation
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

export default CertificationPrep
