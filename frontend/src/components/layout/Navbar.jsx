import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, User, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [navigate])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg p-1 -m-1">
              <BookOpen className="h-8 w-8 text-primary-600" aria-hidden="true" />
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline">
                Learning Journey
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-white sm:hidden">
                LJ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="nav-link touch-target" aria-label="Dashboard">
                  Dashboard
                </Link>
                <Link to="/competencies" className="nav-link touch-target" aria-label="Competencies">
                  Competencies
                </Link>
                <Link to="/learning-paths" className="nav-link touch-target" aria-label="My Learning Paths">
                  My Paths
                </Link>
                <Link to="/resources" className="nav-link touch-target" aria-label="Resources">
                  Resources
                </Link>
                <Link
                  to="/profile"
                  className="nav-link p-2 touch-target"
                  aria-label="Profile"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center space-x-2 touch-target"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary touch-target">
                  Login
                </Link>
                <Link to="/register" className="btn-primary touch-target">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 md:hidden animate-slideIn">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1">
                  {currentUser ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/competencies"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        Competencies
                      </Link>
                      <Link
                        to="/learning-paths"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        My Paths
                      </Link>
                      <Link
                        to="/resources"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        Resources
                      </Link>
                      <Link
                        to="/profile"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          handleMobileLinkClick()
                        }}
                        className="mobile-nav-link w-full text-left touch-target"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="mobile-nav-link touch-target"
                        onClick={handleMobileLinkClick}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar
