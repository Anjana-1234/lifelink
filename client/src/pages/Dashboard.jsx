import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-red-50">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600">🩸 LifeLink</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            Hello, <strong>{user?.name}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          What would you like to do today?
        </h2>
        <p className="text-center text-gray-500 mb-10">
          You can donate blood or request blood — anytime, based on your situation.
        </p>

        {/* ── Action Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Donate Card */}
          <div
            onClick={() => navigate('/donor-profile')}
            className="bg-white rounded-2xl shadow p-8 text-center cursor-pointer
                       border-2 border-transparent hover:border-red-300
                       hover:shadow-lg transition group"
          >
            <div className="text-5xl mb-4">🩸</div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition">
              I Want to Donate
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Register as a donor and help save lives nearby.
            </p>
            <button className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg
                               font-medium hover:bg-red-700 transition">
              Donate Blood
            </button>
          </div>

          {/* Request Card */}
          <div
            onClick={() => navigate('/request-blood')}
            className="bg-white rounded-2xl shadow p-8 text-center cursor-pointer
                       border-2 border-transparent hover:border-blue-300
                       hover:shadow-lg transition group"
          >
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
              I Need Blood
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Post an urgent request and notify eligible donors instantly.
            </p>
            <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg
                               font-medium hover:bg-blue-700 transition">
              Request Blood
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;