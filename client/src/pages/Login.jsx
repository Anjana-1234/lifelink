import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import signinVideo from '../assets/signin.mp4';

// ── Eye Icons ─────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5
         c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639
         C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5
         c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5
         c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774
         M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21
         m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [formData,     setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ── Full screen split layout ───────────────────────────
    <div className="min-h-screen flex p-8 bg-gray-500">

      {/* ── LEFT SIDE: Video ─────────────────────────────── */}
      {/* Hidden on mobile, visible on medium screens and above */}
<div className="hidden md:flex md:w-2/5 relative overflow-hidden sticky top-10 h-[90vh] rounded-3xl">
        {/* Background video — autoplay, loop, muted (required for autoplay) */}
        <video
          src={signinVideo}
          autoPlay      // starts playing automatically
          loop          // replays when finished
          muted         // required for autoplay to work in browsers
          playsInline   // important for mobile browsers
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Text content on top of video */}
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <h2 className="text-4xl font-black mb-3 leading-tight">
            Every Drop <br/>
            <span style={{ color: '#ac151c' }}>Saves Lives</span>
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-6">
            Join thousands of donors across Sri Lanka who are
            ready to help in emergencies instantly.
          </p>
        </div>
      </div>

      {/* ── RIGHT SIDE: Login Form ────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center
                      px-6 py-12 bg-gray-250">
        <div className="w-full max-w-md bg-gray-300 p-8 rounded-lg shadow-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🩸</div>
            <h1 className="text-3xl font-bold text-red-600">LifeLink</h1>
            <p className="text-gray-700 mt-2">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12
                             focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-red-500 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold
                         hover:bg-red-700 transition disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-800 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;