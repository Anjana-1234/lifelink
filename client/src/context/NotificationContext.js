import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios    from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  // ── Fetch notifications from backend ──────────────────────
  // useCallback prevents infinite re-render loops
  const fetchNotifications = useCallback(async () => {
    if (!token) return; // don't fetch if not logged in

    setLoading(true);
    try {
      const res = await axios.get(
        'http://localhost:5000/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Fetch notifications error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Poll every 30 seconds for new notifications ───────────
  // Simple polling — checks for new notifications automatically
  // In a production app this would use WebSockets (Socket.io)
  // But polling is simpler and works well for this project
  useEffect(() => {
    fetchNotifications(); // fetch immediately on login

    // Then fetch every 30 seconds in background
    const interval = setInterval(fetchNotifications, 30000);

    // Cleanup when component unmounts to prevent memory leaks
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Mark ALL notifications as read ───────────────────────
  // Called when user opens the bell dropdown
  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      await axios.put(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state immediately — no need to refetch
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err.message);
    }
  };

  // ── Mark ONE notification as read ────────────────────────
  // Called when user clicks a specific notification
  const markOneRead = async (id) => {
    if (!token) return;
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update only that notification in local state
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      // Decrease unread count by 1 (minimum 0)
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark one read error:', err.message);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAllRead,
      markOneRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easy access in any component
// Usage: const { unreadCount, notifications } = useNotifications();
export const useNotifications = () => useContext(NotificationContext);