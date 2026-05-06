import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// ── Constants ─────────────────────────────────────────────────
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

// Urgency levels with colors and descriptions
// Used for the urgency selector cards
const URGENCY_LEVELS = [
  {
    value: 'Critical',
    emoji: '🔴',
    label: 'Critical',
    desc: 'Needed within hours',
    border: 'border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700'
  },
  {
    value: 'Urgent',
    emoji: '🟡',
    label: 'Urgent',
    desc: 'Needed within 24 hours',
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700'
  },
  {
    value: 'Normal',
    emoji: '🟢',
    label: 'Normal',
    desc: 'Needed within a few days',
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700'
  },
];

const RequestBlood = () => {
  const { token } = useAuth();
  const navigate  = useNavigate();

  // ── Form State ────────────────────────────────────────────
  const [formData, setFormData] = useState({
    bloodType:   'A+',
    hospital:    '',
    urgency:     'Urgent',      // default urgency
    unitsNeeded: 1,
    location: {
      district: 'Colombo',
      city:     ''
    },
    notes: ''                   // optional extra info
  });

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(null); // stores success response

  // ── Handlers ─────────────────────────────────────────────

  // Update top-level form fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update nested location fields (district, city)
  const handleLocationChange = (e) => {
    setFormData({
      ...formData,
      location: { ...formData.location, [e.target.name]: e.target.value }
    });
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send request to backend with JWT token in header
      // The token identifies who is making the request
      const res = await axios.post(
        'http://localhost:5000/api/requests',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Store success response to show confirmation UI
      setSuccess(res.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────
  // Show this after successful submission instead of the form
  if (success) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="text-6xl mb-4">🩸</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Request Posted!
          </h2>
          <p className="text-gray-500 mb-4">{success.message}</p>

          {/* Show how many donors were found */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: '#FFF5F5' }}
          >
            <p className="text-lg font-bold" style={{ color: '#C0171D' }}>
              {success.matchingDonors} eligible donor(s) found nearby
            </p>
            <p className="text-sm text-gray-500 mt-1">
              They will be notified about your request
            </p>
          </div>

          {/* Action buttons after success */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/browse')}
              className="px-6 py-2 rounded-lg text-white font-medium transition"
              style={{ backgroundColor: '#C0171D' }}
            >
              Browse All Requests
            </button>
            <button
              onClick={() => navigate('/my-activity')}
              className="px-6 py-2 rounded-lg font-medium border-2 transition
                         text-gray-700 hover:bg-gray-50"
              style={{ borderColor: '#1B2A4A' }}
            >
              My Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🏥 Request Blood</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below. Eligible donors in your district will be notified.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ══ Section 1: Blood Type ══ */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            🩸 Blood Type Required
          </h2>

          {/* Grid of blood type buttons — more visual than a dropdown */}
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map(bt => (
              <button
                key={bt}
                type="button" // prevent form submit on click
                onClick={() => setFormData({ ...formData, bloodType: bt })}
                className={`py-3 rounded-xl font-bold text-lg border-2 transition
                  ${formData.bloodType === bt
                    ? 'text-white border-transparent'   // selected style
                    : 'border-gray-200 text-gray-600 hover:border-red-300'
                  }`}
                style={formData.bloodType === bt
                  ? { backgroundColor: '#C0171D' }     // logo red when selected
                  : {}
                }
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        {/* ══ Section 2: Urgency Level ══ */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            ⚡ Urgency Level
          </h2>

          {/* Three urgency cards — visual and clear */}
          <div className="grid grid-cols-3 gap-3">
            {URGENCY_LEVELS.map(({ value, emoji, label, desc, border, bg, text }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: value })}
                className={`p-4 rounded-xl border-2 text-center transition
                  ${formData.urgency === value
                    ? `${border} ${bg}`   // selected: colored border + bg
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="text-2xl mb-1">{emoji}</div>
                <div className={`font-semibold text-sm ${
                  formData.urgency === value ? text : 'text-gray-700'
                }`}>
                  {label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ══ Section 3: Hospital & Location ══ */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">
            🏥 Hospital & Location
          </h2>

          {/* Hospital name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Hospital Name
            </label>
            <input
              name="hospital"
              placeholder="e.g. Colombo National Hospital"
              required
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 transition"
              style={{ '--tw-ring-color': '#C0171D' }}
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* District dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              District
            </label>
            <select
              name="district"
              onChange={handleLocationChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         bg-white focus:outline-none transition"
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
            >
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* City — optional */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              City / Town <span className="text-gray-400">(optional)</span>
            </label>
            <input
              name="city"
              placeholder="e.g. Colombo 08"
              onChange={handleLocationChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none transition"
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </div>

        {/* ══ Section 4: Units + Notes ══ */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">📋 Additional Details</h2>

          {/* Units needed */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Units of Blood Needed
            </label>
            <div className="flex items-center gap-3">
              {/* Decrement button */}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  unitsNeeded: Math.max(1, formData.unitsNeeded - 1) // min 1
                })}
                className="w-10 h-10 rounded-full border-2 border-gray-300
                           text-gray-600 font-bold hover:border-red-400 transition"
              >
                −
              </button>

              {/* Current value display */}
              <span className="text-2xl font-bold w-8 text-center"
                style={{ color: '#C0171D' }}>
                {formData.unitsNeeded}
              </span>

              {/* Increment button */}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  unitsNeeded: Math.min(10, formData.unitsNeeded + 1) // max 10
                })}
                className="w-10 h-10 rounded-full border-2 border-gray-300
                           text-gray-600 font-bold hover:border-red-400 transition"
              >
                +
              </button>
              <span className="text-sm text-gray-400">unit(s)</span>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Additional Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="e.g. Patient details, contact instructions, ward number..."
              rows={3}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none transition resize-none"
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </div>

        {/* ══ Submit Button ══ */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-lg
                     transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#C0171D' }}
        >
          {loading ? 'Posting Request...' : 'Post Blood Request 🩸'}
        </button>

        {/* Reminder about expiry */}
        <p className="text-center text-xs text-gray-400">
          ⏰ Requests automatically expire after 48 hours if not fulfilled.
        </p>

      </form>
    </div>
  );
};

export default RequestBlood;