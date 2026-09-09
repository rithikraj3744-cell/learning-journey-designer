import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources } from '../services/firestore';
import {
  Search,
  Filter,
  X,
  Video,
  GraduationCap,
  FileText,
  Book,
  Lightbulb,
  Star,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  BookOpen
} from 'lucide-react';

const Resources = () => {
  const navigate = useNavigate();
  const [resourceList, setResourceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    platform: '',
    type: '',
    difficulty: '',
    sortBy: 'rating'
  });

  // Mock data for fallback
  const mockResources = [
    {
      id: 'react-basics',
      title: 'React - The Complete Guide',
      description: 'Learn React from scratch with hands-on projects and real-world examples. Master components, hooks, routing, and state management.',
      provider: 'Maximilian Schwarzmüller',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '47 hours',
      url: 'https://www.udemy.com/course/react-the-complete-guide/',
      rating: 4.6,
      reviewCount: 215000,
      competencies: ['React', 'JavaScript', 'Web Development'],
      price: 'Paid'
    },
    {
      id: 'aws-cloud',
      title: 'AWS Certified Cloud Practitioner Course',
      description: 'Complete AWS Cloud computing course. Learn cloud fundamentals, AWS services, and prepare for the certification exam.',
      provider: 'Andrew Brown',
      platform: 'YouTube',
      type: 'Video',
      difficulty: 'Beginner',
      duration: '12.5 hours',
      url: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
      rating: 4.8,
      reviewCount: 45000,
      competencies: ['AWS', 'Cloud Computing'],
      price: 'Free'
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning Specialization',
      description: 'Andrew Ng\'s Deep Learning course Guide led free. Master neural networks, CNN, RNN, and more with hands-on projects.',
      provider: 'Andrew Ng',
      platform: 'Coursera',
      type: 'Course',
      difficulty: 'Advanced',
      duration: '3 months',
      url: 'https://www.coursera.org/specializations/deep-learning',
      rating: 4.9,
      reviewCount: 180000,
      competencies: ['Deep Learning', 'Neural Networks'],
      price: 'Subscription'
    },
    {
      id: 'kubernetes-tutorial',
      title: 'Kubernetes Course - Full Beginners Tutorial',
      description: 'Learn Kubernetes container orchestration from scratch. Deploy and manage containerized applications.',
      provider: 'TechWorld with Nana',
      platform: 'YouTube',
      type: 'Video',
      difficulty: 'Intermediate',
      duration: '4 hours',
      url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
      rating: 4.7,
      reviewCount: 35000,
      competencies: ['Kubernetes', 'DevOps'],
      price: 'Free'
    },
    {
      id: 'mit-intro-cs',
      title: 'MIT Introduction to Computer Science',
      description: 'MIT\'s introductory computer science course. Learn programming fundamentals with Python.',
      provider: 'MIT',
      platform: 'edX',
      type: 'Course',
      difficulty: 'Beginner',
      duration: '9 weeks',
      url: 'https://www.edx.org/course/introduction-to-computer-science',
      rating: 4.6,
      reviewCount: 95000,
      competencies: ['Python', 'Computer Science'],
      price: 'Free'
    },
    {
      id: 'project-management',
      title: 'Project Management Professional',
      description: 'Complete PMP certification preparation course. Learn project management methodologies and best practices.',
      provider: 'PMI',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Advanced',
      duration: '35 hours',
      url: 'https://www.udemy.com/course/pmp-certification/',
      rating: 4.5,
      reviewCount: 28000,
      competencies: ['Project Management', 'Leadership'],
      price: 'Paid'
    },
    {
      id: 'agile-scrum',
      title: 'Agile & Scrum Tutorial',
      description: 'Master Agile methodologies and Scrum framework. Learn sprint planning, daily standups, and retrospectives.',
      provider: 'Simplilearn',
      platform: 'YouTube',
      type: 'Tutorial',
      difficulty: 'Beginner',
      duration: '3 hours',
      url: 'https://www.youtube.com/watch?v=9TycLR0TqFA',
      rating: 4.4,
      reviewCount: 18000,
      competencies: ['Agile', 'Scrum'],
      price: 'Free'
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing Course',
      description: 'Complete digital marketing training covering SEO, social media, email marketing, and analytics.',
      provider: 'Neil Patel',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '20 hours',
      url: 'https://www.udemy.com/course/digital-marketing/',
      rating: 4.3,
      reviewCount: 42000,
      competencies: ['Digital Marketing', 'SEO'],
      price: 'Paid'
    },
    {
      id: 'python-data-science',
      title: 'Python for Data Science',
      description: 'Learn Python programming for data science. Master pandas, NumPy, Matplotlib, and machine learning basics.',
      provider: 'Jose Portilla',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '25 hours',
      url: 'https://www.udemy.com/course/python-for-data-science/',
      rating: 4.6,
      reviewCount: 125000,
      competencies: ['Python', 'Data Science'],
      price: 'Paid'
    },
    {
      id: 'web-dev-bootcamp',
      title: 'The Web Developer Bootcamp',
      description: 'Full-stack web development course. Learn HTML, CSS, JavaScript, Node.js, and database management.',
      provider: 'Colt Steele',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Beginner',
      duration: '63 hours',
      url: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
      rating: 4.7,
      reviewCount: 268000,
      competencies: ['Web Development', 'Full Stack'],
      price: 'Paid'
    },
    {
      id: 'machine-learning-andrew',
      title: 'Machine Learning',
      description: 'Andrew Ng\'s famous machine learning course. Learn ML algorithms, neural networks, and practical applications.',
      provider: 'Andrew Ng',
      platform: 'Coursera',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '11 weeks',
      url: 'https://www.coursera.org/learn/machine-learning',
      rating: 4.9,
      reviewCount: 185000,
      competencies: ['Machine Learning', 'AI'],
      price: 'Free'
    },
    {
      id: 'docker-kubernetes',
      title: 'Docker and Kubernetes Complete Guide',
      description: 'Master Docker and Kubernetes from scratch. Build, deploy, and scale containerized applications.',
      provider: 'Stephen Grider',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '22 hours',
      url: 'https://www.udemy.com/course/docker-and-kubernetes/',
      rating: 4.6,
      reviewCount: 72000,
      competencies: ['Docker', 'Kubernetes', 'DevOps'],
      price: 'Paid'
    }
  ];

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data directly instead of Firestore
      // This ensures the page always has data to display
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
      setResourceList(mockResources);
      console.log(`✓ Loaded ${mockResources.length} resources`);
    } catch (err) {
      console.error('Error loading resources:', err);
      setResourceList(mockResources);
    } finally {
      setLoading(false);
    }
  };

  const platforms = useMemo(() =>
    [...new Set(resourceList.map(r => r.platform || r.provider).filter(Boolean))],
    [resourceList]
  );

  const types = useMemo(() =>
    [...new Set(resourceList.map(r => r.type).filter(Boolean))],
    [resourceList]
  );

  const filteredResources = useMemo(() => {
    let result = [...resourceList];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(res =>
        res.title?.toLowerCase().includes(query) ||
        res.description?.toLowerCase().includes(query) ||
        res.provider?.toLowerCase().includes(query) ||
        res.platform?.toLowerCase().includes(query)
      );
    }

    if (filters.platform) {
      result = result.filter(res =>
        res.platform === filters.platform || res.provider === filters.platform
      );
    }

    if (filters.type) {
      result = result.filter(res => res.type === filters.type);
    }

    if (filters.difficulty) {
      result = result.filter(res => res.difficulty === filters.difficulty);
    }

    if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'duration') {
      result.sort((a, b) => {
        const getDuration = (d) => parseInt(d?.match(/\d+/)?.[0] || 0);
        return getDuration(a.duration) - getDuration(b.duration);
      });
    } else if (filters.sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (filters.sortBy === 'popular') {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return result;
  }, [resourceList, filters]);

  const hasActiveFilters = filters.search || filters.platform || filters.type || filters.difficulty;

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      platform: '',
      type: '',
      difficulty: '',
      sortBy: 'rating'
    });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'course': return GraduationCap;
      case 'article': return FileText;
      case 'book': return Book;
      case 'tutorial': return Lightbulb;
      default: return Book;
    }
  };

  const getDifficultyColor = (difficulty) => {
    const normalizedDifficulty = difficulty?.toLowerCase();
    switch (normalizedDifficulty) {
      case 'beginner':
        return 'bg-green-500 text-white';
      case 'intermediate':
        return 'bg-blue-500 text-white';
      case 'advanced':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriceColor = (price) => {
    const normalizedPrice = price?.toLowerCase();
    switch (normalizedPrice) {
      case 'free':
        return 'bg-green-500 text-white';
      case 'paid':
        return 'bg-red-500 text-white';
      case 'subscription':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPlatformColor = (platform) => {
    const normalizedPlatform = platform?.toLowerCase();
    switch (normalizedPlatform) {
      case 'youtube':
        return 'bg-red-500 text-white';
      case 'udemy':
        return 'bg-purple-600 text-white';
      case 'coursera':
        return 'bg-blue-600 text-white';
      case 'edx':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Resource Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our curated collection of learning resources
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => updateFilter('platform', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Platforms</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {types.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty */}
            <div>
              <select
                value={filters.difficulty}
                onChange={(e) => updateFilter('difficulty', e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="duration">Duration</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredResources.length} of {resourceList.length} resources
        </p>
      </div>

      {/* Resource Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            return (
              <div
                key={resource.id}
                className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Card Header with Platform Badge */}
                <div className="relative p-4 pb-2">
                  <div className="absolute top-3 right-3">
                    <ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
                  </div>
                  <div className="flex items-start gap-2 mb-3">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getPlatformColor(resource.platform)}`}>
                      {resource.platform}
                    </span>
                    {resource.price && (
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getPriceColor(resource.price)}`}>
                        {resource.price}
                      </span>
                    )}
                  </div>

                  {/* Type Badge */}
                  <div className="mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{resource.type}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {resource.title}
                  </h3>

                  {/* Provider */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {resource.provider}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-500 text-white flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resource.duration}
                    </span>
                  </div>

                  {/* Rating */}
                  {resource.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(resource.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-600 text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-900 dark:text-white font-bold">{resource.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Competencies */}
                  {resource.competencies && resource.competencies.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      Covers {resource.competencies.length} competenc{resource.competencies.length === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </div>

                {/* View Details Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => navigate(`/resources/${resource.id}`)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No resources found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;
