import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
  Info,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';
import { getAllCompetencies } from '../services/firestore';

const AssessmentWelcome = () => {
  const navigate = useNavigate();
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [showInfo, setShowInfo] = useState(true);
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const startButtonRef = useRef(null);

  // Load real competencies from Firestore
  useEffect(() => {
    loadCompetencies();
  }, []);

  const loadCompetencies = async () => {
    try {
      setLoading(true);
      const competencies = await getAllCompetencies();

      // Transform to the format needed for display
      const formatted = competencies.map(comp => ({
        id: comp.id,
        name: comp.name || comp.id,
        category: comp.category || 'General',
        questionCount: 5 // AI will generate 5 questions per competency
      }));

      setAvailableCompetencies(formatted);
      console.log(`✓ Loaded ${formatted.length} competencies from Firestore`);
    } catch (err) {
      console.error('Error loading competencies:', err);
      setError('Failed to load competencies. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Filter competencies based on search
  const filteredCompetencies = availableCompetencies.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCompetency = (competencyId) => {
    setSelectedCompetencies(prev =>
      prev.includes(competencyId)
        ? prev.filter(id => id !== competencyId)
        : [...prev, competencyId]
    );
  };

  const handleCompetencyClick = (competencyId) => {
    // Select the competency
    if (!selectedCompetencies.includes(competencyId)) {
      setSelectedCompetencies(prev => [...prev, competencyId]);
    }

    // Scroll to start button
    setTimeout(() => {
      startButtonRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
  };

  const startAssessment = () => {
    if (selectedCompetencies.length === 0) {
      alert('Please select at least one competency to assess');
      return;
    }

    navigate('/assessment/test', {
      state: { competencyIds: selectedCompetencies }
    });
  };

  const totalQuestions = selectedCompetencies.reduce((sum, id) => {
    const comp = availableCompetencies.find(c => c.id === id);
    return sum + (comp?.questionCount || 0);
  }, 0);

  const estimatedTime = Math.ceil(totalQuestions * 1.5); // 1.5 minutes per question

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
          <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Skill Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Take our assessment to identify your current skill levels and get personalized learning recommendations
        </p>
      </div>

      {/* Info Banner */}
      {showInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                How it works
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Select competencies you want to assess</li>
                <li>• Answer multiple-choice questions (5-10 per competency)</li>
                <li>• Get instant results with skill level determination</li>
                <li>• Receive personalized learning path recommendations</li>
              </ul>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Competency Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select Competencies to Assess
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Click on a competency to select and quickly start your assessment
        </p>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Showing {filteredCompetencies.length} of {availableCompetencies.length} competencies
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading competencies...</span>
          </div>
        ) : filteredCompetencies.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'No competencies match your search' : 'No competencies available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredCompetencies.map((competency) => (
            <div
              key={competency.id}
              onClick={() => handleCompetencyClick(competency.id)}
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedCompetencies.includes(competency.id)
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  selectedCompetencies.includes(competency.id)
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedCompetencies.includes(competency.id) && (
                    <CheckCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {competency.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {competency.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {competency.questionCount} questions
                </span>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Summary */}
      {selectedCompetencies.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Assessment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Target className="h-4 w-4" />
                Competencies
              </div>
              <div className="text-2xl font-bold text-white">
                {selectedCompetencies.length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <CheckCircle className="h-4 w-4" />
                Total Questions
              </div>
              <div className="text-2xl font-bold text-white">
                {totalQuestions}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Est. Time
              </div>
              <div className="text-2xl font-bold text-white">
                {estimatedTime} min
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div ref={startButtonRef} className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={startAssessment}
          disabled={selectedCompetencies.length === 0}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          <span className="font-semibold">Start Assessment</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Warning */}
      {selectedCompetencies.length === 0 && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Please select at least one competency to begin the assessment
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentWelcome;
