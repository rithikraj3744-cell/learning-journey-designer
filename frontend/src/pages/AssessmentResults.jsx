import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { saveAssessmentResults, updateUserCompetencyProfile } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

const AssessmentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { results, answers, questions } = location.state || {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!results) {
      navigate('/assessment');
      return;
    }

    // Auto-save results
    saveResults();
  }, []);

  const saveResults = async () => {
    if (!currentUser || saved) return;

    setSaving(true);
    try {
      // Save to Firestore assessments collection
      await saveAssessmentResults(currentUser.uid, {
        results,
        answers,
        timestamp: new Date().toISOString(),
        competencies: Object.keys(results.competencyScores)
      });

      // Update user competency profile
      await updateUserCompetencyProfile(currentUser.uid, results.competencyScores);

      setSaved(true);
    } catch (error) {
      console.error('Error saving results:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!results) {
    return null;
  }

  // Prepare data for visualizations
  const radarData = Object.entries(results.competencyScores).map(([id, data]) => ({
    competency: data.name,
    score: Math.round((data.correct / data.total) * 100),
    fullMark: 100
  }));

  const barData = Object.entries(results.competencyScores).map(([id, data]) => ({
    name: data.name,
    correct: data.correct,
    incorrect: data.total - data.correct,
    percentage: Math.round((data.correct / data.total) * 100)
  }));

  // Determine overall skill level
  const getSkillLevel = (score) => {
    if (score >= 80) return { level: 'Advanced', color: 'green', description: 'Excellent mastery of the subject' };
    if (score >= 60) return { level: 'Intermediate', color: 'blue', description: 'Good understanding with room to grow' };
    if (score >= 40) return { level: 'Beginner', color: 'orange', description: 'Basic knowledge, needs more practice' };
    return { level: 'Novice', color: 'red', description: 'Limited knowledge, significant learning needed' };
  };

  const skillLevel = getSkillLevel(results.score);

  // Identify skill gaps (competencies below 60%)
  const skillGaps = Object.entries(results.competencyScores)
    .filter(([id, data]) => (data.correct / data.total) * 100 < 60)
    .map(([id, data]) => ({
      id,
      name: data.name,
      score: Math.round((data.correct / data.total) * 100)
    }));

  // Identify strengths (competencies above 80%)
  const strengths = Object.entries(results.competencyScores)
    .filter(([id, data]) => (data.correct / data.total) * 100 >= 80)
    .map(([id, data]) => ({
      id,
      name: data.name,
      score: Math.round((data.correct / data.total) * 100)
    }));

  const handleGenerateLearningPath = () => {
    // Navigate to learning path creation with pre-selected competencies
    navigate('/my-paths/create', {
      state: {
        suggestedCompetencies: skillGaps.map(g => g.id),
        fromAssessment: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            skillLevel.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
            skillLevel.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
            skillLevel.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
            'bg-red-100 dark:bg-red-900/20'
          }`}>
            <Trophy className={`h-10 w-10 ${
              skillLevel.color === 'green' ? 'text-green-600 dark:text-green-400' :
              skillLevel.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              skillLevel.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              'text-red-600 dark:text-red-400'
            }`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assessment Complete!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here are your results and personalized recommendations
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center md:col-span-1">
              <div className="text-6xl font-bold text-white mb-2">
                {results.score}%
              </div>
              <div className="text-blue-100 text-sm uppercase tracking-wide">
                Overall Score
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col justify-center">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Skill Level: {skillLevel.level}</span>
                  <span className="text-blue-100 text-sm">
                    {results.correctAnswers} / {results.totalQuestions} correct
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${results.score}%` }}
                  />
                </div>
              </div>
              <p className="text-blue-100 text-sm">
                {skillLevel.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Competency Timeline/Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Competency Profile
            </h2>
            <div className="space-y-6">
              {Object.entries(results.competencyScores).map(([id, data], index) => {
                const percentage = Math.round((data.correct / data.total) * 100);
                const level = getSkillLevel(percentage);

                return (
                  <div key={id} className="relative">
                    {/* Timeline connector */}
                    {index < Object.keys(results.competencyScores).length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        level.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 ring-4 ring-green-500/20' :
                        level.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 ring-4 ring-blue-500/20' :
                        level.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20 ring-4 ring-orange-500/20' :
                        'bg-red-100 dark:bg-red-900/20 ring-4 ring-red-500/20'
                      }`}>
                        <span className={`text-lg font-bold ${
                          level.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          level.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          level.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {percentage}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {data.name}
                            </h3>
                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                              level.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              level.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                              level.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {level.level}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {data.correct} / {data.total} correct
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              level.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              level.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              level.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                              'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(results.competencyScores).length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Competencies Assessed
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {results.score}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Average Score
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="correct" fill="#10B981" name="Correct" />
                <Bar dataKey="incorrect" fill="#EF4444" name="Incorrect" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-Competency Scores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance by Competency
          </h2>
          <div className="space-y-4">
            {Object.entries(results.competencyScores).map(([id, data]) => {
              const percentage = Math.round((data.correct / data.total) * 100);
              const level = getSkillLevel(percentage);

              return (
                <div key={id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {data.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        level.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        level.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        level.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {level.level}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          level.color === 'green' ? 'bg-green-600' :
                          level.color === 'blue' ? 'bg-blue-600' :
                          level.color === 'orange' ? 'bg-orange-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.correct} out of {data.total} questions correct
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Strengths
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Competencies where you demonstrated strong knowledge
              </p>
              <div className="space-y-3">
                {strengths.map((strength) => (
                  <div
                    key={strength.id}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {strength.name}
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {strength.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {skillGaps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Areas for Improvement
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Focus on these competencies to improve your skills
              </p>
              <div className="space-y-3">
                {skillGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {gap.name}
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                      {gap.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Next Steps
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Based on your assessment results, we recommend creating a personalized learning path
            to address your skill gaps and build on your strengths.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGenerateLearningPath}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Target className="h-5 w-5" />
              Generate Learning Path
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/assessment')}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Take Another Assessment
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Save Status */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Saving results...</span>
            </div>
          </div>
        )}

        {saved && !saving && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-900 dark:text-white">Results saved successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResults;
