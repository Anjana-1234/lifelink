import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import toast  from 'react-hot-toast';
import API_URL from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser]   = useState(JSON.parse(localStorage.getItem('user')));

  // ── Register ──────────────────────────────────────────────
  // Creates new account and saves token to localStorage
  const register = async (formData) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, formData);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);

    toast.success('Account created! Welcome to LifeLink 🩸');
    return res.data;
  };

  // ── Login ─────────────────────────────────────────────────
  // Logs in and saves token to localStorage
  const login = async (formData) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, formData);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);

    toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────
  // Clears everything from localStorage and state
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

export const useAuth = () => useContext(AuthContext);