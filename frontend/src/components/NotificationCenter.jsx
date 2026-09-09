import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, Trophy, Target, Award, Calendar, TrendingUp, Briefcase } from 'lucide-react'
import { db, auth } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, deleteDoc, where } from 'firebase/firestore'

const NotificationCenter = ({ onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!auth.currentUser) return

    const notificationsRef = collection(db, 'users', auth.currentUser.uid, 'notifications')
    const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(50))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))
      setNotifications(notificationData)
      setUnreadCount(notificationData.filter(n => !n.read).length)
    })

    return () => unsubscribe()
  }, [])

  const markAsRead = async (notificationId) => {
    if (!auth.currentUser) return
    const notifRef = doc(db, 'users', auth.currentUser.uid, 'notifications', notificationId)
    await updateDoc(notifRef, { read: true })
  }

  const markAllAsRead = async () => {
    if (!auth.currentUser) return
    const unreadNotifications = notifications.filter(n => !n.read)
    await Promise.all(
      unreadNotifications.map(n =>
        updateDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', n.id), { read: true })
      )
    )
  }

  const deleteNotification = async (notificationId) => {
    if (!auth.currentUser) return
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notificationId))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'goal_created':
      case 'goal_completed':
        return <Target className="w-5 h-5 text-purple-600" />
      case 'milestone_achieved':
        return <Trophy className="w-5 h-5 text-yellow-600" />
      case 'path_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cert_prep_started':
        return <Award className="w-5 h-5 text-orange-600" />
      case 'career_path_started':
        return <Briefcase className="w-5 h-5 text-blue-600" />
      case 'daily_reminder':
        return <Calendar className="w-5 h-5 text-indigo-600" />
      case 'progress_update':
        return <TrendingUp className="w-5 h-5 text-cyan-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center sm:justify-end z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full sm:w-96 max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                We'll notify you about your progress and achievements
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter
