import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Map,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Network,
  Search,
  Bell,
  Award,
  Briefcase
} from 'lucide-react';
import AILearningAssistant from './AILearningAssistant';
import NotificationCenter from './NotificationCenter';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Competencies', href: '/competencies', icon: Target },
    { name: 'My Goals', href: '/goals', icon: Target },
    { name: 'Career Paths', href: '/career-pathways', icon: Briefcase },
    { name: 'Certifications', href: '/certifications', icon: Award },
    { name: 'Knowledge Graph', href: '/knowledge-graph', icon: Network },
    { name: 'My Learning Paths', href: '/my-paths', icon: Map },
    { name: 'Resources', href: '/resources', icon: Library },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(db, 'users', auth.currentUser.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center">
              <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              {(isSidebarOpen || isMobileSidebarOpen) && (
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Learning
                </span>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={!isSidebarOpen ? item.name : ''}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {(isSidebarOpen || isMobileSidebarOpen) && (
                        <span className="ml-3 text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          {(isSidebarOpen || isMobileSidebarOpen) && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Learning Journey Designer
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                v1.0.0
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                Learning Journey
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header with Search */}
        <div className="hidden lg:block sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search competencies, resources, paths..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </form>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2 md:mb-0">
                &copy; {new Date().getFullYear()} Learning Journey Designer. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About
                </Link>
                <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Terms
                </Link>
                <Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* AI Learning Assistant - Global */}
      <AILearningAssistant />

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
