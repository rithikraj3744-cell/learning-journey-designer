import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid3x3,
  List,
  SlidersHorizontal,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  Code,
  BarChart2,
  Briefcase,
  Palette,
  Target
} from 'lucide-react';
import CompetencyDetailModal from '../components/CompetencyDetailModal';
import CompetencyCard from '../components/CompetencyCard';
import CompetencyListItem from '../components/CompetencyListItem';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { competencyList, categories as dataCategories } from '../data';

const CompetencyExplorer = () => {
  // View and UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCompetency, setSelectedCompetency] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'difficulty', 'time'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Data state
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: 'software-dev', name: 'Software Development', icon: Code, color: 'blue' },
    { id: 'data-science', name: 'Data Science', icon: BarChart2, color: 'purple' },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'green' },
    { id: 'design', name: 'Design', icon: Palette, color: 'pink' },
    { id: 'domain-skills', name: 'Domain Skills', icon: Target, color: 'orange' }
  ];

  const difficulties = [
    { level: 1, label: 'Beginner', color: 'green' },
    { level: 2, label: 'Basic', color: 'blue' },
    { level: 3, label: 'Intermediate', color: 'yellow' },
    { level: 4, label: 'Advanced', color: 'orange' },
    { level: 5, label: 'Expert', color: 'red' }
  ];

  // Load competencies from data
  useEffect(() => {
    fetchCompetencies();
  }, []);

  const fetchCompetencies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate a small delay for smoother UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load real data from JSON
      setCompetencies(competencyList);
      setHasMore(false); // No pagination needed with all data loaded

    } catch (err) {
      setError('Failed to load competencies. Please try again.');
      console.error('Error fetching competencies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort competencies
  const filteredAndSortedCompetencies = useMemo(() => {
    let result = [...competencies];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(comp =>
        comp.name.toLowerCase().includes(query) ||
        comp.description.toLowerCase().includes(query) ||
        comp.keywords.some(k => k.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(comp => selectedCategories.includes(comp.category));
    }

    // Apply difficulty filter
    if (selectedDifficulties.length > 0) {
      result = result.filter(comp => selectedDifficulties.includes(comp.difficulty));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'difficulty':
          comparison = a.difficulty - b.difficulty;
          break;
        case 'time':
          comparison = a.estimatedHours - b.estimatedHours;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [competencies, searchQuery, selectedCategories, selectedDifficulties, sortBy, sortOrder]);

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle difficulty selection
  const toggleDifficulty = (level) => {
    setSelectedDifficulties(prev =>
      prev.includes(level)
        ? prev.filter(d => d !== level)
        : [...prev, level]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedDifficulties.length > 0;

  // Handle competency click
  const handleCompetencyClick = (competency) => {
    // Navigate to detail page instead of modal
    window.location.href = `/competencies/${competency.id}`;
  };

  // Load more competencies
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Competency Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and discover competencies to build your learning journey
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search competencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="difficulty-asc">Difficulty (Low-High)</option>
                <option value="difficulty-desc">Difficulty (High-Low)</option>
                <option value="time-asc">Time (Low-High)</option>
                <option value="time-desc">Time (High-Low)</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 dark:border-gray-600 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  showFilters
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                    {(selectedCategories.length + selectedDifficulties.length + (searchQuery ? 1 : 0))}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Category
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <IconComponent className={`h-4 w-4 text-${category.color}-600 dark:text-${category.color}-400`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {category.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Difficulty Level
                  </h3>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
                      <label
                        key={difficulty.level}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDifficulties.includes(difficulty.level)}
                          onChange={() => toggleDifficulty(difficulty.level)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={`flex-1 text-sm px-2 py-1 rounded ${
                          selectedDifficulties.includes(difficulty.level)
                            ? `bg-${difficulty.color}-100 dark:bg-${difficulty.color}-900/20 text-${difficulty.color}-700 dark:text-${difficulty.color}-300`
                            : 'text-gray-700 dark:text-gray-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-700'
                        }`}>
                          {difficulty.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Active filters:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(catId => {
                        const cat = categories.find(c => c.id === catId);
                        const IconComponent = cat?.icon;
                        return (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                          >
                            {IconComponent && <IconComponent className="h-3 w-3" />}
                            {cat?.name}
                            <button
                              onClick={() => toggleCategory(catId)}
                              className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                      {selectedDifficulties.map(level => {
                        const diff = difficulties.find(d => d.level === level);
                        return (
                          <span
                            key={level}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                          >
                            {diff?.label}
                            <button
                              onClick={() => toggleDifficulty(level)}
                              className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading && page === 1 ? (
                  'Loading...'
                ) : (
                  <>
                    Showing <span className="font-medium">{filteredAndSortedCompetencies.length}</span> competencies
                  </>
                )}
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => {
                    setPage(1);
                    fetchCompetencies();
                  }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && page === 1 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} type={viewMode} />
                ))}
              </div>
            )}

            {/* Competency Grid/List */}
            {!loading || page > 1 ? (
              <>
                {filteredAndSortedCompetencies.length > 0 ? (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedCompetencies.map((competency) => (
                          <CompetencyCard
                            key={competency.id}
                            competency={competency}
                            onClick={() => handleCompetencyClick(competency)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAndSortedCompetencies.map((competency) => (
                          <CompetencyListItem
                            key={competency.id}
                            competency={competency}
                            onClick={() => handleCompetencyClick(competency)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && !loading && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={loadMore}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Load More
                        </button>
                      </div>
                    )}

                    {/* Loading More Indicator */}
                    {loading && page > 1 && (
                      <div className="mt-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Loading more competencies...
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No competencies found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try adjusting your filters or search query
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </main>
        </div>
      </div>

      {/* Competency Detail Modal */}
      {showModal && selectedCompetency && (
        <CompetencyDetailModal
          competency={selectedCompetency}
          onClose={() => {
            setShowModal(false);
            setSelectedCompetency(null);
          }}
        />
      )}
    </div>
  );
};

export default CompetencyExplorer;
