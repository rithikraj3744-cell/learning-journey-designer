import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { competencyList } from '../data';
import {
  Target,
  Clock,
  Zap,
  BookOpen,
  ArrowRight,
  Check,
  Loader2,
  Video,
  GraduationCap,
  FileText,
  Book,
  Lightbulb
} from 'lucide-react';

const PathGenerator = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [competencies, setCompetencies] = useState([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [timeAvailable, setTimeAvailable] = useState(10);
  const [preferences, setPreferences] = useState({
    learningStyle: 'visual',
    preferredResourceTypes: ['video', 'course']
  });

  useEffect(() => {
    loadCompetencies();
    // Load pre-selected competencies from sessionStorage (if coming from competency detail page)
    const preSelected = JSON.parse(sessionStorage.getItem('selectedCompetencies') || '[]');
    if (preSelected.length > 0) {
      setSelectedCompetencies(preSelected);
      // Clear the sessionStorage after loading
      sessionStorage.removeItem('selectedCompetencies');
    }
  }, []);

  const loadCompetencies = async () => {
    try {
      // Load competencies from local JSON data
      setCompetencies(competencyList);
    } catch (error) {
      console.error('Error loading competencies:', error);
    }
  };

  const toggleCompetency = (compId) => {
    setSelectedCompetencies(prev =>
      prev.includes(compId)
        ? prev.filter(id => id !== compId)
        : [...prev, compId]
    );
  };

  const toggleResourceType = (type) => {
    setPreferences(prev => ({
      ...prev,
      preferredResourceTypes: prev.preferredResourceTypes.includes(type)
        ? prev.preferredResourceTypes.filter(t => t !== type)
        : [...prev.preferredResourceTypes, type]
    }));
  };

  const handleGenerate = async () => {
    if (selectedCompetencies.length === 0) {
      alert('Please select at least one target competency');
      return;
    }

    if (!auth.currentUser) {
      alert('Please login to create a learning path');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const selectedCompetencyData = competencies.filter(c =>
        selectedCompetencies.includes(c.id)
      );

      // Calculate total estimated time
      const totalHours = selectedCompetencyData.reduce((sum, comp) =>
        sum + (comp.estimatedHours || 10), 0
      );

      // Calculate estimated completion weeks
      const estimatedWeeks = Math.ceil(totalHours / timeAvailable);

      // Create learning path object
      const learningPath = {
        userId: auth.currentUser.uid,
        title: `Learning Path - ${selectedCompetencyData.map(c => c.name).join(', ').substring(0, 50)}${selectedCompetencyData.length > 1 ? '...' : ''}`,
        name: `Learning Path - ${selectedCompetencyData.map(c => c.name).join(', ').substring(0, 50)}${selectedCompetencyData.length > 1 ? '...' : ''}`,
        targetCompetencies: selectedCompetencies,
        competencies: selectedCompetencyData,
        timeAvailable,
        preferences,
        totalHours,
        estimatedWeeks,
        progress: 0,
        completedCompetencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };

      // Save to Firestore
      const docRef = await addDoc(
        collection(db, 'users', auth.currentUser.uid, 'learningPaths'),
        learningPath
      );

      console.log('Learning path created:', docRef.id);

      // Navigate to the path view
      navigate(`/my-paths/${docRef.id}`);
    } catch (error) {
      console.error('Error generating path:', error);
      alert('Failed to generate learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resourceTypes = [
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'course', label: 'Courses', icon: GraduationCap },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'book', label: 'Books', icon: Book },
    { id: 'tutorial', label: 'Tutorials', icon: Lightbulb }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Generate Learning Path
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a personalized learning journey based on your goals and current skills
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Competencies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select Target Competencies
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose the skills you want to master
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {competencies.map((comp) => (
                <label
                  key={comp.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCompetencies.includes(comp.id)
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCompetencies.includes(comp.id)}
                    onChange={() => toggleCompetency(comp.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {comp.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {comp.subcategory}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Time Availability */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Time Availability
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              How many hours can you dedicate per week?
            </p>

            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="40"
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  1 hour/week
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {timeAvailable}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    hours/week
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  40 hours/week
                </span>
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Learning Preferences
            </h2>

            {/* Learning Style */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preferred Learning Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['visual', 'auditory', 'reading', 'kinesthetic'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setPreferences({ ...preferences, learningStyle: style })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences.learningStyle === style
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center font-medium capitalize">
                      {style}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preferred Resource Types
              </label>
              <div className="flex flex-wrap gap-3">
                {resourceTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleResourceType(type.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        preferences.preferredResourceTypes.includes(type.id)
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{type.label}</span>
                      {preferences.preferredResourceTypes.includes(type.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg shadow-lg p-6 text-white sticky top-4">
            <h3 className="text-xl font-semibold mb-6">Path Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Target Competencies</div>
                  <div className="text-2xl font-bold">{selectedCompetencies.length}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Weekly Hours</div>
                  <div className="text-2xl font-bold">{timeAvailable}h</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Learning Style</div>
                  <div className="text-lg font-medium capitalize">
                    {preferences.learningStyle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Resource Types</div>
                  <div className="text-lg font-medium">
                    {preferences.preferredResourceTypes.length} selected
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || selectedCompetencies.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Learning Path
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {selectedCompetencies.length === 0 && (
              <p className="text-xs text-blue-100 mt-3 text-center">
                Select at least one competency to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathGenerator;
