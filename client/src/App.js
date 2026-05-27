import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }       from './context/AuthContext';
import { Toaster }       from 'react-hot-toast'; // ← ADD THIS
import ErrorBoundary     from './components/ErrorBoundary';

// ── Pages ─────────────────────────────────────────────────────
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Browse        from './pages/Browse';
import RequestBlood  from './pages/RequestBlood';
import MyActivity    from './pages/MyActivity';
import RequestDetail from './pages/RequestDetail';
import Profile       from './pages/Profile';
import DonorGuide    from './pages/DonorGuide';
import EmailVerified from './pages/EmailVerified';

// ── Layout ────────────────────────────────────────────────────
import Layout from './components/Layout';

// ── PublicRoute ───────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
};

// ── PrivateRoute ──────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token
    ? <Layout>{children}</Layout>
    : <Navigate to="/login" />;
};

// ── App ───────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>

        {/* ── Global Toast Notifications ── */}
        {/* Must be here so toasts work on every page */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding:      '12px 16px',
              fontSize:     '14px',
              fontWeight:   '500',
              boxShadow:    '0 4px 12px rgba(0,0,0,0.15)',
            },
            success: {
              style: {
                background: '#DCFCE7',
                color:      '#15803D',
                border:     '1px solid #86EFAC',
              },
              iconTheme: {
                primary:    '#15803D',
                secondary:  '#DCFCE7',
              },
            },
            error: {
              style: {
                background: '#FEE2E2',
                color:      '#C0171D',
                border:     '1px solid #FCA5A5',
              },
              iconTheme: {
                primary:    '#C0171D',
                secondary:  '#FEE2E2',
              },
            },
          }}
        />

        <Routes>

          {/* ── Public Routes (no navbar) ── */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          {/* ── Email verification routes ── */}
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/verify-email/:token" element={
            <div className="min-h-screen flex items-center justify-center">
              <p className="text-gray-500">Verifying your email...</p>
            </div>
          } />

          {/* ── Private Routes (with Navbar + Footer via Layout) ── */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/browse" element={
            <PrivateRoute><Browse /></PrivateRoute>
          } />
          <Route path="/request-blood" element={
            <PrivateRoute><RequestBlood /></PrivateRoute>
          } />
          <Route path="/my-activity" element={
            <PrivateRoute><MyActivity /></PrivateRoute>
          } />
          <Route path="/request/:id" element={
            <PrivateRoute><RequestDetail /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />
          <Route path="/donor-guide" element={
            <PrivateRoute><DonorGuide /></PrivateRoute>
          } />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;