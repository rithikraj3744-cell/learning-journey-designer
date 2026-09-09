import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Plus,
  Target,
  Clock,
  TrendingUp,
  Trash2,
  Eye,
  CheckCircle2,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

const MyPaths = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    console.log('MyPaths component mounted');

    // Wait for auth state to be ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');

      if (user) {
        console.log('Auth ready, loading paths for user:', user.uid);
        loadPaths();
      } else {
        console.log('No user signed in');
        setLoading(false);
      }
    });

    return () => {
      console.log('MyPaths component unmounting');
      unsubscribe();
    };
  }, []);

  const loadPaths = async () => {
    if (!auth.currentUser) {
      console.log('No current user, cannot load paths');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading paths from Firestore for user:', auth.currentUser.uid);
      const pathsRef = collection(db, 'users', auth.currentUser.uid, 'learningPaths');
      const snapshot = await getDocs(pathsRef);

      const pathsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        targetDate: doc.data().targetDate?.toDate()
      }));

      // Sort by creation date (newest first)
      pathsData.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      });

      console.log('Loaded paths from Firestore:', pathsData);
      setPaths(pathsData);
    } catch (error) {
      console.error('Error loading paths from Firestore:', error);
      alert(`Failed to load paths: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePath = async (pathId) => {
    if (!window.confirm('Are you sure you want to delete this learning path?')) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'learningPaths', pathId));
      setPaths(paths.filter(p => p.id !== pathId));
      console.log('Path deleted:', pathId);
    } catch (error) {
      console.error('Error deleting path:', error);
      alert('Failed to delete path');
    }
  };

  const filteredPaths = paths.filter(path => {
    if (filter === 'all') return true;
    return path.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'active':
        return <PlayCircle className="h-4 w-4" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Learning Paths
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your personalized learning journeys
          </p>
        </div>
        <button
          onClick={() => navigate('/path-generator')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Generate New Path
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'all', label: 'All Paths' },
          { id: 'active', label: 'Active' },
          { id: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm">
              ({paths.filter(p => tab.id === 'all' ? true : p.status === tab.id).length})
            </span>
          </button>
        ))}
      </div>

      {/* Paths Grid */}
      {filteredPaths.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No learning paths yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate your first personalized learning path to get started
          </p>
          <button
            onClick={() => navigate('/path-generator')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Generate Learning Path
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path) => (
            <div
              key={path.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {path.title || path.name || 'Untitled Path'}
                  </h3>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(path.status)}`}>
                    {getStatusIcon(path.status)}
                    {path.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {path.competencies?.length || 0} competencies • {path.estimatedWeeks || 0} weeks
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Skills</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {path.competencies?.length || 0}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Hours</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {path.totalHours || 0}h
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(path.progress || 0)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${path.progress || 0}%` }}
                  />
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  Created {new Date(path.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate(`/my-paths/${path.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleDeletePath(path.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-l border-gray-200 dark:border-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {paths.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Your Learning Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-bold">{paths.length}</div>
              <div className="text-sm opacity-80">Total Paths</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {paths.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm opacity-80">Active Paths</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {paths.reduce((sum, p) => sum + (p.competencies?.length || 0), 0)}
              </div>
              <div className="text-sm opacity-80">Total Skills</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {paths.length > 0 ? Math.round(paths.reduce((sum, p) => sum + (p.progress || 0), 0) / paths.length) : 0}%
              </div>
              <div className="text-sm opacity-80">Avg Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPaths;
