import { useAuth }     from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import doctor          from '../assets/doctor.jpg';

const Dashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ════════════════════════════════════════════════════
          HERO SECTION — Split layout
          Left: content | Right: doctor image
      ════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: '520px', backgroundColor: '#959697' }}
      >
        {/* ── Background decorative circles ── */}
        {/* These add depth without covering the image */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{
            backgroundColor: '#C0171D',
            transform: 'translate(-30%, -30%)'
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-5"
          style={{
            backgroundColor: '#C0171D',
            transform: 'translateY(30%)'
          }}
        />

        {/* ── Main Grid: Left text + Right image ── */}
        <div className="relative max-w-6xl mx-auto px-6 py-16
                        grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* ── LEFT: Text Content ── */}
          <div className="text-white z-10">

            {/* Top badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5
                         rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: 'rgba(216, 210, 210, 0.25)',
                       border: '2px solid rgba(90, 28, 30, 0.5)',
                       color: '#9e1e23' }}
            >
              🩸 Sri Lanka's Blood Donor Network
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-2">
              Welcome back,
            </h1>
            <h1
              className="text-4xl md:text-6xl font-black leading-tight mb-6"
              style={{ color: '#130b35' }}
            >
              {user?.name?.split(' ')[0]}! 
            </h1>

            {/* Red underline accent */}
            <div
              className="w-20 h-1.5 rounded-full mb-6"
              style={{ backgroundColor: '#1e0e42' }}
            />

            {/* Subtitle */}
            <p className="text-gray-800 text-base md:text-lg
                          leading-relaxed mb-8 max-w-md">
              Every second counts in a blood emergency.
              Connect with eligible donors nearby or post
              an urgent request - <strong className="text-white">
              instantly and for free.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => navigate('/browse')}
                className="px-7 py-3 rounded-xl font-bold text-sm
                           text-white transition hover:opacity-90
                           shadow-lg shadow-red-900/30"
                style={{ backgroundColor: '#C0171D' }}
              >
                Browse Requests →
              </button>
              <button
                onClick={() => navigate('/request-blood')}
                className="px-7 py-3 rounded-xl font-bold text-sm
                           bg-white transition hover:bg-gray-100
                           shadow-lg"
                style={{ color: '#1B2A4A' }}
              >
                Request Blood 
              </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="flex gap-8">
              {[
                { value: '25+',    label: 'Districts'       },
                { value: '56',     label: 'Day cooldown'    },
                { value: '3 lives',label: 'Per donation'    },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="text-2xl font-black"
                    style={{ color: '#1c1846' }}
                  >
                    {value}
                  </p>
                  <p className="text-black text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Doctor Image ── */}
          <div className="relative hidden md:block">

            {/* Glow effect behind image */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
              style={{ backgroundColor: '#C0171D' }}
            />

            {/* Image with clip/border styling */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                border: '3px solid rgba(192,23,29,0.4)',
                height: '420px'
              }}
            >
              <img
                src={doctor}
                alt="LifeLink Medical"
                className="w-full h-full object-cover object-center"
                // No overlay — shows original image naturally
              />

              {/* Small badge on image — bottom left */}
              <div
                className="absolute bottom-4 left-4 px-4 py-2 rounded-xl
                           text-white text-xs font-semibold"
                style={{ backgroundColor: 'rgba(27,42,74,0.85)',
                         backdropFilter: 'blur(8px)',
                         border: '1px solid rgba(255,255,255,0.1)' }}
              >
                🩸 Find donors near you instantly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto py-10 px-4">

        {/* ── Action Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Donate Card */}
          <div
            onClick={() => navigate('/my-activity')}
            className="bg-gray-200 rounded-2xl shadow p-8 text-center
                       cursor-pointer border-2 border-transparent
                       hover:shadow-lg transition group"
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C0171D'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="text-5xl mb-4">🩸</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              I Want to Donate
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Check your eligibility and see requests matching
              your blood type nearby.
            </p>
            <span
              className="inline-block px-6 py-2 rounded-lg text-white
                         text-sm font-medium"
              style={{ backgroundColor: '#C0171D' }}
            >
              View My Donor Profile
            </span>
          </div>

          {/* Request Card */}
          <div
            onClick={() => navigate('/request-blood')}
            className="bg-gray-200 rounded-2xl shadow p-8 text-center
                       cursor-pointer border-2 border-transparent
                       hover:shadow-lg transition"
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1B2A4A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              I Need Blood
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Post an urgent request and notify eligible donors
              in your district instantly.
            </p>
            <span
              className="inline-block px-6 py-2 rounded-lg text-white
                         text-sm font-medium"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              Post a Request
            </span>
          </div>
        </div>

        {/* ── Our Mission ── */}
        <div
          className="rounded-2xl p-8 mb-8 text-white"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #C0171D)' }}
        >
          <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
          <p className="text-white/85 leading-relaxed text-sm md:text-base">
            LifeLink was built to solve a critical problem - finding blood
            donors in emergencies is still done through WhatsApp forwards
            and phone calls. We believe technology can do better. Our mission
            is to <strong className="text-white">connect every patient with
            a matching donor instantly</strong>, eliminating the gap between
            need and help. Every second matters. Every drop saves lives.
          </p>
        </div>

        {/* ── How It Works ── */}
        <div className="bg-gray-200 rounded-2xl shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            How LifeLink Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step:  '1',
                icon:  '📝',
                title: 'Register',
                desc:  'Sign up with your basic info and health profile. Takes less than 2 minutes.'
              },
              {
                step:  '2',
                icon:  '🔔',
                title: 'Get Notified',
                desc:  'When someone nearby needs your blood type, you get an instant notification and email.'
              },
              {
                step:  '3',
                icon:  '🩸',
                title: 'Save a Life',
                desc:  'Accept the request, contact the patient, and donate. You just saved a life!'
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center
                             justify-center text-white font-black text-lg
                             mx-auto mb-3"
                  style={{ backgroundColor: '#C0171D' }}
                >
                  {step}
                </div>
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-navy blue mb-1">{title}</h3>
                <p className="text-gray-800 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Blood Type Info ── */}
        <div className="bg-white border border-gray-500 rounded-2xl shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            🩸 Did You Know?
          </h2>
          <p className="text-gray-700 text-small mb-6">
            Blood type compatibility matters in emergencies:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'O-',  label: 'Universal Donor',     color: '#C0171D', note: 'Can donate to anyone'    },
              { type: 'AB+', label: 'Universal Recipient', color: '#1B2A4A', note: 'Can receive from anyone' },
              { type: 'O+',  label: 'Most Common',         color: '#C0171D', note: '38% of population'       },
              { type: 'AB-', label: 'Most Rare',           color: '#1B2A4A', note: 'Only 1% of population'   },
            ].map(({ type, label, color, note }) => (
              <div
                key={type}
                className="rounded-xl p-4 text-center border-2"
                style={{ borderColor: color, backgroundColor: `${color}10` }}
              >
                <div className="text-2xl font-black mb-1" style={{ color }}>
                  {type}
                </div>
                <div className="text-small font-semibold mb-1" style={{ color }}>
                  {label}
                </div>
                <div className="text-medium text-gray-800">{note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4"> Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/browse')}
              className="px-4 py-2 rounded-lg text-sm font-medium
                         text-white transition hover:opacity-90"
              style={{ backgroundColor: '#C0171D' }}
            >
              Browse All Requests
            </button>
            <button
              onClick={() => navigate('/my-activity')}
              className="px-4 py-2 rounded-lg text-sm font-medium
                         transition border-2 text-gray-700 hover:bg-gray-50"
              style={{ borderColor: '#1B2A4A' }}
            >
              My Activity
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 rounded-lg text-sm font-medium
                         transition border-2 hover:bg-gray-50"
              style={{ borderColor: '#C0171D', color: '#C0171D' }}
            >
              Update Health Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;