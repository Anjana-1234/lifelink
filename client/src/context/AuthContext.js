import { createContext, useState, useContext } from 'react';
import axios   from 'axios';
import toast   from 'react-hot-toast';
import API_URL from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user,  setUser]  = useState(
    JSON.parse(localStorage.getItem('user'))
  );

  const saveAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user',  JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // ── Register ──────────────────────────────────────────────
  const register = async (formData) => {
    const res = await axios.post(
      `${API_URL}/api/auth/register`, formData
    );
    saveAuth(res.data.token, res.data.user);
    toast.success('Account created! Check your email to verify. 🩸');
    return res.data;
  };

  // ── Login ─────────────────────────────────────────────────
  const login = async (formData) => {
    const res = await axios.post(
      `${API_URL}/api/auth/login`, formData
    );
    saveAuth(res.data.token, res.data.user);
    toast.success(
      `Welcome back, ${res.data.user.name.split(' ')[0]}! `
    );
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast('Logged out successfully');
  };

  // ── Refresh user from backend ─────────────────────────────
  // Updates localStorage with latest isEmailVerified status
  // Called by Layout on mount so banner shows/hides correctly
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const u = res.data.user;
      const updatedUser = {
        id:              u._id,
        name:            u.name,
        email:           u.email,
        phone:           u.phone,
        sex:             u.sex,
        isEmailVerified: u.isEmailVerified  || false,
        isPhoneVerified: u.isPhoneVerified  || false
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Refresh user error:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      register,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);