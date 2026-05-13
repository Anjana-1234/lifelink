import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../services/api';

const URGENCY_CONFIG = {
  Critical: { color: '#C0171D', bg: '#FEE2E2', label: '🔴 Critical' },
  Urgent:   { color: '#B45309', bg: '#FEF3C7', label: '🟡 Urgent'   },
  Normal:   { color: '#15803D', bg: '#DCFCE7', label: '🟢 Normal'   },
};

const STATUS_CONFIG = {
  open:      { color: '#1D4ED8', bg: '#DBEAFE', label: '🔵 Open'      },
  fulfilled: { color: '#15803D', bg: '#DCFCE7', label: '✅ Fulfilled' },
  expired:   { color: '#6B7280', bg: '#F3F4F6', label: '⏰ Expired'   },
};

const timeAgo = (dateString) => {
  const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000);
  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)  return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const MyActivity = () => {
  const { token }  = useAuth();
  const navigate   = useNavigate();

  const [myRequests,   setMyRequests]   = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [closingId,    setClosingId]    = useState(null);
  const [activeTab,    setActiveTab]    = useState('requests');

  useEffect(() => { fetchMyData(); }, []);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      // Fetch both at the same time — faster
      const [requestsRes, donorRes] = await Promise.all([
        axios.get(`${API_URL}/api/requests/my`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/donors/profile`,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setMyRequests(requestsRes.data.requests);
      setDonorProfile(donorRes.data.donor);
    } catch (err) {
      console.error('Fetch my data error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Close Request (custom toast confirmation) ─────────────
  const handleClose = async (requestId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">
          Mark this request as fulfilled?
        </p>
        <p className="text-xs text-gray-500">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setClosingId(requestId);
              try {
                await axios.put(
                  `${API_URL}/api/requests/${requestId}/close`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Request fulfilled! Thank you for saving a life! 🩸');
                fetchMyData();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to close request');
              } finally {
                setClosingId(null);
              }
            }}
            className="flex-1 py-1.5 rounded-lg text-white text-xs font-semibold"
            style={{ backgroundColor: '#15803D' }}
          >
             Mark Fulfilled
          </button>
          <button onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold
                       border border-gray-300 text-gray-600">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000, position: 'top-center',
         style: { padding: '16px', borderRadius: '12px',
                  maxWidth: '320px', border: '1px solid #E5E7EB' } });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-3">🩸</div>
        <p>Loading your activity...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Activity</h1>
        <p className="text-gray-500 text-sm mt-1">Your blood requests and donor profile</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl shadow p-1 w-fit">
        {[
          { key: 'requests', label: ' My Requests'  },
          { key: 'donor',    label: ' Donor Profile' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition
              ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
            style={activeTab === tab.key ? { backgroundColor: '#C0171D' } : {}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MY REQUESTS ── */}
      {activeTab === 'requests' && (
        <div>
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-semibold text-gray-700 mb-2">No requests yet</h3>
              <p className="text-gray-400 text-sm mb-6">You haven't posted any blood requests.</p>
              <button onClick={() => navigate('/request-blood')}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#C0171D' }}>Post a Request</button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(request => {
                const urgency = URGENCY_CONFIG[request.urgency] || URGENCY_CONFIG.Normal;
                const status  = STATUS_CONFIG[request.status]   || STATUS_CONFIG.open;
                return (
                  <div key={request._id} className="bg-white rounded-2xl shadow p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center
                                       justify-center text-white font-black flex-shrink-0"
                          style={{ backgroundColor: '#C0171D' }}>
                          {request.bloodType}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{request.hospital}</h3>
                          <p className="text-sm text-gray-500">
                             {request.location?.city
                              ? `${request.location.city}, ` : ''}{request.location?.district}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ backgroundColor: urgency.bg, color: urgency.color }}>
                          {urgency.label}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                      <span>🩸 {request.unitsNeeded} unit(s)</span>
                      <span>👥 {request.respondents?.length || 0} donor(s) responded</span>
                      <span>🕐 {timeAgo(request.createdAt)}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => navigate(`/request/${request._id}`)}
                        className="px-4 py-1.5 text-sm rounded-lg border-2 font-medium
                                   transition hover:bg-gray-50"
                        style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}>
                        View Details
                      </button>
                      {request.status === 'open' && (
                        <button onClick={() => handleClose(request._id)}
                          disabled={closingId === request._id}
                          className="px-4 py-1.5 text-sm rounded-lg text-white
                                     font-medium transition disabled:opacity-50"
                          style={{ backgroundColor: '#15803D' }}>
                          {closingId === request._id ? 'Closing...' : ' Mark Fulfilled'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DONOR PROFILE ── */}
      {activeTab === 'donor' && (
        <div className="bg-white rounded-2xl shadow p-8">
          {donorProfile ? (
            <div>
              <div className="rounded-xl p-5 mb-6 text-center"
                style={{
                  backgroundColor: donorProfile.isEligible ? '#DCFCE7' : '#FEE2E2',
                  borderLeft: `4px solid ${donorProfile.isEligible ? '#15803D' : '#C0171D'}`
                }}>
                <div className="text-3xl mb-2">
                  {donorProfile.isEligible ? '✅' : '⏸️'}
                </div>
                <h3 className="font-bold text-lg"
                  style={{ color: donorProfile.isEligible ? '#15803D' : '#C0171D' }}>
                  {donorProfile.isEligible
                    ? 'You are eligible to donate!'
                    : 'Currently not eligible to donate'}
                </h3>
                {!donorProfile.isEligible && donorProfile.nextEligibleDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Next eligible date: <strong>
                      {new Date(donorProfile.nextEligibleDate).toLocaleDateString()}
                    </strong>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Blood Type',      value: donorProfile.bloodType,             icon: '🩸' },
                  { label: 'District',        value: donorProfile.location?.district,    icon: '📍' },
                  { label: 'City',            value: donorProfile.location?.city || '—', icon: '🏙️' },
                  { label: 'Age',             value: `${donorProfile.age} years`,        icon: '🎂' },
                  { label: 'Weight',          value: `${donorProfile.weight} kg`,        icon: '⚖️' },
                  { label: 'Total Donations', value: donorProfile.totalDonations || 0,   icon: '🏅' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="font-bold text-gray-800">{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Current Health Status:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(donorProfile.healthFlags || {}).map(([flag, value]) => {
                    if (!value) return null;
                    const labels = {
                      hasFever: '🤒 Fever', onAntibiotics: '💊 Antibiotics',
                      recentSurgery: '🏥 Recent Surgery', recentTattoo: '🖊️ Recent Tattoo',
                      isPregnant: '🤰 Pregnant', hasChronicDisease: '❤️‍🩹 Chronic Disease',
                    };
                    return (
                      <span key={flag} className="px-3 py-1 rounded-full text-xs font-medium
                                                   bg-red-100 text-red-700">
                        {labels[flag] || flag}
                      </span>
                    );
                  })}
                  {!Object.values(donorProfile.healthFlags || {}).some(Boolean) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium
                                     bg-green-100 text-green-700">
                       All health checks clear
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🩸</div>
              <h3 className="font-semibold text-gray-700 mb-2">No donor profile found</h3>
              <p className="text-gray-400 text-sm">
                Your donor profile should have been created during registration.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyActivity;