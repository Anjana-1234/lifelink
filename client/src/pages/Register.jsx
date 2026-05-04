import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Eye Icons (SVG) ─────────────────────────────────────────
// Same icons used in Login page — consistent across the app
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

// ── Sri Lankan Districts ─────────────────────────────────────
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

// ── Blood Types ──────────────────────────────────────────────
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ── Health Flag Questions ────────────────────────────────────
// Each item: [stateKey, emoji, label]
// These questions determine if user is currently eligible to donate
const HEALTH_FLAGS = [
  ['hasFever',          '🤒', 'Currently have fever or flu'],
  ['onAntibiotics',     '💊', 'Currently on antibiotics'],
  ['recentSurgery',     '🏥', 'Had surgery in the last 6 months'],
  ['recentTattoo',      '🖊️', 'Got a tattoo or piercing in last 6 months'],
  ['isPregnant',        '🤰', 'Currently pregnant or breastfeeding'],
  ['hasChronicDisease', '❤️‍🩹', 'Have a chronic disease (HIV, Hepatitis, Diabetes, etc.)'],
];

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  // ── State ────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  // Basic account information
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });

  // Health profile — collected at registration so donors
  // can be matched instantly in emergencies without extra steps
  const [donorData, setDonorData] = useState({
    bloodType: 'A+',
    location:  { district: 'Colombo', city: '' },
    age:       '',
    weight:    '',
    healthFlags: {
      hasFever:          false,
      onAntibiotics:     false,
      recentSurgery:     false,
      recentTattoo:      false,
      isPregnant:        false,
      hasChronicDisease: false,
    }
  });

  // ── Handlers ─────────────────────────────────────────────

  // Updates basic form fields (name, email, password, phone)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Updates donor number fields (age, weight)
  const handleDonorChange = (e) => {
    setDonorData({ ...donorData, [e.target.name]: e.target.value });
  };

  // Updates location fields (district, city)
  const handleLocationChange = (e) => {
    setDonorData({
      ...donorData,
      location: { ...donorData.location, [e.target.name]: e.target.value }
    });
  };

  // Toggles a health flag checkbox on/off
  const handleHealthFlag = (flag) => {
    setDonorData({
      ...donorData,
      healthFlags: {
        ...donorData.healthFlags,
        [flag]: !donorData.healthFlags[flag] // flip true→false or false→true
      }
    });
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send basic info + health profile together to backend
      await register({ ...formData, donorDetails: donorData });

      // After successful registration, go to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-red-50 py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🩸</div>
          <h1 className="text-3xl font-bold text-red-600">LifeLink</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ════════════════════════════════
              SECTION 1 — Basic Information
          ════════════════════════════════ */}
          <div className="border-b border-gray-100 pb-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Basic Information
            </h2>

            <div className="space-y-3">

              {/* Full Name */}
              <input
                name="name"
                placeholder="Full Name"
                required
                autoComplete="name"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />

              {/* Email */}
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                autoComplete="email"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />

              {/* Password with Eye Toggle */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 characters)"
                  required
                  autoComplete="new-password"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12
                             focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                />
                {/* Eye toggle — type="button" stops it from submitting the form */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Phone */}
              <input
                name="phone"
                placeholder="Phone Number (e.g. 0771234567)"
                required
                autoComplete="tel"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
            </div>
          </div>

          {/* ════════════════════════════════
              SECTION 2 — Health Profile
              Collected at signup so donors
              are ready to help immediately
          ════════════════════════════════ */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Health Profile
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              This helps us match you instantly if someone nearby needs your blood type.
            </p>

            <div className="space-y-3">

              {/* Blood Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Blood Type
                </label>
                <select
                  onChange={(e) => setDonorData({ ...donorData, bloodType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white
                             focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                >
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  District
                </label>
                <select
                  name="district"
                  onChange={handleLocationChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white
                             focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                >
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* City — optional */}
              <input
                name="city"
                placeholder="City / Town (optional)"
                onChange={handleLocationChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />

              {/* Age & Weight — side by side */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    required
                    min="18"
                    max="65"
                    onChange={handleDonorChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  />
                  {/* Hint below the field */}
                  <p className="text-xs text-gray-400 mt-1">Must be 18–65</p>
                </div>
                <div className="flex-1">
                  <input
                    name="weight"
                    type="number"
                    placeholder="Weight (kg)"
                    required
                    min="50"
                    onChange={handleDonorChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 50kg</p>
                </div>
              </div>

              {/* Health Flag Checkboxes */}
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  ⚠️ Check any that currently apply to you:
                </p>
                {HEALTH_FLAGS.map(([flag, icon, label]) => (
                  <label
                    key={flag}
                    className="flex items-center gap-3 py-1.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={donorData.healthFlags[flag]}
                      onChange={() => handleHealthFlag(flag)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-red-700 transition">
                      {icon} {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold
                       hover:bg-red-700 transition disabled:opacity-50
                       disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account 🩸'}
          </button>
        </form>

        {/* ── Login Link ── */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;