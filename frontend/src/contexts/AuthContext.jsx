import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Register with email and password
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile with display name
      await updateProfile(user, { displayName })

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          careerGoals: '',
          experience: 'beginner',
          learningPreferences: {
            preferredResourceTypes: [],
            timeAvailable: 10, // hours per week
            learningStyle: 'visual'
          },
          competencies: {} // { competencyId: level (0-5) }
        },
        stats: {
          completedPaths: 0,
          totalCompetencies: 0,
          hoursLearned: 0,
          assessmentsTaken: 0
        }
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)

      // Send email verification
      await sendEmailVerification(user)

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid))

      if (!userDoc.exists()) {
        // Create new user profile
        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            careerGoals: '',
            experience: 'beginner',
            learningPreferences: {
              preferredResourceTypes: [],
              timeAvailable: 10,
              learningStyle: 'visual'
            },
            competencies: {}
          },
          stats: {
            completedPaths: 0,
            totalCompetencies: 0,
            hoursLearned: 0,
            assessmentsTaken: 0
          }
        }

        await setDoc(doc(db, 'users', user.uid), userProfile)
      }

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Update user profile in Firestore
  const updateUserProfile = async (updates) => {
    if (!currentUser) throw new Error('No user logged in')

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })

      // Reload user profile
      await loadUserProfile(currentUser.uid)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Load user profile from Firestore
  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data())
      } else {
        setUserProfile(null)
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError(err.message)
    }
  }

  // Update competency level
  const updateCompetencyLevel = async (competencyId, level) => {
    if (!currentUser) throw new Error('No user logged in')

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        [`profile.competencies.${competencyId}`]: level,
        updatedAt: new Date().toISOString()
      })

      await loadUserProfile(currentUser.uid)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        await loadUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateCompetencyLevel,
    loadUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthContext
