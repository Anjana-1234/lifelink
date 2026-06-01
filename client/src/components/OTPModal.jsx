import { useState, useEffect, useRef } from 'react';
import axios   from 'axios';
import toast   from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API_URL from '../services/api';

const OTPModal = ({ isOpen, onClose, phone, onVerified }) => {
  const { token }  = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [step,      setStep]      = useState('send');  // 'send' | 'verify' | 'success'
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']); // 6 boxes
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(0); // resend cooldown
  const [sentTo,    setSentTo]    = useState('');

  // Refs for auto-focus between OTP input boxes
  const inputRefs = useRef([]);

  // ── Countdown timer for resend ────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Reset when modal opens ────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep('send');
      setOtp(['', '', '', '', '', '']);
      setCountdown(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Send OTP ──────────────────────────────────────────────
  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/otp/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentTo(res.data.phone);
      setStep('verify');
      setCountdown(60); // 60 second cooldown before resend
      toast.success(`OTP sent to ${res.data.phone}! 📱`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle OTP input boxes ────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-move to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move back on backspace if current box is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Verify OTP ────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/otp/verify`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep('success');
      toast.success('Phone number verified! 📱');
      if (onVerified) onVerified();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP code');
      // Clear OTP boxes on wrong code
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Handle paste (user pastes full OTP) ──────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center
                 justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Step 1: Send OTP ── */}
        {step === 'send' && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Verify Your Phone
              </h3>
              <p className="text-gray-500 text-sm">
                We'll send a 6-digit code to:
              </p>
              <p className="font-bold text-gray-800 mt-1 text-lg">
                {phone}
              </p>
            </div>

            <div
              className="rounded-xl p-3 mb-5 text-xs text-center"
              style={{
                backgroundColor: '#FFF7ED',
                border:          '1px solid #FDE68A',
                color:           '#92400E'
              }}
            >
              ⚠️ Standard SMS rates may apply.
              Make sure {phone} is correct in your profile.
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border-2 text-sm
                           text-gray-600 font-medium hover:bg-gray-50"
                style={{ borderColor: '#D1D5DB' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm
                           font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#C0171D' }}
              >
                {loading ? 'Sending...' : 'Send Code 📱'}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Enter OTP ── */}
        {step === 'verify' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                Enter Verification Code
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center mb-5">
              Code sent to <strong>{sentTo}</strong>
              <br/>
              <span className="text-xs">Expires in 10 minutes</span>
            </p>

            {/* ── 6 OTP Input Boxes ── */}
            <div
              className="flex justify-center gap-2 mb-5"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-xl font-bold
                             border-2 rounded-xl focus:outline-none
                             transition"
                  style={{
                    borderColor: digit ? '#C0171D' : '#D1D5DB',
                    color:       '#1B2A4A'
                  }}
                  onFocus={e => e.target.style.borderColor = '#C0171D'}
                  onBlur={e  => e.target.style.borderColor =
                    digit ? '#C0171D' : '#D1D5DB'
                  }
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 rounded-xl text-white font-semibold
                         mb-3 transition disabled:opacity-50"
              style={{ backgroundColor: '#C0171D' }}
            >
              {loading ? 'Verifying...' : 'Verify Code ✅'}
            </button>

            {/* Resend option */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend code in {countdown}s
                </p>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="text-xs font-medium transition"
                  style={{ color: '#C0171D' }}
                >
                  Didn't receive it? Resend code
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Phone Verified!
            </h3>
            <p className="text-gray-500 text-sm mb-2">
              Your phone number has been successfully verified.
            </p>

            {/* Verified badge preview */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2
                         rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: 'rgba(21,128,61,0.1)',
                border:          '1px solid #86EFAC',
                color:           '#15803D'
              }}
            >
              📱 Phone Verified
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#C0171D' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPModal;