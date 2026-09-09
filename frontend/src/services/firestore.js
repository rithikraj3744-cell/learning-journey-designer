import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

// ============================================================================
// USERS COLLECTION
// ============================================================================

export const createUser = async (uid, userData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const getUser = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

export const updateUser = async (uid, updates) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// ============================================================================
// COMPETENCIES COLLECTION
// ============================================================================

export const createCompetency = async (competencyData) => {
  try {
    const docRef = await addDoc(collection(db, 'competencies'), {
      ...competencyData,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...competencyData }
  } catch (error) {
    console.error('Error creating competency:', error)
    throw error
  }
}

export const getCompetency = async (competencyId) => {
  try {
    const competencyDoc = await getDoc(doc(db, 'competencies', competencyId))
    if (competencyDoc.exists()) {
      return { id: competencyDoc.id, ...competencyDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting competency:', error)
    throw error
  }
}

export const getAllCompetencies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'competencies'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting competencies:', error)
    throw error
  }
}

// Get competencies with pagination support
export const getCompetencies = async (limitCount = 20, lastVisible = null) => {
  try {
    let q = query(
      collection(db, 'competencies'),
      orderBy('name'),
      limit(limitCount)
    )

    if (lastVisible) {
      q = query(q, startAfter(lastVisible))
    }

    const querySnapshot = await getDocs(q)
    const competencies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      competencies,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limitCount
    }
  } catch (error) {
    console.error('Error getting competencies with pagination:', error)
    throw error
  }
}

export const getCompetenciesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'competencies'),
      where('category', '==', category)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting competencies by category:', error)
    throw error
  }
}

export const searchCompetencies = async (searchTerm, filters = {}) => {
  try {
    let q = collection(db, 'competencies')

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category))
    }
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty))
    }

    const querySnapshot = await getDocs(q)
    let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Client-side search filter (Firestore doesn't support full-text search)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      results = results.filter(comp =>
        comp.name.toLowerCase().includes(lowerSearch) ||
        comp.description?.toLowerCase().includes(lowerSearch) ||
        comp.keywords?.some(k => k.toLowerCase().includes(lowerSearch))
      )
    }

    return results
  } catch (error) {
    console.error('Error searching competencies:', error)
    throw error
  }
}

export const updateCompetency = async (competencyId, updates) => {
  try {
    await updateDoc(doc(db, 'competencies', competencyId), updates)
    return { success: true }
  } catch (error) {
    console.error('Error updating competency:', error)
    throw error
  }
}

// ============================================================================
// RESOURCES COLLECTION
// ============================================================================

export const createResource = async (resourceData) => {
  try {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...resourceData,
      createdAt: serverTimestamp(),
      rating: resourceData.rating || 0,
      reviewCount: 0
    })
    return { id: docRef.id, ...resourceData }
  } catch (error) {
    console.error('Error creating resource:', error)
    throw error
  }
}

