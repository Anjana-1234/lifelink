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
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">🩸 Welcome to LifeLink</h1>
        <p className="text-gray-600">Hello, <strong>{user?.name}</strong>!</p>
        <p className="text-gray-500 text-sm mt-1">Role: {user?.role}</p>
        <button onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;