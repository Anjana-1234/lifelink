import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────
const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DISTRICTS = [
  'All', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
  'Batticaloa', 'Ampara', 'Trincomalee'
];

// Urgency badge styling config
// Used to render colored badges on each request card
const URGENCY_CONFIG = {
  Critical: { color: '#C0171D', bg: '#FEE2E2', label: '🔴 Critical' },
  Urgent:   { color: '#B45309', bg: '#FEF3C7', label: '🟡 Urgent'   },
  Normal:   { color: '#15803D', bg: '#DCFCE7', label: '🟢 Normal'   },
};

// ── Helper: Format time ago ───────────────────────────────────
// Converts a date to "2 hours ago", "3 days ago" etc.
const timeAgo = (dateString) => {
  const now      = new Date();
  const past     = new Date(dateString);
  const diffMins = Math.floor((now - past) / 60000); // difference in minutes

  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)   return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
};

const Browse = () => {
  const { token, user } = useAuth();
  const navigate        = useNavigate();

  // ── State ─────────────────────────────────────────────────
  const [requests,  setRequests]  = useState([]); // all fetched requests
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Filter state — user can filter by blood type and district
  const [filters, setFilters] = useState({
    bloodType: 'All',
    district:  'All',
  });

  // Responding state — tracks which request is being responded to
  const [responding, setResponding] = useState(null);

  // ── Fetch Requests ────────────────────────────────────────
  // useEffect runs when component mounts (page loads)
  // and again whenever filters change
  useEffect(() => {
    fetchRequests();
  }, [filters]); // dependency array — re-runs when filters change

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query string from active filters
      // Only add filter to URL if it's not "All"
      const params = new URLSearchParams();
      if (filters.bloodType !== 'All') params.append('bloodType', filters.bloodType);
      if (filters.district  !== 'All') params.append('district',  filters.district);

      // Example URL: /api/requests?bloodType=O%2B&district=Colombo
      const res = await axios.get(
        `http://localhost:5000/api/requests?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(res.data.requests);
    } catch (err) {
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Respond to Request ────────────────────────────────────
  // Called when donor clicks Accept or Decline on a request
  const handleRespond = async (requestId, action) => {
  setResponding(requestId);
  try {
    const res = await axios.put(
      `http://localhost:5000/api/requests/${requestId}/respond`,
      { action },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    //  Replace alert() with toast
    if (action === 'accept') {
      toast.success(res.data.message);
    } else {
      toast('You declined this request');
    }

    fetchRequests();
  } catch (err) {
    //  Replace alert() with toast.error
    toast.error(err.response?.data?.message || 'Failed to respond');
  } finally {
    setResponding(null);
  }
};

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Browse Blood Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {requests.length} open request(s) found
          </p>
        </div>

        {/* Quick link to post a request */}
        <button
          onClick={() => navigate('/request-blood')}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
          style={{ backgroundColor: '#C0171D' }}
        >
          + Post a Request
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">

          {/* Blood Type Filter */}
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Blood Type
            </label>
            <select
              value={filters.bloodType}
              onChange={e => setFilters({ ...filters, bloodType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                         text-sm bg-white focus:outline-none"
            >
              {BLOOD_TYPES.map(bt => <option key={bt}>{bt}</option>)}
            </select>
          </div>

          {/* District Filter */}
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              District
            </label>
            <select
              value={filters.district}
              onChange={e => setFilters({ ...filters, district: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                         text-sm bg-white focus:outline-none"
            >
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ bloodType: 'All', district: 'All' })}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-300
                         rounded-lg hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🩸</div>
          <p>Loading requests...</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && requests.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-semibold text-gray-700 mb-2">No requests found</h3>
          <p className="text-gray-400 text-sm mb-6">
            No open requests match your filters right now.
          </p>
          <button
            onClick={() => navigate('/request-blood')}
            className="px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#C0171D' }}
          >
            Post a Request
          </button>
        </div>
      )}

      {/* ── Request Cards ── */}
      {!loading && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map(request => {

            // Get urgency config for this request's badge
            const urgency = URGENCY_CONFIG[request.urgency] || URGENCY_CONFIG.Normal;

            // Check if the logged in user owns this request
            const isOwner = request.isOwner;

            return (
              <div
                key={request._id}
                className="bg-white rounded-2xl shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* ── Left: Blood Type Badge ── */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center
                               text-white text-xl font-black flex-shrink-0"
                    style={{ backgroundColor: '#C0171D' }}
                  >
                    {request.bloodType}
                  </div>

                  {/* ── Middle: Request Info ── */}
                  <div className="flex-1">

                    {/* Hospital + Urgency Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-800">
                        {request.hospital}
                      </h3>
                      {/* Urgency badge — colored based on urgency level */}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: urgency.bg,
                          color:           urgency.color
                        }}
                      >
                        {urgency.label}
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-sm text-gray-500">
                       {request.location?.city
                        ? `${request.location.city}, ${request.location.district}`
                        : request.location?.district}
                    </p>

                    {/* Units + Posted by + Time */}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span>🩸 {request.unitsNeeded} unit(s) needed</span>
                      <span>👤 {request.requesterId?.name}</span>
                      <span>🕐 {timeAgo(request.createdAt)}</span>
                      <span>
                        👥 {request.respondents?.length || 0} donor(s) responded
                      </span>
                    </div>
                  </div>

                  {/* ── Right: Action Buttons ── */}
                  <div className="flex flex-col gap-2 flex-shrink-0">

                    {/* View Detail Button — always visible */}
                    <button
                      onClick={() => navigate(`/request/${request._id}`)}
                      className="px-4 py-1.5 text-sm rounded-lg border-2 font-medium
                                 transition hover:bg-gray-50"
                      style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                    >
                      View
                    </button>

                    {/* Respond buttons — only for non-owners */}
                    {/* Owners cannot respond to their own request */}
                    {!isOwner && (
                      <button
                        onClick={() => handleRespond(request._id, 'accept')}
                        disabled={responding === request._id}
                        className="px-4 py-1.5 text-sm rounded-lg text-white
                                   font-medium transition disabled:opacity-50"
                        style={{ backgroundColor: '#C0171D' }}
                      >
                        {responding === request._id ? '...' : 'Accept 🩸'}
                      </button>
                    )}

                    {/* Owner label */}
                    {isOwner && (
                      <span className="text-xs text-gray-400 text-center">
                        Your request
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Browse;