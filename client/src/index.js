import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      {/* Toaster renders toast notifications globally */}
      {/* position="top-right" matches your other project's style */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000, // auto dismiss after 3 seconds
          style: {
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#DCFCE7',
              color:       '#15803D',
              border:      '1px solid #86EFAC',
            },
            iconTheme: {
              primary:    '#15803D',
              secondary:  '#DCFCE7',
            },
          },
          error: {
            style: {
              background: '#FEE2E2',
              color:       '#C0171D',
              border:      '1px solid #FCA5A5',
            },
            iconTheme: {
              primary:    '#C0171D',
              secondary:  '#FEE2E2',
            },
          },
        }}
      />
      <App />
    </AuthProvider>
  </React.StrictMode>
);