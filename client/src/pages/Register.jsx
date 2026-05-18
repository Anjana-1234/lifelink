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

// ── Constants ─────────────────────────────────────────────────
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });

  const [donorData, setDonorData] = useState({
    bloodType: 'A+',
    location:  { district: 'Colombo', city: '' },
    age:       '',
    weight:    '',
    healthFlags: {
      hasFever: false, onAntibiotics: false, recentSurgery: false,
      recentTattoo: false, isPregnant: false, hasChronicDisease: false,
    }
  });

  const handleChange         = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDonorChange    = (e) => setDonorData({ ...donorData, [e.target.name]: e.target.value });
  const handleLocationChange = (e) => setDonorData({
    ...donorData,
    location: { ...donorData.location, [e.target.name]: e.target.value }
  });
  const handleHealthFlag = (flag) => setDonorData({
    ...donorData,
    healthFlags: { ...donorData.healthFlags, [flag]: !donorData.healthFlags[flag] }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...formData, donorDetails: donorData });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ── Full screen split layout ───────────────────────────
    <div className="min-h-screen flex p-10 bg-gray-500">

      {/* ── LEFT SIDE: Video (fixed — stays while form scrolls) ── */}
<div className="hidden md:flex md:w-2/5 relative overflow-hidden sticky top-10 h-[90vh] rounded-3xl">
        {/* Same video as login page — consistent branding */}
        <video
          src={signinVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Text content */}
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <h2 className="text-3xl font-black mb-3 leading-tight">
            Be Someone's <br/>
            <span style={{ color: '#E8353B' }}>Lifesaver</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            Register today and be ready to donate blood when
            someone nearby needs you most.
          </p>

          {/* Steps preview */}
          <div className="space-y-3">
            {[
              { num: '1', text: 'Create your account'        },
              { num: '2', text: 'Add your health profile'    },
              { num: '3', text: 'Get notified & save lives'  },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center
                             text-white text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: '#C0171D' }}
                >
                  {num}
                </div>
                <p className="text-white/80 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Register Form (scrollable) ────────── */}
      <div className="w-full md:w-3/5 overflow-y-auto bg-gray-850">
        <div className="min-h-full flex items-start justify-center py-10 px-6">
          <div className="w-full max-w-lg">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-2">🩸</div>
              <h1 className="text-3xl font-bold text-red-600">LifeLink</h1>
              <p className="text-gray-500 mt-1">Create your account</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── SECTION 1: Basic Information ── */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xs font-semibold text-gray-400
                               uppercase tracking-widest mb-4">
                  Basic Information
                </h2>
                <div className="space-y-3">

                  <input name="name" placeholder="Full Name" required
                    autoComplete="name" onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-red-400 transition" />

                  <input name="email" type="email" placeholder="Email Address" required
                    autoComplete="email" onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-red-400 transition" />

                  {/* Password with eye toggle */}
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 characters)"
                      required autoComplete="new-password" onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12
                                 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-gray-400 hover:text-red-500 transition-colors">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  <input name="phone" placeholder="Phone Number (e.g. 0771234567)"
                    required autoComplete="tel" onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-red-400 transition" />
                </div>
              </div>

              {/* ── SECTION 2: Health Profile ── */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xs font-semibold text-gray-400
                               uppercase tracking-widest mb-1">
                  Health Profile
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Helps us match you instantly when someone needs your blood type.
                </p>

                <div className="space-y-4">

                  {/* Blood Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Blood Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map(bt => (
                        <button key={bt} type="button"
                          onClick={() => setDonorData({ ...donorData, bloodType: bt })}
                          className={`py-2 rounded-xl font-bold border-2 transition text-sm
                            ${donorData.bloodType === bt
                              ? 'text-white border-transparent'
                              : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                          style={donorData.bloodType === bt
                            ? { backgroundColor: '#C0171D' } : {}}>
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      District
                    </label>
                    <select name="district" onChange={handleLocationChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                                 bg-white focus:outline-none focus:ring-2 focus:ring-red-400">
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* City */}
                  <input name="city" placeholder="City / Town (optional)"
                    onChange={handleLocationChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-red-400 transition" />

                  {/* Age & Weight */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input name="age" type="number" placeholder="Age"
                        required min="18" max="65" onChange={handleDonorChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                                   focus:outline-none focus:ring-2 focus:ring-red-400" />
                      <p className="text-xs text-gray-400 mt-1">Must be 18–65</p>
                    </div>
                    <div className="flex-1">
                      <input name="weight" type="number" placeholder="Weight (kg)"
                        required min="50" onChange={handleDonorChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                                   focus:outline-none focus:ring-2 focus:ring-red-400" />
                      <p className="text-xs text-gray-400 mt-1">Minimum 50kg</p>
                    </div>
                  </div>

                  {/* Health Flags */}
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      ⚠️ Check any that currently apply to you:
                    </p>
                    {HEALTH_FLAGS.map(([flag, icon, label]) => (
                      <label key={flag}
                        className="flex items-center gap-3 py-1.5 cursor-pointer group">
                        <input type="checkbox"
                          checked={donorData.healthFlags[flag]}
                          onChange={() => handleHealthFlag(flag)}
                          className="w-4 h-4 accent-red-600 cursor-pointer" />
                        <span className="text-sm text-gray-700
                                         group-hover:text-red-700 transition">
                          {icon} {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold
                           hover:bg-red-700 transition disabled:opacity-50
                           disabled:cursor-not-allowed">
                {loading ? 'Creating account...' : 'Create Account '}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-red-100 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;