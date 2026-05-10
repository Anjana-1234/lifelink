import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      {/* NotificationProvider must be INSIDE AuthProvider */}
      {/* because it needs the token from AuthContext */}
      <NotificationProvider>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontSize: '14px' },
            success: {
              style: {
                background: '#DCFCE7',
                color:      '#15803D',
                border:     '1px solid #86EFAC'
              },
              iconTheme: { primary: '#15803D', secondary: '#DCFCE7' }
            },
            error: {
              style: {
                background: '#FEE2E2',
                color:      '#C0171D',
                border:     '1px solid #FCA5A5'
              },
              iconTheme: { primary: '#C0171D', secondary: '#FEE2E2' }
            }
          }}
        />

        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);