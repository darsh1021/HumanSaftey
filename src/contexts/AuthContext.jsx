import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('safevision_user');
    const storedToken = localStorage.getItem('safevision_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Add initials before storing user data for UI usage
      const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      const userWithInitials = { ...userData, initials };

      setUser(userWithInitials);
      localStorage.setItem('safevision_token', token);
      localStorage.setItem('safevision_user', JSON.stringify(userWithInitials));
      
      toast.success(`Welcome back, ${userData.name}!`);
      
      // Force redirection to main dashboard overview regardless of previous attempts
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login Error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'viewer') => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user: userData } = response.data;

      const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      const userWithInitials = { ...userData, initials };

      setUser(userWithInitials);
      localStorage.setItem('safevision_token', token);
      localStorage.setItem('safevision_user', JSON.stringify(userWithInitials));

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Register Error:', error);
      const errorMessage = error.response?.data?.message || 'Server error during registration';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safevision_token');
    localStorage.removeItem('safevision_user');
    toast.dismiss(); // Clean up toasts
    navigate('/login');
  };

  const triggerSessionExpiry = () => {
    setUser(null);
    localStorage.removeItem('safevision_token');
    localStorage.removeItem('safevision_user');
    setSessionExpired(true);
    navigate('/login');
  };

  const dismissSessionExpiry = () => setSessionExpired(false);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, sessionExpired, dismissSessionExpiry, triggerSessionExpiry }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
