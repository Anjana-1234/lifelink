import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ── Email Verified Landing Page ───────────────────────────────
// User lands here after clicking verification link in email
// URL will be: /email-verified?status=success or ?status=error
const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const status         = searchParams.get('status'); // 'success' or 'error'
  const [countdown,  setCountdown]  = useState(5);

  // Auto redirect to dashboard after 5 seconds on success
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10
                      max-w-md w-full text-center">

        {status === 'success' ? (
          <>
            {/* Success */}
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-500 mb-2">
              Your email has been successfully verified.
              You can now fully use LifeLink.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Redirecting to dashboard in {countdown}s...
            </p>

            {/* Verified badge preview */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2
                         rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: 'rgba(21,128,61,0.1)',
                border: '1px solid #86EFAC',
                color: '#15803D'
              }}
            >
              ✅ Email Verified
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl text-white font-semibold
                         transition hover:opacity-90"
              style={{ backgroundColor: '#C0171D' }}
            >
              Go to Dashboard →
            </button>
          </>
        ) : (
          <>
            {/* Error */}
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              Link Expired
            </h1>
            <p className="text-gray-500 mb-6">
              This verification link has expired or is invalid.
              You can request a new one from your profile page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 rounded-xl font-semibold
                           border-2 text-gray-700 transition hover:bg-gray-50"
                style={{ borderColor: '#1B2A4A' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 py-3 rounded-xl text-white font-semibold
                           transition hover:opacity-90"
                style={{ backgroundColor: '#C0171D' }}
              >
                My Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;