import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { competencyList } from '../data';
import {
  ArrowLeft,
  Youtube,
  FileText,
  CheckCircle,
  PlayCircle,
  Trophy,
  TrendingUp,
  BookOpen,
  Target,
  Sparkles,
  ExternalLink,
  Clock,
  Award
} from 'lucide-react';

const CompetencyLearningPage = () => {
  const { competencyId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [competency, setCompetency] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Map knowledge graph IDs to competency data IDs
  const mapKnowledgeGraphIdToCompetency = (graphId) => {
    // First, try exact match
    let comp = competencyList.find(c => c.id === graphId);
    if (comp) return comp;

    // Try matching by name (case-insensitive, with common variations)
    const normalizedGraphId = graphId.toLowerCase().replace(/-/g, ' ');

    comp = competencyList.find(c => {
      const normalizedName = c.name.toLowerCase();
      const normalizedKeywords = c.keywords?.map(k => k.toLowerCase()) || [];

      return normalizedName.includes(normalizedGraphId) ||
             normalizedGraphId.includes(normalizedName) ||
             normalizedKeywords.some(k => k.includes(normalizedGraphId) || normalizedGraphId.includes(k));
    });

    if (comp) return comp;

    // Manual mappings for common knowledge graph IDs
    const manualMappings = {
      'html-css': 'comp-007',
      'javascript': 'comp-002',
      'react': 'comp-003',
      'vue': 'comp-004',
      'angular': 'comp-005',
      'typescript': 'comp-006',
      'python': 'comp-001',
      'node': 'comp-010',
      'nodejs': 'comp-010',
      'express': 'comp-011',
      'sql': 'comp-012',
      'mongodb': 'comp-013',
      'databases': 'comp-012',
      'api-design': 'comp-014',
      'rest-api': 'comp-014',
      'graphql': 'comp-015',
      'git': 'comp-016',
      'docker': 'comp-017',
      'kubernetes': 'comp-018',
      'aws': 'comp-019',
      'ui-ux': 'comp-020',
      'responsive-design': 'comp-021'
    };

    const mappedId = manualMappings[graphId.toLowerCase()];
    if (mappedId) {
      return competencyList.find(c => c.id === mappedId);
    }

    return null;
  };

  useEffect(() => {
    loadCompetencyAndProgress();
  }, [competencyId, currentUser]);

  const loadCompetencyAndProgress = async () => {
    try {
      setLoading(true);

      // Map knowledge graph ID to actual competency
      const comp = mapKnowledgeGraphIdToCompetency(competencyId);
      if (!comp) {
        console.error('Competency not found for ID:', competencyId);
        setLoading(false);
        return;
      }
      setCompetency(comp);

      // Load user's learning progress for this competency
      if (auth.currentUser) {
        const progressRef = doc(
          db,
          'users',
          auth.currentUser.uid,
          'competencyProgress',
          comp.id // Use the mapped competency ID
        );
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
          setLearningProgress(progressDoc.data());
          setResources(progressDoc.data().resources || []);
        } else {
          // First time learning this competency - generate resources
          await generateLearningResources(comp);
        }
      } else {
        // Not logged in - still generate resources for viewing
        await generateLearningResources(comp);
      }
    } catch (error) {
      console.error('Error loading competency:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningResources = async (comp) => {
    console.log('Generating resources for:', comp.name, comp.id);
    // Generate YouTube resources based on competency with better search URLs
    const youtubeResources = [
      {
        id: '1',
        type: 'video',
        title: `${comp.name} - Complete Tutorial for Beginners`,
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(comp.name + ' complete tutorial 2024')}`,
        duration: '2-4 hours',
        difficulty: comp.difficulty,
        completed: false,
        description: `Comprehensive introduction to ${comp.name}`
      },
      {
        id: '2',
        type: 'video',
        title: `${comp.name} - Crash Course`,
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(comp.name + ' crash course')}`,
        duration: '30-60 min',
        difficulty: comp.difficulty,
        completed: false,
        description: `Quick overview and essential concepts`
      },
      {
        id: '3',
        type: 'video',
        title: `${comp.name} - Best Practices & Tips`,
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(comp.name + ' best practices tips tricks')}`,
        duration: '20-40 min',
        difficulty: comp.difficulty,
        completed: false,
        description: `Learn industry best practices`
      },
      {
        id: '4',
        type: 'video',
        title: `${comp.name} - Real-World Projects`,
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(comp.name + ' project tutorial')}`,
        duration: '1-3 hours',
        difficulty: comp.difficulty,
        completed: false,
        description: `Build practical projects to solidify learning`
      },
      {
        id: '5',
        type: 'video',
        title: `${comp.name} - Advanced Concepts`,
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(comp.name + ' advanced tutorial')}`,
        duration: '45-90 min',
        difficulty: comp.difficulty,
        completed: false,
        description: `Deep dive into advanced topics`
      }
    ];

    console.log('Generated resources:', youtubeResources.length, 'resources');
    setResources(youtubeResources);

    // Save initial progress to Firestore only if user is authenticated
    if (auth.currentUser) {
      try {
        const progressData = {
          competencyId: comp.id,
          competencyName: comp.name,
          userId: auth.currentUser.uid,
          resources: youtubeResources,
          progress: 0,
          completedResources: 0,
          totalResources: youtubeResources.length,
          quizGenerated: false,
          quizScore: null,
          assessmentTaken: false,
          assessmentScore: null,
          startedAt: new Date(),
          lastAccessedAt: new Date(),
          status: 'learning'
        };

        const progressRef = doc(
          db,
          'users',
          auth.currentUser.uid,
          'competencyProgress',
          comp.id // Use the mapped competency ID
        );
        await setDoc(progressRef, progressData);
        setLearningProgress(progressData);
        console.log('Saved progress to Firestore');
      } catch (error) {
        console.error('Error saving progress to Firestore:', error);
        // Continue anyway - resources are already set
      }
    } else {
      console.log('Not authenticated - displaying resources without progress tracking');
    }
  };

  const markResourceComplete = async (resourceId) => {
    if (!auth.currentUser || !learningProgress || !competency) return;

    const updatedResources = resources.map(r =>
      r.id === resourceId ? { ...r, completed: true } : r
    );
    const completedCount = updatedResources.filter(r => r.completed).length;
    const progress = Math.round((completedCount / updatedResources.length) * 100);

    setResources(updatedResources);

    // Update Firestore
    const progressRef = doc(
      db,
      'users',
      auth.currentUser.uid,
      'competencyProgress',
      competency.id // Use the actual competency ID from data
    );
    await updateDoc(progressRef, {
      resources: updatedResources,
      completedResources: completedCount,
      progress: progress,
      lastAccessedAt: new Date()
    });

    setLearningProgress({
      ...learningProgress,
      resources: updatedResources,
      completedResources: completedCount,
      progress: progress
    });
  };

  const generateQuiz = async () => {
    setGeneratingQuiz(true);
    // Simulate quiz generation
    setTimeout(() => {
      navigate(`/competencies/${competencyId}/quiz`);
    }, 1000);
  };

  const takeAssessment = () => {
    navigate(`/assessment?competency=${competencyId}`);
  };

  const enhanceLearning = async () => {
    // Reset progress and generate new resources
    if (window.confirm('This will reset your current progress and generate new learning resources. Continue?')) {
      if (auth.currentUser && competency) {
        const progressRef = doc(
          db,
          'users',
          auth.currentUser.uid,
          'competencyProgress',
          competency.id
        );
        await updateDoc(progressRef, {
          status: 'enhancing',
          lastAccessedAt: new Date()
        });
      }
      await generateLearningResources(competency);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!competency) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600 dark:text-gray-400">Competency not found</p>
      </div>
    );
  }

  const isFirstTime = !learningProgress || learningProgress.progress === 0;
  const isInProgress = learningProgress && learningProgress.progress > 0 && learningProgress.progress < 100;
  const isCompleted = learningProgress && learningProgress.progress >= 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/knowledge-graph')}
            className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Knowledge Graph
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {competency.name}
              </h1>
              <p className="text-blue-100 mb-4">
                {competency.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {competency.category}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  Level {competency.difficulty}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {competency.estimatedHours}h
                </span>
              </div>
            </div>

            {/* Progress Circle */}
            {learningProgress && (
              <div className="flex flex-col items-center gap-2 bg-white/10 rounded-lg p-4">
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/20"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - learningProgress.progress / 100)}`}
                      className="text-white transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {learningProgress.progress}%
                    </span>
                  </div>
                </div>
                <span className="text-white text-sm font-medium">
                  {isCompleted ? '✓ Completed' : 'In Progress'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Status Banner */}
        {isCompleted && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                  Congratulations! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You've completed this competency learning path!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={enhanceLearning}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Enhance Learning
              </button>
              <button
                onClick={takeAssessment}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Trophy className="w-5 h-5" />
                Take Final Assessment
              </button>
            </div>
          </div>
        )}

        {isInProgress && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Keep Going! You're making great progress
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              {learningProgress.completedResources} of {learningProgress.totalResources} resources completed
            </p>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlayCircle className="w-5 h-5" />
              Continue Learning
            </button>
          </div>
        )}

        {/* Learning Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-600" />
            Learning Resources
          </h2>

          {resources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Loading resources...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
              <div
                key={resource.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  resource.completed
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {resource.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <PlayCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {resource.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 ml-9 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {resource.duration}
                      </span>
                      <span>{resource.platform}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      Watch
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {!resource.completed && (
                      <button
                        onClick={() => markResourceComplete(resource.id)}
                        className="px-4 py-2 border-2 border-green-600 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Quiz & Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generate Quiz */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Practice Quiz
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Test your understanding with a practice quiz
            </p>
            <button
              onClick={generateQuiz}
              disabled={generatingQuiz}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {generatingQuiz ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>

          {/* Take Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Final Assessment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete the assessment to validate your skills
            </p>
            <button
              onClick={takeAssessment}
              className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyLearningPage;
