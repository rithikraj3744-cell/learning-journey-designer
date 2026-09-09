import { useAuth } from '../contexts/AuthContext';
import { competencyList, resourceList } from '../data';
import CompetencyCard from '../components/CompetencyCard';
import ResourceCard from '../components/ResourceCard';
import ProgressIndicator from '../components/ProgressIndicator';
import Button from '../components/Button';
import {
  Target,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();

  // Mock user progress data
  const userStats = {
    totalCompetencies: competencyList.length,
    completedCompetencies: 12,
    inProgressCompetencies: 5,
    totalLearningHours: 250,
    completedHours: 85
  };

  const completionRate = Math.round((userStats.completedCompetencies / userStats.totalCompetencies) * 100);
  const recentCompetencies = competencyList.slice(0, 3);
  const recommendedResources = resourceList.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {currentUser?.displayName || currentUser?.email || 'Learner'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your learning progress overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Competencies */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {userStats.totalCompetencies}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Competencies
          </p>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {userStats.completedCompetencies}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {userStats.inProgressCompetencies}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            In Progress
          </p>
        </div>

        {/* Learning Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {userStats.completedHours}h
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Learning Hours
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Overall Progress
          </h2>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {completionRate}%
          </span>
        </div>
        <ProgressIndicator
          progress={completionRate}
          size="lg"
          color="blue"
          showPercentage={false}
        />
        <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{userStats.completedCompetencies} completed</span>
          <span>{userStats.inProgressCompetencies} in progress</span>
          <span>{userStats.totalCompetencies - userStats.completedCompetencies - userStats.inProgressCompetencies} not started</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Competencies */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Continue Learning
            </h2>
            <Link to="/competencies">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentCompetencies.map((comp) => (
              <CompetencyCard
                key={comp.id}
                competency={comp}
                showProgress={true}
                progress={Math.floor(Math.random() * 100)}
                onViewDetails={() => console.log('View details', comp.id)}
              />
            ))}
          </div>
        </div>

        {/* Recommended Resources */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recommended Resources
            </h2>
            <Link to="/resources">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recommendedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                showRating={true}
                rating={4 + Math.random()}
                onViewResource={() => console.log('View resource', resource.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to start learning?</h2>
        <p className="mb-6 text-blue-100">
          Explore our competency library and create your personalized learning path today.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/competencies">
            <Button variant="secondary" icon={Target}>
              Browse Competencies
            </Button>
          </Link>
          <Link to="/assessment">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Take Assessment
            </Button>
          </Link>
          <Link to="/my-paths">
            <Button variant="outline" className="border-white text-white hover:bg-white/10" icon={Plus}>
              Create Learning Path
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard
