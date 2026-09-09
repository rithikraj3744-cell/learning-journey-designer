import { useState, useMemo } from 'react';
import { competencyList, categories, getCompetenciesByCategory, searchCompetencies } from '../data';

const Competencies = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const filteredCompetencies = useMemo(() => {
    let result = competencyList;

    // Filter by category
    if (selectedCategory) {
      result = getCompetenciesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = searchCompetencies(searchQuery).filter(comp =>
        !selectedCategory || comp.category === selectedCategory
      );
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      result = result.filter(comp => comp.difficulty === parseInt(selectedDifficulty));
    }

    return result;
  }, [selectedCategory, searchQuery, selectedDifficulty]);

  const difficultyLabels = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  const difficultyColors = {
    1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    4: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    5: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-4">Competencies</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Browse and explore {competencyList.length} competencies across various domains.
      </p>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Category and Difficulty Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Difficulty Levels</option>
            {[1, 2, 3, 4, 5].map(level => (
              <option key={level} value={level}>
                Level {level} - {difficultyLabels[level]}
              </option>
            ))}
          </select>

          {(selectedCategory || searchQuery || selectedDifficulty) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setSelectedDifficulty('');
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Showing {filteredCompetencies.length} of {competencyList.length} competencies
      </p>

      {/* Competencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetencies.map(comp => (
          <div
            key={comp.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {comp.name}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {comp.subcategory}
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
              {comp.description}
            </p>

            <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[comp.difficulty]}`}>
                Level {comp.difficulty} - {difficultyLabels[comp.difficulty]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {comp.estimatedHours}h
              </span>
            </div>

            {comp.prerequisites.length > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Prerequisites: {comp.prerequisites.length}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mb-4">
              {comp.keywords.slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {keyword}
                </span>
              ))}
              {comp.keywords.length > 3 && (
                <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400">
                  +{comp.keywords.length - 3} more
                </span>
              )}
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Details
            </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCompetencies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No competencies found matching your filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              setSelectedDifficulty('');
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default Competencies