export const getResource = async (resourceId) => {
  try {
    const resourceDoc = await getDoc(doc(db, 'resources', resourceId))
    if (resourceDoc.exists()) {
      return { id: resourceDoc.id, ...resourceDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting resource:', error)
    throw error
  }
}

export const getAllResources = async (options = {}) => {
  try {
    console.log('🔍 Fetching resources from Firestore...');

    const resourcesRef = collection(db, 'resources');
    let q = resourcesRef;

    // Apply filters if provided
    if (options.type) {
      q = query(q, where('type', '==', options.type));
      console.log('  Filtering by type:', options.type);
    }
    if (options.difficulty) {
      q = query(q, where('difficulty', '==', options.difficulty));
      console.log('  Filtering by difficulty:', options.difficulty);
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
      console.log('  Limiting to:', options.limit);
    }

    const querySnapshot = await getDocs(q);
    const resources = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`✓ Fetched ${resources.length} resources from Firestore`);
    return resources;
  } catch (error) {
    console.error('❌ Error getting resources:', error);
    throw error;
  }
}

export const getResourcesByCompetency = async (competencyId) => {
  try {
    const q = query(
      collection(db, 'resources'),
      where('competencyIds', 'array-contains', competencyId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting resources by competency:', error)
    throw error
  }
}

export const updateResource = async (resourceId, updates) => {
  try {
    await updateDoc(doc(db, 'resources', resourceId), updates)
    return { success: true }
  } catch (error) {
    console.error('Error updating resource:', error)
    throw error
  }
}

export const rateResource = async (resourceId, userId, rating, review = '') => {
  try {
    // Add review to subcollection
    const reviewData = {
      userId,
      rating,
      review,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'resources', resourceId, 'reviews'), reviewData)

    // Update resource average rating (you'll need to recalculate this)
    // For now, we'll just increment review count
    const resourceRef = doc(db, 'resources', resourceId)
    const resourceDoc = await getDoc(resourceRef)

    if (resourceDoc.exists()) {
      const currentData = resourceDoc.data()
      const newReviewCount = (currentData.reviewCount || 0) + 1
      const currentRating = currentData.rating || 0
      const newRating = ((currentRating * (newReviewCount - 1)) + rating) / newReviewCount

      await updateDoc(resourceRef, {
        rating: newRating,
        reviewCount: newReviewCount
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error rating resource:', error)
    throw error
  }
}

// ============================================================================
// LEARNING PATHS COLLECTION
// ============================================================================

export const createLearningPath = async (userId, pathData) => {
  try {
    const docRef = await addDoc(collection(db, 'learningPaths'), {
      userId,
      ...pathData,
      status: pathData.status || 'active',
      progress: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, userId, ...pathData }
  } catch (error) {
    console.error('Error creating learning path:', error)
    throw error
  }
}

export const getLearningPath = async (pathId) => {
  try {
    const pathDoc = await getDoc(doc(db, 'learningPaths', pathId))
    if (pathDoc.exists()) {
      return { id: pathDoc.id, ...pathDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting learning path:', error)
    throw error
  }
}

export const getUserLearningPaths = async (userId) => {
  try {
    const q = query(
      collection(db, 'learningPaths'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting user learning paths:', error)
    throw error
  }
}

export const updateLearningPath = async (pathId, updates) => {
  try {
    await updateDoc(doc(db, 'learningPaths', pathId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating learning path:', error)
    throw error
  }
}

export const updatePathProgress = async (pathId, progress) => {
  try {
    const updates = {
      progress,
      updatedAt: serverTimestamp()
    }

    // If progress is 100%, mark as completed
    if (progress >= 100) {
      updates.status = 'completed'
      updates.completedAt = serverTimestamp()
    }

    await updateDoc(doc(db, 'learningPaths', pathId), updates)
    return { success: true }
  } catch (error) {
    console.error('Error updating path progress:', error)
    throw error
  }
}

export const deleteLearningPath = async (pathId) => {
  try {
    await deleteDoc(doc(db, 'learningPaths', pathId))
    return { success: true }
  } catch (error) {
    console.error('Error deleting learning path:', error)
    throw error
  }
}

// ============================================================================
// ASSESSMENTS COLLECTION
// ============================================================================

export const createAssessment = async (assessmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'assessments'), {
      ...assessmentData,
      completedAt: serverTimestamp()
    })
    return { id: docRef.id, ...assessmentData }
  } catch (error) {
    console.error('Error creating assessment:', error)
    throw error
  }
}

// Save assessment results
export const saveAssessmentResults = async (userId, resultsData) => {
  try {
    const docRef = await addDoc(collection(db, 'assessments'), {
      userId,
      ...resultsData,
      completedAt: serverTimestamp()
    })
    return { id: docRef.id, success: true }
  } catch (error) {
    console.error('Error saving assessment results:', error)
    throw error
  }
}

// Update user competency profile
export const updateUserCompetencyProfile = async (userId, competencyScores) => {
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'competencies')

    // Transform scores into profile format
    const profileData = {}
    Object.entries(competencyScores).forEach(([competencyId, data]) => {
      const percentage = Math.round((data.correct / data.total) * 100)
      let level = 'Novice'
      if (percentage >= 80) level = 'Advanced'
      else if (percentage >= 60) level = 'Intermediate'
      else if (percentage >= 40) level = 'Beginner'

      profileData[competencyId] = {
        name: data.name,
        score: percentage,
        level,
        lastAssessed: serverTimestamp(),
        totalQuestions: data.total,
        correctAnswers: data.correct
      }
    })

    await setDoc(profileRef, profileData, { merge: true })
    return { success: true }
  } catch (error) {
    console.error('Error updating competency profile:', error)
    throw error
  }
}

export const getAssessment = async (assessmentId) => {
  try {
    const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId))
    if (assessmentDoc.exists()) {
      return { id: assessmentDoc.id, ...assessmentDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting assessment:', error)
    throw error
  }
}

export const getUserAssessments = async (userId) => {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting user assessments:', error)
    throw error
  }
}

export const getAssessmentsByCompetency = async (userId, competencyId) => {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      where('competencyId', '==', competencyId),
      orderBy('completedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting assessments by competency:', error)
    throw error
  }
}

export const getLatestAssessmentScore = async (userId, competencyId) => {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      where('competencyId', '==', competencyId),
      orderBy('completedAt', 'desc'),
      limit(1)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return doc.data().score
    }

    return null
  } catch (error) {
    console.error('Error getting latest assessment score:', error)
    throw error
  }
}

// ============================================================================
// QUESTIONS COLLECTION (for assessments)
// ============================================================================

export const createQuestion = async (questionData) => {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...questionData,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...questionData }
  } catch (error) {
    console.error('Error creating question:', error)
    throw error
  }
}

export const getQuestion = async (questionId) => {
  try {
    const questionDoc = await getDoc(doc(db, 'questions', questionId))
    if (questionDoc.exists()) {
      return { id: questionDoc.id, ...questionDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting question:', error)
    throw error
  }
}

export const getQuestionsByCompetency = async (competencyId, difficulty = null) => {
  try {
    let q = query(
      collection(db, 'questions'),
      where('competencyId', '==', competencyId)
    )

    if (difficulty) {
      q = query(q, where('difficulty', '==', difficulty))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting questions by competency:', error)
    throw error
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const batchCreateCompetencies = async (competenciesArray) => {
  try {
    const promises = competenciesArray.map(comp => createCompetency(comp))
    const results = await Promise.all(promises)
    return { success: true, count: results.length }
  } catch (error) {
    console.error('Error batch creating competencies:', error)
    throw error
  }
}

export const batchCreateResources = async (resourcesArray) => {
  try {
    const promises = resourcesArray.map(res => createResource(res))
    const results = await Promise.all(promises)
    return { success: true, count: results.length }
  } catch (error) {
    console.error('Error batch creating resources:', error)
    throw error
  }
}

export const batchCreateQuestions = async (questionsArray) => {
  try {
    const promises = questionsArray.map(q => createQuestion(q))
    const results = await Promise.all(promises)
    return { success: true, count: results.length }
  } catch (error) {
    console.error('Error batch creating questions:', error)
    throw error
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const timestampToDate = (timestamp) => {
  if (!timestamp) return null
  if (timestamp.toDate) {
    return timestamp.toDate()
  }
  return new Date(timestamp)
}

export const dateToTimestamp = (date) => {
  return Timestamp.fromDate(date)
}
