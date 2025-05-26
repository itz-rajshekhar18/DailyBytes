import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post('http://localhost:5001/api/users', userData);
      const data = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post('http://localhost:5001/api/users/login', { email, password });
      const data = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const googleLogin = async (googleData) => {
    try {
      setError(null);
      setLoading(true);

      // Client-side validation
      if (!googleData.email || !googleData.googleId) {
        throw new Error('Invalid Google account data');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(googleData.email)) {
        throw new Error('Invalid email format');
      }

      const response = await axios.post('http://localhost:5001/api/users/google', {
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        email: googleData.email,
        googleId: googleData.googleId,
        profilePicture: googleData.profilePicture,
      });
      
      const data = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      console.error('Google Auth Error:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to authenticate with Google';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        register,
        login,
        googleLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;