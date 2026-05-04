import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import bg from '../assets/bg.png'; //  import background image

const Dashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  return (
      <div
        className="min-h-screen py-10 px-4 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bg})` }}
      >
      
      {/* Inner wrapper to keep your original layout */}
      <div className="max-w-4xl mx-auto">

        {/* ── Welcome Banner ── */}
        <div
          className="rounded-2xl p-8 mb-8 text-white"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #C0171D)' }}
        >
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-white/80">
            You can donate blood or request blood - anytime, based on your situation.
          </p>
        </div>

        {/* ── Action Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Donate Card */}
          <div
            onClick={() => navigate('/my-activity')}
            className="bg-white rounded-2xl shadow p-8 text-center cursor-pointer
                       border-2 border-transparent hover:shadow-lg transition group"
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C0171D'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="text-5xl mb-4">🩸</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              I Want to Donate
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Check your eligibility status and see requests matching your blood type.
            </p>
            <span
              className="inline-block px-6 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#C0171D' }}
            >
              View My Donor Profile
            </span>
          </div>

          {/* Request Card */}
          <div
            onClick={() => navigate('/request-blood')}
            className="bg-white rounded-2xl shadow p-8 text-center cursor-pointer
                       border-2 border-transparent hover:shadow-lg transition"
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1B2A4A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              I Need Blood
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Post an urgent request and notify eligible donors in your district instantly.
            </p>
            <span
              className="inline-block px-6 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              Post a Request
            </span>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/browse')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition"
              style={{ backgroundColor: '#C0171D' }}
            >
              Browse All Requests
            </button>
            <button
              onClick={() => navigate('/my-activity')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition
                         border-2 text-gray-700 hover:bg-gray-50"
              style={{ borderColor: '#1B2A4A' }}
            >
              My Activity
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;