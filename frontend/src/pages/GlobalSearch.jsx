import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, BookOpen, Target, TrendingUp, Clock } from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

const GlobalSearch = () => {
  const navigate = useNavigate()
  const location = window.location
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({
    competencies: [],
    resources: [],
    paths: []
  })
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadRecentSearches()
    // Check for query parameter
    const params = new URLSearchParams(location.search)
    const q = params.get('q')
    if (q) {
      setSearchQuery(q)
    }
  }, [location.search])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch()
    } else {
      setSearchResults({ competencies: [], resources: [], paths: [] })
    }
  }, [searchQuery])

  const loadRecentSearches = () => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const performSearch = async () => {
    setIsSearching(true)
    const query_lower = searchQuery.toLowerCase()

    try {
      // Search Competencies
      const competenciesRef = collection(db, 'competencies')
      const competenciesSnapshot = await getDocs(competenciesRef)
      const competencies = competenciesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(comp =>
          comp.name?.toLowerCase().includes(query_lower) ||
          comp.description?.toLowerCase().includes(query_lower) ||
          comp.category?.toLowerCase().includes(query_lower)
        )

      // Search Resources (from localStorage)
      const allResources = JSON.parse(localStorage.getItem('myLibrary') || '[]')
      const resources = allResources.filter(resource =>
        resource.title?.toLowerCase().includes(query_lower) ||
        resource.description?.toLowerCase().includes(query_lower) ||
        resource.type?.toLowerCase().includes(query_lower) ||
        resource.competencies?.some(c => c.toLowerCase().includes(query_lower))
      )

      // Search Learning Paths
      let paths = []
      if (auth.currentUser) {
        const pathsRef = collection(db, 'users', auth.currentUser.uid, 'learningPaths')
        const pathsSnapshot = await getDocs(pathsRef)
        paths = pathsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(path =>
            path.title?.toLowerCase().includes(query_lower) ||
            path.description?.toLowerCase().includes(query_lower)
          )
      }

      setSearchResults({ competencies, resources, paths })

      if (searchQuery.length >= 3) {
        saveRecentSearch(searchQuery)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleSelectSearch = (query) => {
    setSearchQuery(query)
  }

  const filteredResults = () => {
    if (activeFilter === 'all') {
      return searchResults
    }
    return {
      competencies: activeFilter === 'competencies' ? searchResults.competencies : [],
      resources: activeFilter === 'resources' ? searchResults.resources : [],
      paths: activeFilter === 'paths' ? searchResults.paths : []
    }
  }

  const results = filteredResults()
  const totalResults = results.competencies.length + results.resources.length + results.paths.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Search className="w-8 h-8" />
                Search
              </h1>
              <p className="text-indigo-100">
                Find competencies, resources, and learning paths
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for competencies, resources, paths..."
              className="w-full px-6 py-4 pl-14 pr-14 text-lg rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
              autoFocus
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-indigo-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Results ({totalResults})
            </button>
            <button
              onClick={() => setActiveFilter('competencies')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'competencies'
                  ? 'bg-white text-indigo-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Competencies ({searchResults.competencies.length})
            </button>
            <button
              onClick={() => setActiveFilter('resources')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'resources'
                  ? 'bg-white text-indigo-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Resources ({searchResults.resources.length})
            </button>
            <button
              onClick={() => setActiveFilter('paths')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'paths'
                  ? 'bg-white text-indigo-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Paths ({searchResults.paths.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Searches
              </h2>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSearch(search)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <>
            {isSearching ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Searching...</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search query or filters
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Competencies */}
                {results.competencies.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6 text-blue-600" />
                      Competencies ({results.competencies.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.competencies.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => navigate(`/competencies/${comp.id}`)}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{comp.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {comp.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                              {comp.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {comp.difficulty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {results.resources.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-green-600" />
                      Resources ({results.resources.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.resources.map((resource, index) => (
                        <div
                          key={index}
                          onClick={() => window.open(resource.url, '_blank')}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                              {resource.type}
                            </span>
                            {resource.rating && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                ⭐ {resource.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Paths */}
                {results.paths.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                      Learning Paths ({results.paths.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.paths.map(path => (
                        <div
                          key={path.id}
                          onClick={() => navigate(`/my-paths/${path.id}`)}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{path.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {path.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">
                              {path.status || 'Active'}
                            </span>
                            {path.progress !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {Math.round(path.progress)}% complete
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!searchQuery && recentSearches.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start Searching
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Search across all competencies, resources, and learning paths to find what you need
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalSearch
