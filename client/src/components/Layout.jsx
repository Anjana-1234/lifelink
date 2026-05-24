import { useState, useEffect }  from 'react';
import { useAuth }              from '../context/AuthContext';
import axios                    from 'axios';
import toast                    from 'react-hot-toast';
import Navbar                   from './Navbar';
import Footer                   from './Footer';
import backTop                  from '../assets/back-to-top.jpg';
import API_URL                  from '../services/api';

const Layout = ({ children }) => {
  const { user, token, refreshUser } = useAuth();

  const [showButton, setShowButton] = useState(false);
  const [resending,  setResending]  = useState(false);

  // ── Scroll button ─────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Refresh user on mount to get latest isEmailVerified ──
  // This fixes the case where user verified email but
  // localStorage still has old isEmailVerified: false
  useEffect(() => {
    if (token) refreshUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Resend verification email ─────────────────────────────
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

  // Show banner only if user exists AND isEmailVerified is explicitly false
  // If isEmailVerified is undefined (old user), don't show banner
  const showVerificationBanner =
    user &&
    user.isEmailVerified === false;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      {/* ── Fixed Navbar ── */}
      <Navbar />

      {/* ── Verification Banner ── */}
      {showVerificationBanner && (
        <div
          className="fixed left-0 right-0 z-40 px-4 py-2.5
                     flex items-center justify-between gap-3"
          style={{
            top:             '94px', // right below fixed navbar
            backgroundColor: '#FEF9C3',
            borderBottom:    '1px solid #FDE047',
            boxShadow:       '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">📧</span>
            <p className="text-sm text-yellow-800">
              <strong>Please verify your email</strong>
              {' — '}check your inbox for a verification link.
            </p>
          </div>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex-shrink-0 text-xs font-semibold px-4 py-1.5
                       rounded-lg text-white transition disabled:opacity-50
                       whitespace-nowrap"
            style={{ backgroundColor: '#B45309' }}
          >
            {resending ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
      )}

      {/* ── Page Content ── */}
      {/* Push content below navbar (64px) + optional banner (44px) */}
      <main
        className="flex-1"
        style={{
          paddingTop: showVerificationBanner ? '108px' : '64px'
        }}
      >
        {children}
      </main>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Back to Top Button ── */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 transition-all duration-300
                     hover:scale-110 hover:opacity-90 focus:outline-none
                     shadow-lg rounded-full overflow-hidden"
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