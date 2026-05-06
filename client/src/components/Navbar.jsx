import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

// Navigation Links Config 
// Defined here so adding a new page only needs one line change
const NAV_LINKS = [
  { path: '/dashboard',     label: 'Home'           },
  { path: '/browse',        label: 'Browse Requests'},
  { path: '/request-blood', label: 'Request Blood'  },
  { path: '/my-activity',   label: 'My Activity'    },
];

const Navbar = () => {
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation(); // gives current URL path
  const [menuOpen, setMenuOpen] = useState(false); // for mobile hamburger menu

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper — checks if a nav link is the current active page
  // Used to highlight the active link differently
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ backgroundColor: '#1B2A4A' }} className="shadow-lg sticky top-0 z-50">
      {/* z-50 keeps navbar on top of all other content */}
      {/* sticky top-0 keeps it visible when user scrolls */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">

          {/* ── Left Side: Logo ─────────────────────────── */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img
              src={logo}
              alt="LifeLink Logo"
              className="h-12 w-auto" // h-12 = 48px height, width auto keeps ratio
            />
          </Link>

          {/* ── Center: Nav Links (desktop only) ────────── */}
          {/* hidden on mobile, visible on medium screens and above */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-lg font-large transition-colors
                  ${isActive(path)
                    ? 'text-white'           // active page — white text
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                    // inactive — grey text, white on hover with slight bg
                  }`}
                style={isActive(path) ? { backgroundColor: '#C0171D' } : {}}
                // active link gets the logo's red color as background
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right Side: User Info + Logout ──────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Show logged in user's name */}
            <span className="text-gray-300 text-sm">
              Hello, <strong className="text-white">{user?.name?.split(' ')[0]}</strong>
              {/* .split(' ')[0] shows only first name to save space */}
            </span>

            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white
                         border border-white/30 hover:bg-white/10 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* ── Mobile: Hamburger Button ─────────────────── */}
          {/* Only visible on small screens */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {/* Simple hamburger icon using divs */}
            <div className="w-5 h-0.5 bg-current mb-1"></div>
            <div className="w-5 h-0.5 bg-current mb-1"></div>
            <div className="w-5 h-0.5 bg-current"></div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu (dropdown) ───────────────────────── */}
      {/* Only renders when hamburger is clicked */}
      {menuOpen && (
        <div
          style={{ backgroundColor: '#162238' }}
          className="md:hidden px-4 pb-4 space-y-1"
        >
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)} // close menu on link click
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive(path)
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              style={isActive(path) ? { backgroundColor: '#C0171D' } : {}}
            >
              {label}
            </Link>
          ))}

          {/* Mobile logout */}
          <div className="pt-2 border-t border-white/10">
            <span className="block text-gray-400 text-xs px-4 pb-1">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-300
                         hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;