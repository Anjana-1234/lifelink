import { createContext, useState, useContext,
         useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth }  from './AuthContext';
import API_URL from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  // Keep socket reference across renders
  const socketRef = useRef(null);

  // ── Fetch notifications from backend ──────────────────────
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

  // ── Setup Socket.io connection ────────────────────────────
  useEffect(() => {
    if (!token || !user) return;

    // Connect to backend socket
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      // Register user with their ID so server can find them
      socket.emit('register', user.id);
    });

    // Listen for real-time notifications from server
    socket.on('new_notification', (notification) => {
      console.log('🔔 Real-time notification received!');

      // Add to top of notifications list
      setNotifications(prev => [notification, ...prev]);

      // Increase unread count
      setUnreadCount(prev => prev + 1);

      // Optional: browser notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // ignore if autoplay blocked
      } catch {}
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Cleanup on logout or unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  // ── Initial fetch on login ────────────────────────────────
  useEffect(() => {
    fetchNotifications();
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