import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  ExternalLink,
  TrendingUp,
  Video,
  GraduationCap,
  FileText,
  Book,
  Lightbulb,
  Zap,
  BookOpen
} from 'lucide-react';

const LearningPathView = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedCompetencies, setCompletedCompetencies] = useState([]);

  useEffect(() => {
    loadPath();
  }, [pathId]);

  const loadPath = async () => {
    try {
      if (!auth.currentUser) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      console.log('Loading path from Firestore:', pathId);

      // Load path from Firestore
      const pathRef = doc(db, 'users', auth.currentUser.uid, 'learningPaths', pathId);
      const pathDoc = await getDoc(pathRef);

      if (pathDoc.exists()) {
        const pathData = {
          id: pathDoc.id,
          ...pathDoc.data(),
          createdAt: pathDoc.data().createdAt?.toDate(),
          targetDate: pathDoc.data().targetDate?.toDate()
        };

        console.log('Path loaded:', pathData);
        setPath(pathData);
        setCompletedCompetencies(pathData.completedCompetencies || []);
      } else {
        console.log('Path not found in Firestore');
      }
    } catch (error) {
      console.error('Error loading path:', error);
    } finally {
      setLoading(false);
    }
  };

  const markCompetencyComplete = async (competencyId) => {
    try {
      if (!auth.currentUser) {
        console.log('No user logged in');
        return;
      }

      const newCompleted = completedCompetencies.includes(competencyId)
        ? completedCompetencies.filter(id => id !== competencyId)
        : [...completedCompetencies, competencyId];

      setCompletedCompetencies(newCompleted);

      // Calculate new progress
      const totalCompetencies = path.competencies?.length || 0;
      const newProgress = totalCompetencies > 0 ? (newCompleted.length / totalCompetencies) * 100 : 0;

      // Update in Firestore
      const pathRef = doc(db, 'users', auth.currentUser.uid, 'learningPaths', pathId);
      await updateDoc(pathRef, {
        completedCompetencies: newCompleted,
        progress: newProgress,
        updatedAt: new Date(),
        status: newProgress >= 100 ? 'completed' : 'active'
      });

      // Update local state
      setPath(prev => ({
        ...prev,
        completedCompetencies: newCompleted,
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'active'
      }));

      console.log('Progress updated:', { newProgress, completedCount: newCompleted.length });
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Path not found</h2>
        <button
          onClick={() => navigate('/my-paths')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to My Paths
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/my-paths')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to My Paths
      </button>

      {/* Path Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {path.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {path.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Competencies</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {path.competencies?.length || 0}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {path.totalHours || 0}h
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Est. Weeks</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {path.estimatedWeeks || 0}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.round(path.progress || 0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${path.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Learning Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Learning Path Competencies
        </h2>

        {/* Learning Preferences Summary */}
        {path.preferences && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Learning Style:</span> {path.preferences.learningStyle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Resource Types:</span> {path.preferences.preferredResourceTypes?.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Weekly Time:</span> {path.timeAvailable}h/week
                </span>
              </div>
            </div>
          </div>
        )}

        {path.competencies?.map((competency, index) => {
          const isCompleted = completedCompetencies.includes(competency.id);
          const difficultyColors = {
            1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            4: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            5: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          };

          const difficultyLabels = {
            1: 'Beginner',
            2: 'Basic',
            3: 'Intermediate',
            4: 'Advanced',
            5: 'Expert'
          };

          return (
            <div
              key={competency.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 p-6 transition-all ${
                isCompleted
                  ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {competency.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {competency.subcategory}
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {competency.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[competency.difficulty]}`}>
                      Level {competency.difficulty} - {difficultyLabels[competency.difficulty]}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {competency.estimatedHours}h
                    </span>
                    {competency.prerequisites?.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {competency.prerequisites.length} Prerequisites
                      </span>
                    )}
                  </div>

                  {/* Keywords */}
                  {competency.keywords && competency.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {competency.keywords.slice(0, 5).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {competency.keywords.length > 5 && (
                        <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400">
                          +{competency.keywords.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => markCompetencyComplete(competency.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCompleted
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                    <button
                      onClick={() => navigate(`/competencies/${competency.id}`)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors flex items-center gap-2"
                    >
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {(!path.competencies || path.competencies.length === 0) && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No competencies in this path
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This learning path doesn't have any competencies yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathView;
