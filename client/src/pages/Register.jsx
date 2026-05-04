import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sri Lankan districts for the dropdown
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Main form data
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'requester'
  });

  // Donor-specific data (only used if role === 'donor')
  const [donorData, setDonorData] = useState({
    bloodType: 'O+',
    location: { district: 'Colombo', city: '' },
    age: '', weight: '',
    healthFlags: {
      isPregnant: false, hasChronicDisease: false,
      onAntibiotics: false, recentSurgery: false,
      recentTattoo: false, hasFever: false
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDonorChange = (e) => {
    setDonorData({ ...donorData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    setDonorData({
      ...donorData,
      location: { ...donorData.location, [e.target.name]: e.target.value }
    });
  };

  // Handle health flag checkboxes
  const handleHealthFlag = (flag) => {
    setDonorData({
      ...donorData,
      healthFlags: { ...donorData.healthFlags, [flag]: !donorData.healthFlags[flag] }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        // Only include donorDetails if registering as donor
        ...(formData.role === 'donor' && { donorDetails: donorData })
      };

      await register(payload);
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">🩸 LifeLink</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic Info */}
          <input name="name" placeholder="Full Name" required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" />

          <input name="email" type="email" placeholder="Email" required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" />

          <input name="password" type="password" placeholder="Password (min 6 chars)" required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" />

          <input name="phone" placeholder="Phone Number" required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" />

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to register as:
            </label>
            <div className="flex gap-4">
              {['donor', 'requester'].map(r => (
                <button key={r} type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 py-2 rounded-lg border-2 font-medium capitalize transition
                    ${formData.role === r
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 text-gray-600'}`}>
                  {r === 'donor' ? '🩸 Donor' : '🏥 Requester'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Donor Extra Fields ── */}
          {formData.role === 'donor' && (
            <div className="border border-red-100 rounded-xl p-4 space-y-4 bg-red-50">
              <h3 className="font-semibold text-red-700">Donor Health Profile</h3>

              {/* Blood Type */}
              <select name="bloodType" onChange={handleDonorChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2">
                {BLOOD_TYPES.map(bt => <option key={bt}>{bt}</option>)}
              </select>

              {/* District */}
              <select name="district" onChange={handleLocationChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2">
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>

              <input name="city" placeholder="City (optional)"
                onChange={handleLocationChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" />

              <div className="flex gap-3">
                <input name="age" type="number" placeholder="Age" required
                  onChange={handleDonorChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                <input name="weight" type="number" placeholder="Weight (kg)" required
                  onChange={handleDonorChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>

              {/* Health Flags */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Check if any apply to you:
                </p>
                {[
                  ['hasFever',          '🤒 Currently have fever'],
                  ['onAntibiotics',     '💊 On antibiotics'],
                  ['recentSurgery',     '🏥 Surgery in last 6 months'],
                  ['recentTattoo',      '🖊️ Tattoo/piercing in last 6 months'],
                  ['isPregnant',        '🤰 Pregnant or breastfeeding'],
                  ['hasChronicDisease', '❤️‍🩹 Chronic disease (HIV, Hepatitis, etc.)'],
                ].map(([flag, label]) => (
                  <label key={flag} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox"
                      checked={donorData.healthFlags[flag]}
                      onChange={() => handleHealthFlag(flag)}
                      className="accent-red-600" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

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