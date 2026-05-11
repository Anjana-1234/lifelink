import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ backgroundColor: '#1B2A4A' }}>

      {/* ── Main Footer Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* ── Column 1: Logo + Tagline ── */}
          <div>
            <img
              src={logo}
              alt="LifeLink"
              className="h-16 w-auto mb-4"
            />

            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              LifeLink connects donors instantly - matching blood donors
              with patients in emergencies across Sri Lanka.
            </p>

            <p
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: '#d3676a' }}
            >
              Find. Connect. Save Lives.
            </p>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <h3
              className="text-white font-semibold mb-5 text-sm
                         uppercase tracking-wider"
            >
              Quick Links
            </h3>

            <ul className="space-y-2.5">
              {[
                { label: 'Home', path: '/dashboard' },
                { label: 'Browse Requests', path: '/browse' },
                { label: 'Request Blood', path: '/request-blood' },
                { label: 'My Activity', path: '/my-activity' },
                { label: 'My Profile', path: '/profile' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-gray-300 hover:text-white text-sm
                               transition-colors text-left flex items-center gap-2"
                  >
                    
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Contact ── */}
          <div>
            <h3
              className="text-white font-semibold mb-5 text-sm
                         uppercase tracking-wider"
            >
              Contact Us
            </h3>

            <ul className="space-y-4">

              {/* Email */}
              <li className="flex items-start gap-3">
                <span className="text-lg">✉️</span>

                <div>
                  <p className="text-gray-200 text-xs uppercase tracking-wide mb-0.5">
                    Email
                  </p>

                  <a
                    href="mailto:lifelink.alerts@gmail.com"
                    className="text-gray-300 text-sm hover:text-white
                               transition-colors"
                  >
                    lifelink.alerts@gmail.com
                  </a>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-start gap-3">
                <span className="text-lg">📞</span>

                <div>
                  <p className="text-gray-200 text-xs uppercase tracking-wide mb-0.5">
                    Phone
                  </p>

                  <a
                    href="tel:+94711439792"
                    className="text-gray-300 text-sm hover:text-white
                               transition-colors"
                  >
                    0711 439 792
                  </a>
                </div>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3">
                <span className="text-lg">📍 </span>

                <div>
                  <p className="text-gray-200 text-xs uppercase tracking-wide mb-0.5">
                     Location
                  </p>

                  <p className="text-gray-300 text-sm">
                    Sri Lanka
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
<div
  className="border-t px-6 py-4"
  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
>
  <div className="max-w-6xl mx-auto flex flex-col items-center
                  justify-center gap-3 text-center">

    {/* Copyright — centered */}
    <p className="text-gray-500 text-xs text-center">
      © 2026 LifeLink. All rights reserved. Built with ❤️ to save lives.
    </p>

    </div>
    </div>
    </footer>
  );
};

export default Footer;