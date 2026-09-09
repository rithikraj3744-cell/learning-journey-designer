import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceDetail } from '../services/api';
import {
  ArrowLeft,
  Clock,
  Star,
  ExternalLink,
  Bookmark,
  Play,
  CheckCircle,
  Video,
  GraduationCap,
  FileText,
  Book,
  Lightbulb
} from 'lucide-react';
import AISummaryCard from '../components/AISummaryCard';

const ResourceDetail = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLearning, setIsLearning] = useState(false);

  // Mock data for fallback
  const mockResources = {
    'react-basics': {
      id: 'react-basics',
      title: 'React - The Complete Guide',
      description: 'Learn React from scratch with hands-on projects and real-world examples. Master components, hooks, routing, and state management. This comprehensive course covers everything you need to become a proficient React developer.',
      provider: 'Maximilian Schwarzmüller',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '47 hours',
      url: 'https://www.udemy.com/course/react-the-complete-guide/',
      rating: 4.6,
      reviewCount: 215000,
      competencies: ['React', 'JavaScript', 'Web Development', 'Frontend'],
      price: 'Paid'
    },
    'aws-cloud': {
      id: 'aws-cloud',
      title: 'AWS Certified Cloud Practitioner Course',
      description: 'Complete AWS Cloud computing course. Learn cloud fundamentals, AWS services, and prepare for the certification exam. This comprehensive guide covers EC2, S3, Lambda, RDS, and more. Perfect for beginners looking to start their cloud journey.',
      provider: 'Andrew Brown',
      platform: 'YouTube',
      type: 'Video',
      difficulty: 'Beginner',
      duration: '12.5 hours',
      url: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
      rating: 4.8,
      reviewCount: 45000,
      competencies: ['AWS', 'Cloud Computing', 'DevOps', 'Infrastructure'],
      price: 'Free'
    },
    'deep-learning': {
      id: 'deep-learning',
      title: 'Deep Learning Specialization',
      description: 'Andrew Ng\'s Deep Learning course Guide led free. Master neural networks, CNN, RNN, and more with hands-on projects. Learn the foundations of deep learning and build your own neural networks from scratch.',
      provider: 'Andrew Ng',
      platform: 'Coursera',
      type: 'Course',
      difficulty: 'Advanced',
      duration: '3 months',
      url: 'https://www.coursera.org/specializations/deep-learning',
      rating: 4.9,
      reviewCount: 180000,
      competencies: ['Deep Learning', 'Neural Networks', 'AI', 'Python'],
      price: 'Subscription'
    },
    'kubernetes-tutorial': {
      id: 'kubernetes-tutorial',
      title: 'Kubernetes Course - Full Beginners Tutorial',
      description: 'Learn Kubernetes container orchestration from scratch. Deploy and manage containerized applications in production. Master pods, services, deployments, and more.',
      provider: 'TechWorld with Nana',
      platform: 'YouTube',
      type: 'Video',
      difficulty: 'Intermediate',
      duration: '4 hours',
      url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
      rating: 4.7,
      reviewCount: 35000,
      competencies: ['Kubernetes', 'DevOps', 'Docker', 'Cloud'],
      price: 'Free'
    },
    'mit-intro-cs': {
      id: 'mit-intro-cs',
      title: 'MIT Introduction to Computer Science',
      description: 'MIT\'s introductory computer science course. Learn programming fundamentals with Python. Cover algorithms, data structures, and computational thinking.',
      provider: 'MIT',
      platform: 'edX',
      type: 'Course',
      difficulty: 'Beginner',
      duration: '9 weeks',
      url: 'https://www.edx.org/course/introduction-to-computer-science',
      rating: 4.6,
      reviewCount: 95000,
      competencies: ['Python', 'Computer Science', 'Programming', 'Algorithms'],
      price: 'Free'
    },
    'project-management': {
      id: 'project-management',
      title: 'Project Management Professional',
      description: 'Complete PMP certification preparation course. Learn project management methodologies and best practices. Master planning, execution, monitoring, and closing projects.',
      provider: 'PMI',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Advanced',
      duration: '35 hours',
      url: 'https://www.udemy.com/course/pmp-certification/',
      rating: 4.5,
      reviewCount: 28000,
      competencies: ['Project Management', 'Leadership', 'Agile', 'Planning'],
      price: 'Paid'
    },
    'agile-scrum': {
      id: 'agile-scrum',
      title: 'Agile & Scrum Tutorial',
      description: 'Master Agile methodologies and Scrum framework. Learn sprint planning, daily standups, and retrospectives. Perfect for teams transitioning to Agile.',
      provider: 'Simplilearn',
      platform: 'YouTube',
      type: 'Tutorial',
      difficulty: 'Beginner',
      duration: '3 hours',
      url: 'https://www.youtube.com/watch?v=9TycLR0TqFA',
      rating: 4.4,
      reviewCount: 18000,
      competencies: ['Agile', 'Scrum', 'Project Management', 'Team Collaboration'],
      price: 'Free'
    },
    'digital-marketing': {
      id: 'digital-marketing',
      title: 'Digital Marketing Course',
      description: 'Complete digital marketing training covering SEO, social media, email marketing, and analytics. Learn to build and execute effective digital marketing campaigns.',
      provider: 'Neil Patel',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '20 hours',
      url: 'https://www.udemy.com/course/digital-marketing/',
      rating: 4.3,
      reviewCount: 42000,
      competencies: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
      price: 'Paid'
    },
    'python-data-science': {
      id: 'python-data-science',
      title: 'Python for Data Science',
      description: 'Learn Python programming for data science. Master pandas, NumPy, Matplotlib, and machine learning basics. Hands-on projects with real-world datasets.',
      provider: 'Jose Portilla',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '25 hours',
      url: 'https://www.udemy.com/course/python-for-data-science/',
      rating: 4.6,
      reviewCount: 125000,
      competencies: ['Python', 'Data Science', 'Machine Learning', 'Analytics'],
      price: 'Paid'
    },
    'web-dev-bootcamp': {
      id: 'web-dev-bootcamp',
      title: 'The Web Developer Bootcamp',
      description: 'Full-stack web development course. Learn HTML, CSS, JavaScript, Node.js, and database management. Build real-world projects from scratch.',
      provider: 'Colt Steele',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Beginner',
      duration: '63 hours',
      url: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
      rating: 4.7,
      reviewCount: 268000,
      competencies: ['Web Development', 'Full Stack', 'JavaScript', 'Node.js'],
      price: 'Paid'
    },
    'machine-learning-andrew': {
      id: 'machine-learning-andrew',
      title: 'Machine Learning',
      description: 'Andrew Ng\'s famous machine learning course. Learn ML algorithms, neural networks, and practical applications. One of the most popular ML courses worldwide.',
      provider: 'Andrew Ng',
      platform: 'Coursera',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '11 weeks',
      url: 'https://www.coursera.org/learn/machine-learning',
      rating: 4.9,
      reviewCount: 185000,
      competencies: ['Machine Learning', 'AI', 'Python', 'Algorithms'],
      price: 'Free'
    },
    'docker-kubernetes': {
      id: 'docker-kubernetes',
      title: 'Docker and Kubernetes Complete Guide',
      description: 'Master Docker and Kubernetes from scratch. Build, deploy, and scale containerized applications. Learn best practices for production environments.',
      provider: 'Stephen Grider',
      platform: 'Udemy',
      type: 'Course',
      difficulty: 'Intermediate',
      duration: '22 hours',
      url: 'https://www.udemy.com/course/docker-and-kubernetes/',
      rating: 4.6,
      reviewCount: 72000,
      competencies: ['Docker', 'Kubernetes', 'DevOps', 'Cloud'],
      price: 'Paid'
    }
  };

  useEffect(() => {
    loadResource();
    loadResourceStatus();
  }, [resourceId]);

  const loadResourceStatus = () => {
    // Load resource status from localStorage
    const library = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    const completed = JSON.parse(localStorage.getItem('completedResources') || '[]');
    const learning = JSON.parse(localStorage.getItem('learningResources') || '[]');

    setIsInLibrary(library.includes(resourceId));
    setIsCompleted(completed.includes(resourceId));
    setIsLearning(learning.includes(resourceId));
  };

  const handleStartLearning = () => {
    const learning = JSON.parse(localStorage.getItem('learningResources') || '[]');
    if (!learning.includes(resourceId)) {
      learning.push(resourceId);
      localStorage.setItem('learningResources', JSON.stringify(learning));
      setIsLearning(true);

      // Also add to library
      handleAddToLibrary();

      // Show success message
      alert('Started learning! Resource added to your learning list.');
    } else {
      alert('You are already learning this resource.');
    }
  };

  const handleAddToLibrary = () => {
    const library = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    if (!library.includes(resourceId)) {
      library.push(resourceId);
      localStorage.setItem('myLibrary', JSON.stringify(library));
      setIsInLibrary(true);
      alert('Added to your library!');
    } else {
      alert('Already in your library.');
    }
  };

  const handleMarkComplete = () => {
    const completed = JSON.parse(localStorage.getItem('completedResources') || '[]');
    if (!completed.includes(resourceId)) {
      completed.push(resourceId);
      localStorage.setItem('completedResources', JSON.stringify(completed));
      setIsCompleted(true);

      // Remove from learning list
      const learning = JSON.parse(localStorage.getItem('learningResources') || '[]');
      const updatedLearning = learning.filter(id => id !== resourceId);
      localStorage.setItem('learningResources', JSON.stringify(updatedLearning));
      setIsLearning(false);

      alert('Congratulations! Resource marked as completed.');
    } else {
      alert('Already marked as completed.');
    }
  };

  const loadResource = async () => {
    try {
      const response = await getResourceDetail(resourceId);
      if (response.success && response.resource) {
        setResource(response.resource);
      } else {
        // Try mock data
        const mockResource = mockResources[resourceId];
        if (mockResource) {
          console.log('⚠️ Using mock data for resource:', resourceId);
          setResource(mockResource);
        } else {
          setResource(null);
        }
      }
    } catch (error) {
      console.error('Error loading resource:', error);
      // Fallback to mock data
      const mockResource = mockResources[resourceId];
      if (mockResource) {
        console.log('⚠️ API error, using mock data for resource:', resourceId);
        setResource(mockResource);
      } else {
        setResource(null);
      }
    } finally {
      setLoading(false);
    }
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
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Resource not found
        </h2>
        <button
          onClick={() => navigate('/resources')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Resources
        </button>
      </div>
    );
  }

  const IconComponent = getResourceIcon(resource.type);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Resources
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <IconComponent className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resource.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  by {resource.provider}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">{resource.rating}</span>
                    <span>({resource.reviewCount} reviews)</span>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-xs capitalize">
                    {resource.type}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                About this resource
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {resource.description}
              </p>
            </div>

            {/* Competencies */}
            {resource.competencies && resource.competencies.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  What you'll learn
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resource.competencies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Summary Section - NEW! */}
          <div className="mb-6">
            <AISummaryCard
              resourceContent={resource.description + (resource.competencies ? ' Topics covered: ' + resource.competencies.join(', ') : '')}
              resourceTitle={resource.title}
              resourceType={resource.type}
            />
          </div>

          {/* Reviews Section - Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Reviews
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Reviews and ratings coming soon!
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>

            {/* Primary Action */}
            <button
              onClick={() => window.open(resource.url, '_blank')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3 font-medium"
            >
              <ExternalLink className="h-5 w-5" />
              Open Resource
            </button>

            {/* Secondary Actions */}
            <button
              onClick={handleStartLearning}
              disabled={isLearning || isCompleted}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-lg transition-colors mb-3 font-medium ${
                isLearning || isCompleted
                  ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <Play className="h-5 w-5" />
              {isLearning ? 'Currently Learning' : isCompleted ? 'Completed' : 'Start Learning'}
            </button>

            <button
              onClick={handleAddToLibrary}
              disabled={isInLibrary}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-lg transition-colors mb-3 font-medium ${
                isInLibrary
                  ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isInLibrary ? 'fill-current' : ''}`} />
              {isInLibrary ? 'In Library' : 'Add to Library'}
            </button>

            <button
              onClick={handleMarkComplete}
              disabled={isCompleted}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-lg transition-colors font-medium ${
                isCompleted
                  ? 'border-green-500 bg-green-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              {isCompleted ? 'Completed ✓' : 'Mark Complete'}
            </button>

            {/* Resource Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Resource Details
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Type:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium capitalize">{resource.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Duration:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{resource.duration}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Level:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium capitalize">{resource.difficulty}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Provider:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{resource.provider}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
