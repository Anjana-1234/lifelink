import { createContext, useState, useContext,
         useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import API_URL from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  // ── Fetch notifications ───────────────────────────────────
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

  // ── Try Socket.io, fallback to polling ────────────────────
  useEffect(() => {
    if (!token || !user) return;

    // First fetch immediately
    fetchNotifications();

    // Try to connect socket
    let socket = null;
    let pollInterval = null;

    const connectSocket = async () => {
      try {
        // Dynamic import — won't crash if not installed
        const { io } = await import('socket.io-client');

        socket = io(API_URL, {
          transports:      ['polling', 'websocket'],
          withCredentials: true,
          timeout:         5000,
          reconnection:    true,
          reconnectionAttempts: 3
        });

        socket.on('connect', () => {
          console.log('🔌 Socket connected');
          socket.emit('register', user.id);
          // Cancel polling if socket works
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        });

        socket.on('new_notification', (notification) => {
          console.log(' Real-time notification!');
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });

        socket.on('connect_error', (err) => {
          console.log('Socket failed, using polling:', err.message);
          // Start polling as fallback
          if (!pollInterval) {
            pollInterval = setInterval(fetchNotifications, 30000);
          }
        });

      } catch (err) {
        // socket.io-client not installed — use polling
        console.log('Socket not available, using 30s polling');
        pollInterval = setInterval(fetchNotifications, 30000);
      }
    };

    connectSocket();

    // Cleanup
    return () => {
      if (socket)       socket.disconnect();
      if (pollInterval) clearInterval(pollInterval);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  // ── Mark ALL read ─────────────────────────────────────────
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

  // ── Mark ONE read ─────────────────────────────────────────
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