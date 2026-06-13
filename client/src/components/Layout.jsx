import { useState, useEffect, useCallback } from 'react';
import { useAuth }   from '../context/AuthContext';
import axios         from 'axios';
import toast         from 'react-hot-toast';
import Navbar        from './Navbar';
import Footer        from './Footer';
import backTop       from '../assets/back-to-top.jpg';
import API_URL       from '../services/api';

const Layout = ({ children }) => {
  const { user, token, refreshUser } = useAuth();

  const [showButton, setShowButton] = useState(false);
  const [resending,  setResending]  = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const doRefresh = useCallback(async () => {
    if (token && refreshUser) {
      try { await refreshUser(); } catch (e) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { doRefresh(); }, [doRefresh]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/resend-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Verification email sent! Check your inbox. 📧');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const showBanner = user && user.isEmailVerified === false;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Verification Banner ── */}
      {showBanner && (
        <div
          className="fixed left-0 right-0 z-40 flex items-center
                     justify-between gap-3 px-4"
          style={{
            top:             '90px',
            height:          '70px',
            backgroundColor: '#FEFCE8',
            borderBottom:    '2px solid #FDE047',
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-base flex-shrink-0">📧</span>
            <p className="text-sm text-yellow-800 truncate">
              <strong>Verify your email</strong>
              {' — '}check your inbox for the link.
            </p>
          </div>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex-shrink-0 text-xs font-bold px-3 py-1.5
                       rounded-lg text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#B45309' }}
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </div>
      )}

      {/* ── Page Content ── */}
      <main
        className="flex-1"
        style={{ paddingTop: showBanner ? '112px' : '64px' }}
      >
        {children}
      </main>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Back to Top ── */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 transition-all
                     duration-300 hover:scale-110 hover:opacity-90
                     focus:outline-none shadow-lg rounded-full overflow-hidden"
          title="Back to top"
          style={{
            width:     '56px',
            height:    '56px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <img
            src={backTop}
            alt="Back to top"
            className="w-full h-full object-cover"
          />
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default Layout;