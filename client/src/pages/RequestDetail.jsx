import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios  from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../services/api';

// ── Badge configs ─────────────────────────────────────────────
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

// ── Phone visibility component ────────────────────────────────
// Shows phone if allowed, otherwise shows lock with explanation
const PhoneDisplay = ({ phone, canSeePhone, hasAccepted, isOwner, status }) => {

  // Owner always sees their own number
  if (isOwner) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-600 text-sm">📞</span>
        <span className="text-sm font-medium text-gray-800">{phone}</span>
        <span className="text-xs text-gray-400">(your number)</span>
      </div>
    );
  }

  // Donor who accepted — show phone with success styling
  if (hasAccepted && phone) {
    return (
      <div>
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}
        >
          <span className="text-xl">📞</span>
          <div>
            <p className="text-xs text-green-700 font-medium mb-0.5">
              Contact number — revealed after acceptance
            </p>
            <p className="text-lg font-bold text-green-800">{phone}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 ml-1">
          Please contact the requester as soon as possible.
        </p>
      </div>
    );
  }

  // Request is closed — no point showing contact info
  if (status !== 'open') {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-sm">Contact info not available for closed requests</span>
      </div>
    );
  }

  // Donor who hasn't accepted yet — show lock with CTA
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}
    >
      <div className="flex items-start gap-3">
        <div>
          <p className="font-semibold text-orange-800 text-sm mb-1">
            Phone number hidden
          </p>
          <p className="text-orange-700 text-xs leading-relaxed">
            Accept this request to reveal the requester's contact number.
            This protects privacy for both parties.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const RequestDetail = () => {
  const { id }          = useParams();
  const { token, user } = useAuth();
  const navigate        = useNavigate();

  const [request,    setRequest]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [responding, setResponding] = useState(false);
  const [closing,    setClosing]    = useState(false);

  useEffect(() => { fetchRequest(); }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/requests/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequest(res.data.request);
    } catch (err) {
      setError('Request not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Accept or Decline ─────────────────────────────────────
  const handleRespond = async (action) => {
    setResponding(true);
    try {
      await axios.put(
        `${API_URL}/api/requests/${id}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (action === 'accept') {
        toast.success('You accepted! Phone number is now revealed. ');
      } else {
        toast('You declined this request.');
      }

      // Refetch — phone will now be visible after accepting
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    } finally {
      setResponding(false);
    }
  };

  // ── Mark Fulfilled (custom toast confirmation) ────────────
  const handleClose = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">
          Mark this request as fulfilled?
        </p>
        <p className="text-xs text-gray-500">
          This will close the request for all donors.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setClosing(true);
              try {
                await axios.put(
                  `${API_URL}/api/requests/${id}/close`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Request fulfilled! Thank you for saving a life! 🩸');
                fetchRequest();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to close request');
              } finally {
                setClosing(false);
              }
            }}
            className="flex-1 py-1.5 rounded-lg text-white text-xs font-semibold"
            style={{ backgroundColor: '#15803D' }}
          >
            Mark Fulfilled
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold
                       border border-gray-300 text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-center',
      style: {
        padding:      '16px',
        borderRadius: '12px',
        maxWidth:     '320px',
        border:       '1px solid #E5E7EB'
      }
    });
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-3">🩸</div>
        <p>Loading request details...</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────
  if (error || !request) return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="font-bold text-gray-700 mb-2">Request Not Found</h2>
      <p className="text-gray-400 text-sm mb-6">{error}</p>
      <button
        onClick={() => navigate('/browse')}
        className="px-6 py-2 rounded-lg text-white"
        style={{ backgroundColor: '#C0171D' }}
      >
        Back to Browse
      </button>
    </div>
  );

  // ── Derived values ────────────────────────────────────────
  const urgency    = URGENCY_CONFIG[request.urgency] || URGENCY_CONFIG.Normal;
  const status     = STATUS_CONFIG[request.status]   || STATUS_CONFIG.open;
  const isOwner    = request.isOwner    || false;
  const hasAccepted = request.hasAccepted || false;
  const canSeePhone = request.canSeePhone || false;

  // Check if current user already responded
  const myResponse = request.respondents?.find(
    r => r.donorId?.userId?.toString() === user?.id?.toString()
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500
                   hover:text-gray-700 mb-6 transition"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* ── Header Banner ── */}
        <div
          className="p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #C0171D)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl bg-white/20 flex items-center
                         justify-center text-3xl font-black"
            >
              {request.bloodType}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{request.hospital}</h1>
              <p className="text-white/80 mt-1">
                 {request.location?.city
                  ? `${request.location.city}, ` : ''}
                {request.location?.district}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ backgroundColor: urgency.bg, color: urgency.color }}
                >
                  {urgency.label}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ backgroundColor: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-6">

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Blood Type',   value: request.bloodType,   icon: '🩸' },
              { label: 'Units Needed', value: request.unitsNeeded, icon: '💉' },
              { label: 'Urgency',      value: request.urgency,     icon: '⚡' },
              { label: 'Status',       value: request.status,      icon: '📋' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xl mb-1">{icon}</div>
                <div className="font-bold text-gray-800 capitalize">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Posted By + Contact ── */}
          <div className="border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-700">👤 Posted By</h3>

            {/* Name row */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center
                           text-white font-bold text-sm"
                style={{ backgroundColor: '#1B2A4A' }}
              >
                {request.requesterId?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {request.requesterId?.name}
                </p>
                <p className="text-xs text-gray-400">Blood Requester</p>
              </div>
            </div>

            {/* ── Phone — privacy controlled ── */}
            <PhoneDisplay
              phone={request.requesterId?.phone}
              canSeePhone={canSeePhone}
              hasAccepted={hasAccepted}
              isOwner={isOwner}
              status={request.status}
            />

            {/* Show privacy notice for non-owners who haven't accepted */}
            {!isOwner && !hasAccepted && request.status === 'open' && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                🛡️ Phone privacy protected by LifeLink
              </p>
            )}
          </div>

          {/* Notes */}
          {request.notes && (
            <div
              className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
            >
              <h3 className="font-semibold text-gray-700 mb-1">Notes</h3>
              <p className="text-sm text-gray-600">{request.notes}</p>
            </div>
          )}

          {/* Donor Responses */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Donor Responses ({request.respondents?.length || 0})
            </h3>
            {request.respondents?.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl
                            p-4 text-center">
                No donors have responded yet
              </p>
            ) : (
              <div className="space-y-2">
                {request.respondents.map((r, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between
                               bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm text-gray-700">
                      Donor {index + 1}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full
                        ${r.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-500'}`}
                    >
                      {r.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Action Buttons ── */}
          {request.status === 'open' && (
            <div className="border-t pt-4 space-y-3">

              {/* Owner: close request */}
              {isOwner && (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="w-full py-3 rounded-xl text-white font-semibold
                             transition disabled:opacity-50"
                  style={{ backgroundColor: '#15803D' }}
                >
                  {closing ? 'Closing...' : 'Mark as Fulfilled'}
                </button>
              )}

              {/* Non-owner: accept or decline */}
              {!isOwner && !myResponse && !hasAccepted && (
                <div>
                  {/* Phone unlock reminder */}
                  <div
                    className="rounded-xl p-3 mb-3 text-center text-xs"
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1E40AF'
                    }}
                  >
                    💡 Accepting will reveal the requester's phone number
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond('accept')}
                      disabled={responding}
                      className="flex-1 py-3 rounded-xl text-white font-semibold
                                 transition disabled:opacity-50"
                      style={{ backgroundColor: '#C0171D' }}
                    >
                      {responding ? '...' : 'Accept & Donate'}
                    </button>
                    <button
                      onClick={() => handleRespond('decline')}
                      disabled={responding}
                      className="flex-1 py-3 rounded-xl font-semibold
                                 border-2 text-gray-600 hover:bg-gray-50
                                 transition disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Already accepted */}
              {hasAccepted && (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{
                    backgroundColor: '#DCFCE7',
                    border: '1px solid #86EFAC'
                  }}
                >
                  <p className="text-green-700 font-semibold text-sm">
                    ✅ You accepted this request
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Please contact the requester using the phone number above
                  </p>
                </div>
              )}

              {/* Declined */}
              {myResponse && myResponse.status === 'declined' && (
                <div className="bg-gray-50 text-gray-500 p-4 rounded-xl
                                text-center text-sm">
                  You declined this request
                </div>
              )}
            </div>
          )}

          {/* Fulfilled / Expired message */}
          {request.status !== 'open' && (
            <div className="bg-gray-50 text-gray-500 p-4 rounded-xl
                            text-center text-sm">
              {request.status === 'fulfilled'
                ? 'This request has been fulfilled. Thank you!'
                : 'This request has expired.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;