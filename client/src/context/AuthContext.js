import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Get token from localStorage (persists after page refresh)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser]   = useState(JSON.parse(localStorage.getItem('user')));

  // Base URL for all API calls
  const API = 'http://localhost:5000/api';

  // ── Register ──────────────────────────────────────────────
  // Creates new account and saves token to localStorage
  const register = async (formData) => {
    const res = await axios.post(`${API}/auth/register`, formData);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    setToken(res.data.token);
    setUser(res.data.user);

    // Show success toast on successful registration
    toast.success('Account created! Welcome to LifeLink 🩸');
    return res.data;
  };

  // ── Login ─────────────────────────────────────────────────
  // Logs in user and saves token to localStorage
  const login = async (formData) => {
    const res = await axios.post(`${API}/auth/login`, formData);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    setToken(res.data.token);
    setUser(res.data.user);

    // Greet user by first name on login
    toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────
  // Clears token and user from localStorage and state
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — lets any component use auth easily
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);