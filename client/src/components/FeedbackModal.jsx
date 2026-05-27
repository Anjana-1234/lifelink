import { useState } from 'react';
import axios        from 'axios';
import toast        from 'react-hot-toast';
import { useAuth }  from '../context/AuthContext';
import API_URL      from '../services/api';

// ── Feedback Modal ────────────────────────────────────────────
// Appears after requester marks request as fulfilled
// Asks: "Did the donor show up?"
const FeedbackModal = ({
  isOpen,
  onClose,
  requestId,
  donorId,
  hospital,
  onFeedbackSubmitted
}) => {
  const { token }     = useAuth();
  const [rating,      setRating]     = useState('');
  const [comment,     setComment]    = useState('');
  const [loading,     setLoading]    = useState(false);
  const [submitted,   setSubmitted]  = useState(false);

  // Don't render if not open
  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Please select thumbs up or thumbs down');
      return;
    }
    if (!donorId) {
      // No donor responded — just close
      onClose();
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/feedback`,
        { requestId, donorId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      toast.success('Feedback submitted! Thank you 🙏');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ── Backdrop ──────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >

        {submitted ? (
          // ── Success State ─────────────────────────────────
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🙏</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Thank You!
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Your feedback helps build a trustworthy
              donor community in Sri Lanka.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#C0171D' }}
            >
              Close
            </button>
          </div>

        ) : (
          <>
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Rate Your Donor 🩸
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600
                           text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* ── Hospital Info ── */}
            {hospital && (
              <div
                className="rounded-xl p-3 mb-4 text-sm"
                style={{
                  backgroundColor: '#FFF5F5',
                  border:          '1px solid #FEE2E2'
                }}
              >
                <p className="text-gray-600">
                  🏥 <strong>{hospital}</strong>
                </p>
              </div>
            )}

            {/* ── Rating Question ── */}
            <p className="font-semibold text-gray-700 mb-3 text-center text-sm">
              Did the donor show up and help?
            </p>

            <div className="flex gap-3 mb-4">

              {/* Thumbs Up */}
              <button
                onClick={() => setRating('positive')}
                className={`flex-1 flex flex-col items-center gap-2
                            py-4 rounded-xl border-2 transition
                  ${rating === 'positive'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'}`}
              >
                <span className="text-4xl">👍</span>
                <span
                  className={`text-xs font-bold
                    ${rating === 'positive'
                      ? 'text-green-700'
                      : 'text-gray-500'}`}
                >
                  Yes, showed up!
                </span>
              </button>

              {/* Thumbs Down */}
              <button
                onClick={() => setRating('negative')}
                className={`flex-1 flex flex-col items-center gap-2
                            py-4 rounded-xl border-2 transition
                  ${rating === 'negative'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'}`}
              >
                <span className="text-4xl">👎</span>
                <span
                  className={`text-xs font-bold
                    ${rating === 'negative'
                      ? 'text-red-700'
                      : 'text-gray-500'}`}
                >
                  Didn't show up
                </span>
              </button>
            </div>

            {/* ── Optional Comment ── */}
            <div className="mb-5">
              <label className="block text-xs font-medium
                                text-gray-500 mb-1">
                Comment <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={2}
                maxLength={300}
                className="w-full border border-gray-300 rounded-lg
                           px-3 py-2 text-sm focus:outline-none
                           resize-none transition"
                onFocus={e => e.target.style.borderColor = '#C0171D'}
                onBlur={e  => e.target.style.borderColor = '#D1D5DB'}
              />
              <p className="text-xs text-gray-400 mt-0.5 text-right">
                {comment.length}/300
              </p>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border-2 text-sm
                           text-gray-600 font-medium transition
                           hover:bg-gray-50"
                style={{ borderColor: '#D1D5DB' }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !rating}
                className="flex-1 py-2.5 rounded-xl text-white text-sm
                           font-semibold transition disabled:opacity-50"
                style={{ backgroundColor: '#C0171D' }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              Feedback helps build trust in our community
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;