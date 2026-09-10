import { useState, useEffect } from 'react';
import { X, Trophy, TrendingUp, AlertTriangle, Target, Calendar, Award, BookOpen } from 'lucide-react';
import { getCompetencyProgress, getTopicRecommendations } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

const CompetencyScoreModal = ({ competency, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isOpen && competency && currentUser) {
      loadProgress();
    }
  }, [isOpen, competency, currentUser]);

  const loadProgress = async (retry = 0) => {
    setLoading(true);
    try {
      console.log('🔍 Loading progress for competency:', {
        competencyId: competency.id,
        competencyLabel: competency.label,
        competencyName: competency.name,
        userId: currentUser.uid,
        retry,
        path: `users/${currentUser.uid}/competencyProgress/${competency.id}`
      });

      // Add delay for first load to allow Firestore write to complete
      if (retry === 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const progressData = await getCompetencyProgress(currentUser.uid, competency.id);

      console.log('📊 Progress data loaded:', {
        competencyId: competency.id,
        hasData: !!progressData,
        score: progressData?.lastAssessmentScore,
        weakAreas: progressData?.weakAreas?.length,
        retry,
        fullData: progressData
      });

      setProgress(progressData);

      if (progressData && progressData.weakAreas) {
        const recs = getTopicRecommendations(progressData.weakAreas, competency.label || competency.name);
        setRecommendations(recs);
      } else if (progressData && progressData.lastAssessmentScore !== undefined) {
        // Has score but no weak areas (perfect score)
        setRecommendations({
          status: 'strong',
          message: `Great job! You scored ${progressData.lastAssessmentScore}% on ${competency.label || competency.name}.`,
          recommendations: []
        });
      } else {
        // No data found, might need retry
        if (retry < 2 && competency.recentScore) {
          // Retry after 2 seconds if we just completed an assessment
          console.log('No data found, retrying...', retry + 1);
          setTimeout(() => {
            setRetryCount(retry + 1);
            loadProgress(retry + 1);
          }, 2000);
          return;
        }

        setRecommendations({
          status: 'no-data',
          message: 'No assessment data available yet. Take an assessment to see your progress!',
          recommendations: []
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setRecommendations({
        status: 'error',
        message: 'Failed to load progress data.',
        recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (score >= 40) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (priority === 'medium') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {competency?.label || competency?.name || 'Competency'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {competency?.description || 'Assessment Progress & Recommendations'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : progress ? (
            <div className="space-y-6">
              {/* Latest Score Card */}
              <div className={`rounded-lg border-2 p-6 ${getScoreBg(progress.lastAssessmentScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-6 h-6" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Latest Score
                      </h3>
                    </div>
                    <div className={`text-5xl font-bold ${getScoreColor(progress.lastAssessmentScore)}`}>
                      {progress.lastAssessmentScore}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {progress.lastAssessmentDate && new Date(progress.lastAssessmentDate.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Performance Level</div>
                    <div className={`text-2xl font-bold ${getScoreColor(progress.lastAssessmentScore)} mt-1`}>
                      {progress.lastAssessmentScore >= 80 ? 'Advanced' :
                       progress.lastAssessmentScore >= 60 ? 'Intermediate' :
                       progress.lastAssessmentScore >= 40 ? 'Beginner' : 'Novice'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment History */}
              {progress.assessmentHistory && progress.assessmentHistory.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Assessment History
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {progress.assessmentHistory.slice(-5).reverse().map((assessment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Award className={`w-5 h-5 ${getScoreColor(assessment.score)}`} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {assessment.score}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {assessment.correctAnswers} / {assessment.totalQuestions} correct
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(assessment.completedAt.seconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Recommendations */}
              {recommendations && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {recommendations.status === 'strong' ? (
                      <Trophy className="w-6 h-6 text-green-600" />
                    ) : (
                      <Target className="w-6 h-6 text-orange-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recommendations.status === 'strong' ? 'Strong Performance!' : 'Focus Areas'}
                    </h3>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {recommendations.message}
                  </p>

                  {recommendations.recommendations.length > 0 && (
                    <div className="space-y-4">
                      {recommendations.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {rec.topic}
                              </h4>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(rec.priority)}`}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {rec.questionsWrong} {rec.questionsWrong === 1 ? 'question' : 'questions'} need review
                          </div>

                          {rec.focusAreas && rec.focusAreas.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Key Concepts to Review:
                              </div>
                              <ul className="space-y-1">
                                {rec.focusAreas.map((area, i) => (
                                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-orange-400">
                                    {area}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.location.href = `/assessment?competency=${competency.id}`}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Take Assessment
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Assessment Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't taken an assessment for this competency yet.
              </p>
              <button
                onClick={() => window.location.href = `/assessment?competency=${competency.id}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Take Your First Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetencyScoreModal;
