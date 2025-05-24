import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import * as jwt_decode from 'jwt-decode';
import './Auth.css';
import * as BiIcons from 'react-icons/bi';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, googleLogin, error, clearError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const userData = await login(email, password);
      if (userData) {
        window.location.href = '/';
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      setErrorMessage(errorMsg);
      
      // If error contains "Invalid email", suggest signup
      if (errorMsg.includes('Invalid email')) {
        setErrorMessage('Account not found. Redirecting you to signup page...');
        setTimeout(() => {
          window.location.href = '/signup';
        }, 3000);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwt_decode.default(credentialResponse.credential);
      
      const googleData = {
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        email: decoded.email,
        googleId: decoded.sub,
        profilePicture: decoded.picture
      };
      
      const userData = await googleLogin(googleData);
      if (userData) {
        window.location.href = '/';
      }
    } catch (error) {
      setErrorMessage('Google login failed');
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google login failed');
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo">
            <BiIcons.BiCalendarCheck /> Dailybyte
          </div>
          <h2>Welcome Back</h2>
          <p>Log in to your account to continue</p>
        </div>
        
        {(errorMessage || error) && (
          <div className="error-message">
            {errorMessage || error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="form-input"
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              className="form-input"
              autoComplete="current-password"
            />
          </div>
          
          <div className="remember-forgot">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="auth-button">
            Log In
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="google-btn-container">
          <button 
            className="google-button"
            onClick={() => {
              const clientId = '530698123278-3cn31ts9qdpn2ted90mnfds3rg0kbcgb.apps.googleusercontent.com';
              const redirectUri = 'http://localhost:5001/api/users/google/callback';
              
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&prompt=select_account`;
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
            Sign in with Google
          </button>
        </div>
        
        <p className="auth-redirect">
          Don't have an account? <Link to="/signup" onClick={(e) => { e.preventDefault(); window.location.href = '/signup'; }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 