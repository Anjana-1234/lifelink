import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ── Pages ─────────────────────────────────────────────────────
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Browse       from './pages/Browse';
import RequestBlood from './pages/RequestBlood';
import MyActivity   from './pages/MyActivity';
import RequestDetail from './pages/RequestDetail';

// ── Layout ────────────────────────────────────────────────────
import Layout from './components/Layout';

// ── Route Guards ──────────────────────────────────────────────

// PublicRoute: if already logged in, redirect to dashboard
// Prevents logged-in users from seeing login/register pages
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
};

// PrivateRoute: if NOT logged in, redirect to login
// Protects pages that require authentication
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token
    ? <Layout>{children}</Layout>  // wrap with navbar layout
    : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes (no navbar) ── */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        {/* ── Private Routes (with navbar via Layout) ── */}
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

        {/* ── Default ── */}
        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;