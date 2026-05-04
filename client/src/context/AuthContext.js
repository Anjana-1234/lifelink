import { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Context is like a global state — any component can access it
// without passing props through every level
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Get token from localStorage (persists after page refresh)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser]   = useState(JSON.parse(localStorage.getItem('user')));

  // Base URL for all API calls
  const API = 'http://localhost:5000/api';

  //  Register function 
  const register = async (formData) => {
    const res = await axios.post(`${API}/auth/register`, formData);

    // Save token and user to localStorage so they persist on refresh
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  //  Login function 
  const login = async (formData) => {
    const res = await axios.post(`${API}/auth/login`, formData);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  //  Logout function 
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
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