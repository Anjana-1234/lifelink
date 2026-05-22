import { useState, useEffect } from 'react';
import Navbar   from './Navbar';
import Footer   from './Footer';
import backTop  from '../assets/back-to-top.jpg';

// ── Layout Component ──────────────────────────────────────────
// Wraps ALL private pages automatically with:
// 1. Navbar at top
// 2. Light gray background on every page
// 3. Back to Top button
// 4. Footer at bottom
const Layout = ({ children }) => {

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // bg-gray-100 = light gray background on EVERY page automatically
    // flex flex-col ensures footer sticks to bottom
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#cfd5df' }}>

      {/* Navbar — always at top */}
      <Navbar />

      {/* Page content — flex-1 fills remaining space */}
      {/* pt-16 pushes content below the fixed navbar (navbar height = 64px = h-16) */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer — always at bottom */}
      <Footer />

      {/* Back to Top Button */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 transition-all duration-300
                     hover:scale-110 hover:opacity-90 focus:outline-none
                     shadow-lg rounded-full overflow-hidden"
          title="Back to top"
          style={{
            width:  '56px',
            height: '56px',
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