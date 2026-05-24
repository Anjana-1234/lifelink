import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }       from './context/AuthContext';
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
// If already logged in → redirect to dashboard
// Stops logged-in users seeing login/register pages
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
};

// ── PrivateRoute ──────────────────────────────────────────────
// If NOT logged in → redirect to login
// Wraps page with Layout (Navbar + Footer)
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
      {/* ErrorBoundary inside BrowserRouter so navigate works in error page */}
      <ErrorBoundary>
        <Routes>

          {/* ── Public Routes (no navbar) ── */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
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

          {/* ── Default redirect ── */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

          <Route path="/verify-email/:token" element={<div>Verifying...</div>} />
          <Route path="/email-verified"      element={<EmailVerified />} />

        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;