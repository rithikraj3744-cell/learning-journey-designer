import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { getUserAssessments } from '../services/firestore'
import KnowledgeGraph from '../components/KnowledgeGraph'
import { Target, Filter, Search, TrendingUp, BookOpen, AlertCircle, Award } from 'lucide-react'
import knowledgeGraphService, { CareerRoles } from '../services/knowledgeGraphService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const USE_MOCK_DATA = true // Set to false when backend is available

const KnowledgeGraphPage = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [viewMode, setViewMode] = useState('full') // 'full', 'category', 'role'
  const [selectedRole, setSelectedRole] = useState(null)
  const [roles, setRoles] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState([])
  const [highlightedPath, setHighlightedPath] = useState([])
  const [userCompetencies, setUserCompetencies] = useState({})
  const [showPathToRole, setShowPathToRole] = useState(false)
  const [userAssessments, setUserAssessments] = useState([])
  const [completedCompetencies, setCompletedCompetencies] = useState([])

  // Load initial graph data
  useEffect(() => {
    loadFullGraph()
    loadRoles()
  }, [])

  // Load user competencies from assessments
  useEffect(() => {
    loadUserAssessmentsData()
  }, [currentUser])

  const loadUserAssessmentsData = async () => {
    if (!currentUser) {
      console.log('No user logged in, skipping assessment data load')
      return
    }

    try {
      const assessments = await getUserAssessments(currentUser.uid)
      setUserAssessments(assessments)

      // Extract completed competencies (those with score >= 60%)
      const completed = []
      const competencyMap = {}

      assessments.forEach(assessment => {
        if (assessment.competencyScores) {
          Object.entries(assessment.competencyScores).forEach(([compId, data]) => {
            const percentage = Math.round((data.correct / data.total) * 100)

            if (percentage >= 60) {
              completed.push(compId)
            }

            competencyMap[compId] = {
              score: percentage,
              level: percentage >= 80 ? 'Advanced' : percentage >= 60 ? 'Intermediate' : 'Beginner',
              lastAssessed: assessment.completedAt
            }
          })
        }
      })

      setCompletedCompetencies([...new Set(completed)])
      setUserCompetencies(competencyMap)

      console.log('✓ Loaded user assessment data:', {
        totalAssessments: assessments.length,
        completedCompetencies: completed.length,
        competencyMap
      })
    } catch (error) {
      console.error('Error loading user assessments:', error)
    }
  }

  const loadFullGraph = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use mock data if backend is unavailable
      if (USE_MOCK_DATA) {
        const mockGraphData = knowledgeGraphService.buildGraphData()

        // Transform data to match component expectations
        const transformedData = {
          nodes: mockGraphData.nodes.map(n => ({
            id: n.id,
            label: n.name,
            type: n.category === 'role' ? 'role' : 'competency',
            category: n.category,
            description: `${n.name} - Level ${n.level}`,
            level: n.level,
            // Mark node as completed if user has passed assessment
            completed: completedCompetencies.includes(n.id),
            userScore: userCompetencies[n.id]?.score
          })),
          edges: mockGraphData.links.map(l => ({
            source: l.source,
            target: l.target,
            type: l.type
          }))
        }

        setGraphData(transformedData)
        extractCategories(transformedData.nodes)

        // Auto-highlight completed competencies
        if (completedCompetencies.length > 0) {
          setHighlightedNodes(completedCompetencies)
        }

        setLoading(false)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/api/graph/full`)
      if (response.data.success) {
        setGraphData(response.data.graph)
        extractCategories(response.data.graph.nodes)
      } else {
        setError('Failed to load graph data')
      }
    } catch (err) {
      console.error('Error loading graph:', err)
      // Fallback to mock data on error
      console.log('Falling back to mock data...')
      const mockGraphData = knowledgeGraphService.buildGraphData()

      // Transform data to match component expectations
      const transformedData = {
        nodes: mockGraphData.nodes.map(n => ({
          id: n.id,
          label: n.name,
          type: n.category === 'role' ? 'role' : 'competency',
          category: n.category,
          description: `${n.name} - Level ${n.level}`,
          level: n.level,
          completed: completedCompetencies.includes(n.id),
          userScore: userCompetencies[n.id]?.score
        })),
        edges: mockGraphData.links.map(l => ({
          source: l.source,
          target: l.target,
          type: l.type
        }))
      }

      setGraphData(transformedData)
      extractCategories(transformedData.nodes)

      if (completedCompetencies.length > 0) {
        setHighlightedNodes(completedCompetencies)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      // Use mock data if backend is unavailable
      if (USE_MOCK_DATA) {
        const mockRoles = Object.values(CareerRoles)
        setRoles(mockRoles)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/api/graph/roles`)
      if (response.data.success) {
        setRoles(response.data.roles)
      }
    } catch (err) {
      console.error('Error loading roles:', err)
      // Fallback to mock data
      const mockRoles = Object.values(CareerRoles)
      setRoles(mockRoles)
    }
  }

  const loadUserCompetencies = async () => {
    try {
      // TODO: Replace with actual user ID from auth context
      const userId = 'demo-user'
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/competencies`)
      if (response.data.success) {
        setUserCompetencies(response.data.competencies || {})
      }
    } catch (err) {
      console.error('Error loading user competencies:', err)
      // Use empty object as fallback
      setUserCompetencies({})
    }
  }

  const extractCategories = (nodes) => {
    const uniqueCategories = [...new Set(nodes.map(n => n.category).filter(Boolean))]
    setCategories(uniqueCategories)
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node)

    // Navigate to competency learning page if it's a competency (not a role)
    if (node.category && node.category !== 'role') {
      console.log('Navigating to learning page for:', node.id)
      navigate(`/learn/${node.id}`)
    } else {
      console.log('Node is a role, not navigating:', node)
    }
  }

  const handleViewModeChange = async (mode) => {
    setViewMode(mode)
    setHighlightedNodes([])
    setHighlightedPath([])
    setShowPathToRole(false)

    if (mode === 'full') {
      loadFullGraph()
    }
  }

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category)
    setLoading(true)
    setError(null)

    try {
      // Use mock data if backend is unavailable
      if (USE_MOCK_DATA) {
        const mockGraphData = knowledgeGraphService.buildGraphData()

        // Filter nodes by category
        const filteredNodes = mockGraphData.nodes.filter(n => n.category === category)
        const nodeIds = new Set(filteredNodes.map(n => n.id))

        // Filter edges to only include those between filtered nodes
        const filteredLinks = mockGraphData.links.filter(l => 
          nodeIds.has(l.source) && nodeIds.has(l.target)
        )

        // Transform data
        const transformedData = {
          nodes: filteredNodes.map(n => ({
            id: n.id,
            label: n.name,
            type: n.category === 'role' ? 'role' : 'competency',
            category: n.category,
            description: `${n.name} - Level ${n.level}`,
            level: n.level,
            completed: completedCompetencies.includes(n.id),
            userScore: userCompetencies[n.id]?.score
          })),
          edges: filteredLinks.map(l => ({
            source: l.source,
            target: l.target,
            type: l.type
          }))
        }

        setGraphData(transformedData)
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/api/graph/category/${category}`)
      if (response.data.success) {
        setGraphData(response.data.graph)
      } else {
        setError('Failed to load category graph')
      }
    } catch (err) {
      console.error('Error loading category graph:', err)
      
      // Fallback to mock data
      const mockGraphData = knowledgeGraphService.buildGraphData()
      const filteredNodes = mockGraphData.nodes.filter(n => n.category === category)
      const nodeIds = new Set(filteredNodes.map(n => n.id))
      const filteredLinks = mockGraphData.links.filter(l => 
        nodeIds.has(l.source) && nodeIds.has(l.target)
      )

      const transformedData = {
        nodes: filteredNodes.map(n => ({
          id: n.id,
          label: n.name,
          type: n.category === 'role' ? 'role' : 'competency',
          category: n.category,
          description: `${n.name} - Level ${n.level}`,
          level: n.level,
          completed: completedCompetencies.includes(n.id),
          userScore: userCompetencies[n.id]?.score
        })),
        edges: filteredLinks.map(l => ({
          source: l.source,
          target: l.target,
          type: l.type
        }))
      }

      setGraphData(transformedData)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = async (roleId) => {
    setSelectedRole(roleId)
    setLoading(true)
    setError(null)
    setViewMode('role')

    try {
      // Use mock data if backend is unavailable
      if (USE_MOCK_DATA) {
        const mockGraphData = knowledgeGraphService.buildGraphData(null, roleId)

        // Transform data to match component expectations
        const transformedData = {
          nodes: mockGraphData.nodes.map(n => ({
            id: n.id,
            label: n.name,
            type: n.category === 'role' ? 'role' : 'competency',
            category: n.category,
            description: `${n.name} - Level ${n.level}`,
            level: n.level
          })),
          edges: mockGraphData.links.map(l => ({
            source: l.source,
            target: l.target,
            type: l.type
          }))
        }

        setGraphData(transformedData)
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/api/graph/roles/${roleId}/graph`)
      if (response.data.success) {
        setGraphData(response.data.graph)
      } else {
        setError('Failed to load role graph')
      }
    } catch (err) {
      console.error('Error loading role graph:', err)
      // Fallback to mock data
      const mockGraphData = knowledgeGraphService.buildGraphData(null, roleId)

      const transformedData = {
        nodes: mockGraphData.nodes.map(n => ({
          id: n.id,
          label: n.name,
          type: n.category === 'role' ? 'role' : 'competency',
          category: n.category,
          description: `${n.name} - Level ${n.level}`,
          level: n.level
        })),
        edges: mockGraphData.links.map(l => ({
          source: l.source,
          target: l.target,
          type: l.type
        }))
      }

      setGraphData(transformedData)
    } finally {
      setLoading(false)
    }
  }

  const handleShowPathToRole = async () => {
    if (!selectedRole) {
      alert('Please select a role first')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/graph/path-to-role`, {
        role_id: selectedRole,
        user_competencies: userCompetencies
      })

      if (response.data.success) {
        const pathData = response.data.path

        // Update graph with path data
        setGraphData(pathData.graph_data)

        // Highlight nodes and edges in the learning path
        const gapCompetencyIds = pathData.gaps.map(g => g.competency_id)
        setHighlightedNodes(gapCompetencyIds)

        // Build highlighted path from prerequisites
        const pathEdges = []
        pathData.gaps.forEach((gap, index) => {
          if (index < pathData.gaps.length - 1) {
            pathEdges.push({
              source: gap.competency_id,
              target: pathData.gaps[index + 1].competency_id
            })
          }
        })
        setHighlightedPath(pathEdges)
        setShowPathToRole(true)
      }
    } catch (err) {
      console.error('Error finding path to role:', err)
      alert('Failed to find path to role')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)

    if (!term || !graphData) {
      setHighlightedNodes([])
      return
    }

    // Find matching nodes
    const matches = graphData.nodes.filter(node =>
      node.label.toLowerCase().includes(term.toLowerCase()) ||
      node.description?.toLowerCase().includes(term.toLowerCase())
    )

    setHighlightedNodes(matches.map(n => n.id))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Graph</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Explore competency relationships and learning paths
              </p>
            </div>

            {/* View Mode Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange('full')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'full'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Full Graph
              </button>
              <button
                onClick={() => handleViewModeChange('category')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'category'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => handleViewModeChange('role')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'role'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Career Paths
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Search</h3>
              </div>
              <input
                type="text"
                placeholder="Search competencies..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {viewMode === 'category' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
                </div>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Role Selector */}
            {viewMode === 'role' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Target Role</h3>
                </div>
                <select
                  value={selectedRole || ''}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {selectedRole && (
                  <button
                    onClick={handleShowPathToRole}
                    className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Show My Learning Path
                  </button>
                )}
              </div>
            )}

            {/* Path Information */}
            {showPathToRole && graphData && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg shadow-sm p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Learning Path</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Highlighted nodes show the competencies you need to develop
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Gaps to fill:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{highlightedNodes.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            {graphData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Graph Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Competencies:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {graphData.nodes?.filter(n => n.type === 'competency').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Relationships:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{graphData.edges?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Career Roles:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {graphData.nodes?.filter(n => n.type === 'role').length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" style={{ height: '700px' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading knowledge graph...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-600 dark:text-red-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>{error}</p>
                    <button
                      onClick={loadFullGraph}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : graphData ? (
                <KnowledgeGraph
                  graphData={graphData}
                  onNodeClick={handleNodeClick}
                  highlightedNodes={highlightedNodes}
                  highlightedPath={highlightedPath}
                  centerNode={selectedNode?.id}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">No graph data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeGraphPage
