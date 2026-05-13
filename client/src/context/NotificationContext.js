import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios      from 'axios';
import { useAuth } from './AuthContext';
import API_URL    from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  // ── Fetch notifications ───────────────────────────────────
  // useCallback prevents infinite re-render loops
  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/notifications`,
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
  // Simple polling instead of WebSockets — works well for this project
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchNotifications]);

  // ── Mark ALL as read ──────────────────────────────────────
  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err.message);
    }
  };

  // ── Mark ONE as read ──────────────────────────────────────
  const markOneRead = async (id) => {
    if (!token) return;
    try {
      await axios.put(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
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

export const useNotifications = () => useContext(NotificationContext);