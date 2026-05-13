import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

const URGENCY_LEVELS = [
  { value: 'Critical', emoji: '🔴', label: 'Critical',
    desc: 'Needed within hours',    border: 'border-red-500',
    bg: 'bg-red-50', text: 'text-red-700' },
  { value: 'Urgent',   emoji: '🟡', label: 'Urgent',
    desc: 'Needed within 24 hours', border: 'border-yellow-500',
    bg: 'bg-yellow-50', text: 'text-yellow-700' },
  { value: 'Normal',   emoji: '🟢', label: 'Normal',
    desc: 'Needed within a few days', border: 'border-green-500',
    bg: 'bg-green-50', text: 'text-green-700' },
];

const RequestBlood = () => {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({
    bloodType: 'A+', hospital: '', urgency: 'Urgent',
    unitsNeeded: 1, location: { district: 'Colombo', city: '' }, notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange         = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleLocationChange = (e) => setFormData({
    ...formData, location: { ...formData.location, [e.target.name]: e.target.value }
  });

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/requests`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post request';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="text-6xl mb-4">🩸</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Posted!</h2>
          <p className="text-gray-500 mb-4">{success.message}</p>
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#FFF5F5' }}>
            <p className="text-lg font-bold" style={{ color: '#C0171D' }}>
              {success.matchingDonors} eligible donor(s) found nearby
            </p>
            <p className="text-sm text-gray-500 mt-1">
              They will be notified about your request
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/browse')}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#C0171D' }}>
              Browse All Requests
            </button>
            <button onClick={() => navigate('/my-activity')}
              className="px-6 py-2 rounded-lg font-medium border-2 text-gray-700"
              style={{ borderColor: '#1B2A4A' }}>
              My Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800"> Request Blood</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below. Eligible donors in your district will be notified.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm">⚠️ {error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Blood Type */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4"> Blood Type Required</h2>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map(bt => (
              <button key={bt} type="button"
                onClick={() => setFormData({ ...formData, bloodType: bt })}
                className={`py-3 rounded-xl font-bold text-lg border-2 transition
                  ${formData.bloodType === bt
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                style={formData.bloodType === bt ? { backgroundColor: '#C0171D' } : {}}
              >{bt}</button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4"> Urgency Level</h2>
          <div className="grid grid-cols-3 gap-3">
            {URGENCY_LEVELS.map(({ value, emoji, label, desc, border, bg, text }) => (
              <button key={value} type="button"
                onClick={() => setFormData({ ...formData, urgency: value })}
                className={`p-4 rounded-xl border-2 text-center transition
                  ${formData.urgency === value
                    ? `${border} ${bg}`
                    : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-2xl mb-1">{emoji}</div>
                <div className={`font-semibold text-sm
                  ${formData.urgency === value ? text : 'text-gray-700'}`}>{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hospital & Location */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700"> Hospital & Location</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Hospital Name</label>
            <input name="hospital" placeholder="e.g. Colombo National Hospital" required
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none"
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
            <select name="district" onChange={handleLocationChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              City / Town <span className="text-gray-400">(optional)</span>
            </label>
            <input name="city" placeholder="e.g. Colombo 08" onChange={handleLocationChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none"
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'} />
          </div>
        </div>

        {/* Units + Notes */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700"> Additional Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Units of Blood Needed
            </label>
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => setFormData({ ...formData, unitsNeeded: Math.max(1, formData.unitsNeeded - 1) })}
                className="w-10 h-10 rounded-full border-2 border-gray-300 font-bold hover:border-red-400">−</button>
              <span className="text-2xl font-bold w-8 text-center" style={{ color: '#C0171D' }}>
                {formData.unitsNeeded}
              </span>
              <button type="button"
                onClick={() => setFormData({ ...formData, unitsNeeded: Math.min(10, formData.unitsNeeded + 1) })}
                className="w-10 h-10 rounded-full border-2 border-gray-300 font-bold hover:border-red-400">+</button>
              <span className="text-sm text-gray-400">unit(s)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Additional Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea name="notes" rows={3} onChange={handleChange}
              placeholder="e.g. Patient details, ward number..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 resize-none"
              onFocus={e => e.target.style.borderColor = '#C0171D'}
              onBlur={e  => e.target.style.borderColor = '#D1D5DB'} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-lg
                     transition disabled:opacity-50"
          style={{ backgroundColor: '#C0171D' }}>
          {loading ? 'Posting Request...' : 'Post Blood Request '}
        </button>

        <p className="text-center text-xs text-gray-400">
           Requests automatically expire after 48 hours if not fulfilled.
        </p>
      </form>
    </div>
  );
};

export default RequestBlood;