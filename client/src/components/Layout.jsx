import { useState, useEffect } from 'react';
import Navbar  from './Navbar';
import Footer  from './Footer';
import backTop from '../assets/back-to-top.jpg';

const Layout = ({ children }) => {

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Page content — pt-16 pushes below fixed navbar */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to Top */}
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