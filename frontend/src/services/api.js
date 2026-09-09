import axios from 'axios'

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
})

// Request interceptor - add any auth tokens or modify requests
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handle responses and errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.status)
    return response
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      console.error(`[API Error ${status}]`, data)

      // Handle specific error codes
      if (status === 401) {
        console.error('Unauthorized - Please login again')
      } else if (status === 403) {
        console.error('Forbidden - You do not have permission')
      } else if (status === 404) {
        console.error('Not Found - Resource does not exist')
      } else if (status === 500) {
        console.error('Server Error - Please try again later')
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Error] No response received from server')
      console.error('Please check if the backend server is running on', API_BASE_URL)
    } else {
      // Error setting up the request
      console.error('[API Error]', error.message)
    }

    return Promise.reject(error)
  }
)

// ============================================================================
// LEARNING PATH API FUNCTIONS
// ============================================================================

/**
 * Get all learning paths for a user
 */
export const getUserPaths = async (userId) => {
  try {
    const response = await api.get(`/paths/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error getting user paths:', error)
    throw error
  }
}

/**
 * Get a specific learning path
 */
export const getPath = async (pathId) => {
  try {
    const response = await api.get(`/path/${pathId}`)
    return response.data
  } catch (error) {
    console.error('Error getting path:', error)
    throw error
  }
}

/**
 * Generate a new learning path
 */
export const generatePath = async (pathData) => {
  try {
    const response = await api.post('/generate-path', pathData)
    return response.data
  } catch (error) {
    console.error('Error generating path:', error)
    throw error
  }
}

// Alias for compatibility
export const generateLearningPath = generatePath

/**
 * Update path progress
 */
export const updatePathProgress = async (pathId, progressData) => {
  try {
    const response = await api.put(`/paths/${pathId}/progress`, progressData)
    return response.data
  } catch (error) {
    console.error('Error updating path progress:', error)
    throw error
  }
}

/**
 * Delete a learning path
 */
export const deletePath = async (pathId) => {
  try {
    const response = await api.delete(`/paths/${pathId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting path:', error)
    throw error
  }
}

/**
 * Get all competencies
 */
export const getCompetencies = async () => {
  try {
    const response = await api.get('/competencies')
    return response.data
  } catch (error) {
    console.error('Error getting competencies:', error)
    throw error
  }
}

/**
 * Get resources (with optional filters)
 */
export const getResources = async (filters = {}) => {
  try {
    const response = await api.get('/resources', { params: filters })
    return response.data
  } catch (error) {
    console.error('Error getting resources:', error)
    throw error
  }
}

/**
 * Get a specific resource
 */
export const getResource = async (resourceId) => {
  try {
    const response = await api.get(`/resources/${resourceId}`)
    return response.data
  } catch (error) {
    console.error('Error getting resource:', error)
    throw error
  }
}

// Alias for compatibility
export const getResourceDetail = getResource

export default api
