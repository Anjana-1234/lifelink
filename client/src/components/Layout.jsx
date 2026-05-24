import { useState, useEffect }  from 'react';
import { useAuth }              from '../context/AuthContext';
import { useNavigate }          from 'react-router-dom';
import axios                    from 'axios';
import toast                    from 'react-hot-toast';
import Navbar                   from './Navbar';
import Footer                   from './Footer';
import backTop                  from '../assets/back-to-top.jpg';
import API_URL                  from '../services/api';

const Layout = ({ children }) => {
  const { user, token }  = useAuth();
  const [showButton, setShowButton] = useState(false);
  const [resending,  setResending]  = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resend verification email
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

  // Check if user email is unverified
  const showVerificationBanner = user && !user.isEmailVerified;

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F3F4F6' }}>

      {/* Navbar — fixed at top */}
      <Navbar />

      {/* ── Verification Banner ── */}
      {/* Shows below navbar for unverified users */}
      {showVerificationBanner && (
        <div
          className="w-full px-4 py-3 flex items-center justify-between
                     flex-wrap gap-2"
          style={{
            backgroundColor: '#FEF3C7',
            borderBottom:    '1px solid #FDE68A',
            marginTop:       '64px' // below fixed navbar
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📧</span>
            <p className="text-sm text-yellow-800">
              <strong>Please verify your email</strong> —
              check your inbox for a verification link.
            </p>
          </div>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-semibold px-4 py-1.5 rounded-lg
                       text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#B45309' }}
          >
            {resending ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
      )}

      {/* Page content */}
      {/* pt-16 only if no banner, banner handles spacing otherwise */}
      <main className={`flex-1 ${showVerificationBanner ? '' : 'pt-16'}`}>
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to Top */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 transition-all duration-300
                     hover:scale-110 hover:opacity-90 focus:outline-none
                     shadow-lg rounded-full overflow-hidden"
          title="Back to top"
          style={{ width: '56px', height: '56px',
                   animation: 'fadeIn 0.3s ease-in-out' }}
        >
          <img src={backTop} alt="Back to top"
            className="w-full h-full object-cover" />
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