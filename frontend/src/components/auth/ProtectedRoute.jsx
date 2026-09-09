import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()

  // Development mode - bypass authentication
  // Set to false when you want to enable real authentication
  const DEV_MODE = true

  if (DEV_MODE) {
    // In development mode, allow access without authentication
    return children
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
