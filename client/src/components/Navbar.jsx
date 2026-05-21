import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import logo  from '../assets/logo.png';

// ── Nav Links — Donor Guide added ────────────────────────────
const NAV_LINKS = [
  { path: '/dashboard',   label: 'Home'            },
  { path: '/browse',      label: 'Browse Requests' },
  { path: '/request-blood', label: 'Request Blood' },
  { path: '/my-activity', label: 'My Activity'     },
  { path: '/donor-guide', label: 'Donor Guide'     },
];

// ── SVG Icons ─────────────────────────────────────────────────
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118
         9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64
         3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714
         0a3 3 0 11-5.714 0" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5
         0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933
         0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
    className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const timeAgo = (dateString) => {
  const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000);
  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)  return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const Navbar = () => {
  const { user, logout }   = useAuth();
  const {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead
  } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);

  const handleLogout   = () => { logout(); navigate('/login'); };
  const isActive       = (path) => location.pathname === path;
  const closeDropdowns = () => { setProfileOpen(false); setNotifOpen(false); };

  const handleBellClick = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    setProfileOpen(false);
    if (opening && unreadCount > 0) markAllRead();
  };

  const handleNotifClick = async (notif) => {
    await markOneRead(notif._id);
    setNotifOpen(false);
    navigate(notif.link || '/browse');
  };

  return (
    <nav style={{ backgroundColor: '#1B2A4A' }}
      className="shadow-lg sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="flex-shrink-0" onClick={closeDropdowns}>
            <img src={logo} alt="LifeLink" className="h-12 w-auto" />
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={closeDropdowns}
                className={`px-3 py-2 rounded-lg text-lg font-medium transition-colors
                  ${isActive(path)
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                style={isActive(path) ? { backgroundColor: '#C0171D' } : {}}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right: Bell + Profile ── */}
          <div className="hidden md:flex items-center gap-2">

            {/* ── Notification Bell ── */}
            <div className="relative">
              <button
                onClick={handleBellClick}
                className="relative p-2 rounded-lg text-gray-300
                           hover:text-white hover:bg-white/10 transition-colors"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full
                               text-white text-xs flex items-center
                               justify-center font-bold"
                    style={{ backgroundColor: '#C0171D' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl
                             shadow-xl border border-gray-100 overflow-hidden"
                  style={{ zIndex: 100 }}
                >
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: '#1B2A4A' }}>
                    <span className="text-white font-semibold text-sm">
                      🔔 Notifications
                    </span>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead}
                        className="text-xs text-gray-400 hover:text-white transition">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="text-3xl mb-2">🔔</div>
                        <p className="text-gray-500 text-sm font-medium">
                          No notifications yet
                        </p>
                        <p className="text-gray-400 text-xs mt-1 px-4">
                          You'll be notified when someone nearby needs blood
                        </p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <button
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className={`w-full text-left px-4 py-3 border-b
                                      border-gray-50 hover:bg-gray-50
                                      transition flex items-start gap-3
                                      ${!notif.isRead ? 'bg-red-50' : 'bg-white'}`}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center
                                       justify-center text-white text-xs
                                       font-bold flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: '#C0171D' }}
                          >
                            {notif.metadata?.bloodType || '🩸'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed
                              ${!notif.isRead
                                ? 'text-gray-800 font-medium'
                                : 'text-gray-500'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                              style={{ backgroundColor: '#C0171D' }} />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => { navigate('/browse'); setNotifOpen(false); }}
                        className="text-xs font-medium transition"
                        style={{ color: '#C0171D' }}
                      >
                        Browse all requests →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile Avatar + Dropdown ── */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                           hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             text-white text-xs font-bold"
                  style={{ backgroundColor: '#C0171D' }}
                >
                  {getInitials(user?.name)}
                </div>
                <span className="text-gray-300">
                  <ChevronIcon open={profileOpen} />
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl
                             shadow-xl border border-gray-100 overflow-hidden"
                  style={{ zIndex: 100 }}
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3" style={{ backgroundColor: '#1B2A4A' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center
                                   justify-center text-white font-bold"
                        style={{ backgroundColor: '#C0171D' }}
                      >
                        {getInitials(user?.name)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user?.name}</p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <UserIcon /> My Profile
                    </button>
                    
                    <button
                      onClick={() => { handleLogout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 text-sm font-medium transition"
                      style={{ color: '#C0171D' }}
                    >
                    Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => { setMenuOpen(!menuOpen); closeDropdowns(); }}
          >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div style={{ backgroundColor: '#162238' }}
          className="md:hidden px-4 pb-4 space-y-1">
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium
                          transition-colors
                ${isActive(path)
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              style={isActive(path) ? { backgroundColor: '#C0171D' } : {}}
            >
              {label}
            </Link>
          ))}

          {/* Mobile Profile Section */}
          <div className="border-t border-white/10 pt-3 mt-2">
            <div className="flex items-center gap-3 px-4 pb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center
                           text-white text-sm font-bold"
                style={{ backgroundColor: '#C0171D' }}
              >
                {getInitials(user?.name)}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { navigate('/profile'); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300
                         hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              👤 My Profile
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm font-medium
                         rounded-lg transition mt-1"
              style={{ color: '#f8787c' }}
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