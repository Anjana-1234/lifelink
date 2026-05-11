import { useState, useEffect } from 'react';
import Navbar  from './Navbar';
import Footer  from './Footer';
import backTop from '../assets/back-to-top.jpg';

// ── Layout Component ──────────────────────────────────────────
// Wraps ALL private pages automatically with:
// 1. Navbar at the top
// 2. Page content in the middle
// 3. Back to Top button (appears when scrolled down)
// 4. Footer at the bottom
const Layout = ({ children }) => {

  // ── Show/Hide back to top button based on scroll position ──
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Listen to scroll events on the window
    const handleScroll = () => {
      // Show button when user scrolls down more than 300px
      // Hide it when they're near the top
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    // Add scroll listener when component mounts
    window.addEventListener('scroll', handleScroll);

    // Cleanup — remove listener when component unmounts
    // Prevents memory leaks
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // empty array = only runs once on mount

  // ── Scroll smoothly back to top ───────────────────────────
  const scrollToTop = () => {
    window.scrollTo({
      top:      0,
      behavior: 'smooth' // smooth animation instead of instant jump
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar — always visible at top */}
      <Navbar />

      {/* Page content — flex-1 makes it grow to fill space */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer — always at bottom */}
      <Footer />

      {/* ── Back to Top Button ───────────────────────────────
          Fixed position — stays in corner while scrolling
          Only visible when user has scrolled down 300px+
          Uses your back-to-top.jpg image as the button
      ─────────────────────────────────────────────────────── */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 transition-all duration-300
                     hover:scale-110 hover:opacity-90 focus:outline-none
                     shadow-lg rounded-full overflow-hidden"
          // z-50 keeps it above all other content
          // fixed bottom-8 right-6 = 32px from bottom, 24px from right
          title="Back to top"
          style={{
            width:  '70px',
            height: '70px',
            // Subtle animation when button appears
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

      {/* ── Fade-in animation for the button ── */}
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