import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, BarChart3, Target, Sparkles, Check } from 'lucide-react';
import { competencyList } from '../data';
import AIExplainModal from '../components/AIExplainModal';
import QuizGenerator from '../components/QuizGenerator';

const CompetencyDetail = () => {
  const { competencyId } = useParams();
  const navigate = useNavigate();
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [addedToPath, setAddedToPath] = useState(false);

  const competency = competencyList.find(c => c.id === competencyId);

  const handleAddToLearningPath = () => {
    // Store selected competency in sessionStorage to pass to path generator
    const currentSelections = JSON.parse(sessionStorage.getItem('selectedCompetencies') || '[]');
    if (!currentSelections.includes(competencyId)) {
      currentSelections.push(competencyId);
      sessionStorage.setItem('selectedCompetencies', JSON.stringify(currentSelections));
    }
    setAddedToPath(true);
    // Navigate to path generator
    navigate('/path-generator');
  };

  const handleViewResources = () => {
    // Navigate to resources page with competency filter
    navigate(`/resources?competency=${competencyId}`);
  };

  if (!competency) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Competency Not Found
          </h2>
          <button
            onClick={() => navigate('/competencies')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Competencies
          </button>
        </div>
      </div>
    );
  }

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
      {/* Back Button */}
      <button
        onClick={() => navigate('/competencies')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Competencies
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {competency.name}
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {competency.subcategory}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[competency.difficulty]}`}>
                Level {competency.difficulty} - {difficultyLabels[competency.difficulty]}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {competency.estimatedHours}h
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {competency.category}
              </span>
            </div>

            {/* AI Explain Button */}
            <button
              onClick={() => setShowExplainModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              AI Explain to Me
            </button>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {competency.description}
            </p>
          </div>

          {/* Keywords */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Key Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {competency.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {competency.prerequisites && competency.prerequisites.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Prerequisites
              </h2>
              <div className="space-y-2">
                {competency.prerequisites.map((prereqId, index) => {
                  const prereq = competencyList.find(c => c.id === prereqId);
                  return prereq ? (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                      onClick={() => navigate(`/competencies/${prereqId}`)}
                    >
                      <span className="text-gray-700 dark:text-gray-300">{prereq.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[prereq.difficulty]}`}>
                        L{prereq.difficulty}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Practice Quiz Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Practice Quiz
            </h2>
            <QuizGenerator
              competencyName={competency.name}
              competencyDescription={competency.description}
            />
          </div>
        </div>

        {/* Sidebar - Right Side (1 column) */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Difficulty</span>
                  <span className="font-medium">{difficultyLabels[competency.difficulty]}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${(competency.difficulty / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {competency.estimatedHours}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prerequisites</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {competency.prerequisites?.length || 0}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleAddToLearningPath}
                  className={`w-full font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    addedToPath
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addedToPath && <Check className="w-4 h-4" />}
                  {addedToPath ? 'Added to Path' : 'Add to Learning Path'}
                </button>
                <button
                  onClick={handleViewResources}
                  className="w-full mt-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explain Modal */}
      <AIExplainModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        competencyName={competency.name}
        competencyDescription={competency.description}
      />
    </div>
  );
};

export default CompetencyDetail;
