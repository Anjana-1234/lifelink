import { useState, useEffect } from 'react';
import { useAuth }             from '../context/AuthContext';
import axios                   from 'axios';
import toast                   from 'react-hot-toast';
import API_URL                 from '../services/api';

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
  ['hasFever','Currently have fever or flu'],
  ['onAntibiotics','Currently on antibiotics'],
  ['recentSurgery', 'Had surgery in the last 6 months'],
  ['recentTattoo', 'Got a tattoo or piercing in last 6 months'],
  ['isPregnant', 'Currently pregnant or breastfeeding'],
  ['hasChronicDisease', 'Have a chronic disease (HIV, Hepatitis, Diabetes, etc.)'],
];

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Profile = () => {
  const { token, user } = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [activeTab,    setActiveTab]    = useState('personal');
  const [donorProfile, setDonorProfile] = useState(null);

  // Personal info — includes sex
  const [personalForm, setPersonalForm] = useState({
    name:  '',
    phone: '',
    email: '',
    sex:   ''  // 'male' or 'female'
  });

  // Health profile
  const [healthForm, setHealthForm] = useState({
    bloodType: 'A+',
    location:  { district: 'Colombo', city: '' },
    age:       '',
    weight:    '',
    healthFlags: {
      hasFever: false, onAntibiotics: false, recentSurgery: false,
      recentTattoo: false, isPregnant: false, hasChronicDisease: false,
    }
  });

  // ── Load data on mount ────────────────────────────────────
  useEffect(() => { fetchProfileData(); }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [userRes, donorRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/donors/profile`,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const userData  = userRes.data.user;
      const donorData = donorRes.data.donor;

      // Populate personal form including sex
      setPersonalForm({
        name:  userData.name  || '',
        phone: userData.phone || '',
        email: userData.email || '',
        sex:   userData.sex   || ''
      });

      if (donorData) {
        setDonorProfile(donorData);
        setHealthForm({
          bloodType:   donorData.bloodType || 'A+',
          location:    donorData.location  || { district: 'Colombo', city: '' },
          age:         donorData.age       || '',
          weight:      donorData.weight    || '',
          healthFlags: donorData.healthFlags || {
            hasFever: false, onAntibiotics: false, recentSurgery: false,
            recentTattoo: false, isPregnant: false, hasChronicDisease: false,
          }
        });
      }
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // ── Save Personal Info ────────────────────────────────────
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/auth/update`,
        { name: personalForm.name, phone: personalForm.phone, sex: personalForm.sex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Personal info updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // ── Save Health Profile ───────────────────────────────────
  const handleSaveHealth = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/donors/profile`,
        healthForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Health profile updated! ');
      fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update health profile');
    } finally {
      setSaving(false);
    }
  };

  const handleHealthFlag = (flag) => {
    setHealthForm({
      ...healthForm,
      healthFlags: { ...healthForm.healthFlags, [flag]: !healthForm.healthFlags[flag] }
    });
  };

  // Hide pregnant option for males
  const visibleFlags = HEALTH_FLAGS.filter(([flag]) => {
    if (flag === 'isPregnant' && personalForm.sex === 'male') return false;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-3">👤</div>
        <p>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">

      {/* ── Header with Avatar ── */}
      {/* After user name and email, add verified badge */}
      <div className="flex flex-wrap gap-2 mt-2">

        {/* Sex badge */}
        {personalForm.sex && (
          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
            {personalForm.sex === 'male' ? '♂ Male' : '♀ Female'}
          </span>
        )}

        {/* Email verification badge */}
        {user?.isEmailVerified ? (
          <span
            className="px-3 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'rgba(21,128,61,0.3)',
              border: '1px solid #86EFAC',
              color: 'white'
            }}
          >
            ✅ Email Verified
          </span>
        ) : (
          <span
            className="px-3 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'rgba(180,83,9,0.3)',
              border: '1px solid #FDE68A',
              color: 'white'
            }}
          >
            ⚠️ Email Not Verified
          </span>
        )}

        {/* Donor eligibility badge */}
        {donorProfile && (
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: donorProfile.isEligible
                ? 'rgba(21,128,61,0.3)' : 'rgba(192,23,29,0.3)',
              border: `1px solid ${donorProfile.isEligible ? '#86EFAC' : '#FCA5A5'}`
            }}
          >
            {donorProfile.isEligible ? '✅ Eligible to donate' : '⏸️ Not eligible'}
          </span>
        )}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl shadow p-1 w-fit">
        {[
          { key: 'personal', label: ' Personal Info'  },
          { key: 'health',   label: ' Health Profile' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition
              ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
            style={activeTab === tab.key ? { backgroundColor: '#C0171D' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          TAB 1: PERSONAL INFO
      ════════════════════════════════════════ */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-5">Personal Information</h2>

          <form onSubmit={handleSavePersonal} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                value={personalForm.name}
                onChange={e => setPersonalForm({ ...personalForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none transition"
                onFocus={e => e.target.style.borderColor = '#C0171D'}
                onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                value={personalForm.phone}
                onChange={e => setPersonalForm({ ...personalForm, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none transition"
                onFocus={e => e.target.style.borderColor = '#C0171D'}
                onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            {/* Email — read only */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
                <span className="text-gray-400 font-normal ml-1">(cannot be changed)</span>
              </label>
              <input
                value={personalForm.email}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                           bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* ── Sex Selection ── */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Sex
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'male',   label: ' Male' },
                  { value: 'female', label: ' Female' },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPersonalForm({ ...personalForm, sex: value })}
                    className={`flex-1 flex items-center justify-center gap-2
                                py-2.5 rounded-xl border-2 font-medium text-sm transition
                      ${personalForm.sex === value
                        ? 'text-white border-transparent'
                        : 'border-gray-300 text-gray-600 hover:border-red-400'
                      }`}
                    style={personalForm.sex === value
                      ? { backgroundColor: '#C0171D' } : {}}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl text-white font-semibold
                         transition disabled:opacity-50"
              style={{ backgroundColor: '#C0171D' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB 2: HEALTH PROFILE
      ════════════════════════════════════════ */}
      {activeTab === 'health' && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-1">Health Profile</h2>
          <p className="text-xs text-gray-400 mb-5">
            Keep this updated so we can match you accurately in emergencies.
          </p>

          <form onSubmit={handleSaveHealth} className="space-y-5">

            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Blood Type</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(bt => (
                  <button key={bt} type="button"
                    onClick={() => setHealthForm({ ...healthForm, bloodType: bt })}
                    className={`py-2.5 rounded-xl font-bold border-2 transition
                      ${healthForm.bloodType === bt
                        ? 'text-white border-transparent'
                        : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                    style={healthForm.bloodType === bt ? { backgroundColor: '#C0171D' } : {}}>
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
              <select
                value={healthForm.location?.district}
                onChange={e => setHealthForm({
                  ...healthForm,
                  location: { ...healthForm.location, district: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           bg-white focus:outline-none transition"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                City / Town <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={healthForm.location?.city || ''}
                onChange={e => setHealthForm({
                  ...healthForm,
                  location: { ...healthForm.location, city: e.target.value }
                })}
                placeholder="e.g. Colombo 07"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                           focus:outline-none transition"
                onFocus={e => e.target.style.borderColor = '#C0171D'}
                onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            {/* Age & Weight */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <input type="number" value={healthForm.age} min="18" max="65"
                  onChange={e => setHealthForm({ ...healthForm, age: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                             focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#C0171D'}
                  onBlur={e  => e.target.style.borderColor = '#D1D5DB'} />
                <p className="text-xs text-gray-400 mt-1">Must be 18–65</p>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Weight (kg)</label>
                <input type="number" value={healthForm.weight} min="50"
                  onChange={e => setHealthForm({ ...healthForm, weight: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                             focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#C0171D'}
                  onBlur={e  => e.target.style.borderColor = '#D1D5DB'} />
                <p className="text-xs text-gray-400 mt-1">Minimum 50kg</p>
              </div>
            </div>

            {/* Health Flags — pregnant hidden for males */}
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                🩸 Check any that currently apply to you:
              </p>
              {visibleFlags.map(([flag, icon, label]) => (
                <label key={flag}
                  className="flex items-center gap-3 py-1.5 cursor-pointer group">
                  <input type="checkbox"
                    checked={healthForm.healthFlags[flag] || false}
                    onChange={() => handleHealthFlag(flag)}
                    className="w-4 h-4 accent-red-600 cursor-pointer" />
                  <span className="text-sm text-gray-700 group-hover:text-red-700 transition">
                    {icon} {label}
                  </span>
                </label>
              ))}
            </div>

            {/* Eligibility Status */}
            {donorProfile && (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: donorProfile.isEligible ? '#DCFCE7' : '#FEE2E2',
                  borderLeft: `4px solid ${donorProfile.isEligible ? '#15803D' : '#C0171D'}`
                }}
              >
                <p className="font-semibold text-sm"
                  style={{ color: donorProfile.isEligible ? '#15803D' : '#C0171D' }}>
                  {donorProfile.isEligible
                    ? '✅ Currently eligible to donate'
                    : '⏸️ Currently not eligible to donate'}
                </p>
                {!donorProfile.isEligible && donorProfile.nextEligibleDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Next eligible: <strong>
                      {new Date(donorProfile.nextEligibleDate).toLocaleDateString()}
                    </strong>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Eligibility recalculates automatically when you save changes
                </p>
              </div>
            )}

            {/* Save Button */}
            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl text-white font-semibold
                         transition disabled:opacity-50"
              style={{ backgroundColor: '#C0171D' }}>
              {saving ? 'Saving...' : 'Update Health Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;