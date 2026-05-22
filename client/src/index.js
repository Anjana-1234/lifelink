import React    from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App      from './App';
import { AuthProvider }         from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// ── Providers wrap App here so they're available everywhere ───
// AuthProvider     → gives useAuth() to all components
// NotificationProvider → gives useNotifications() to all components
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);