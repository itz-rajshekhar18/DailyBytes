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
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const userData = await login(email, password);
      if (userData) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Login failed. Please try again.';
      setErrorMessage(errorMsg);
      
      // If error indicates no account exists, suggest signup
      if (errorMsg.includes('No account found')) {
        setErrorMessage('No account found with this email. Redirecting you to signup page...');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      } else if (errorMsg.includes('Invalid password')) {
        setErrorMessage('Incorrect password. Please try again.');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('Failed to get Google credentials');
      }

      const decoded = jwt_decode.default(credentialResponse.credential);
      
      if (!decoded.email) {
        throw new Error('Email is required for authentication');
      }
      
      const googleData = {
        firstName: decoded.given_name || decoded.name?.split(' ')[0] || '',
        lastName: decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || '',
        email: decoded.email,
        googleId: decoded.sub,
        profilePicture: decoded.picture
      };
      
      const userData = await googleLogin(googleData);
      if (userData) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.response?.status === 403) {
        errorMessage = 'This Google account is not authorized to access this application';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setErrorMessage('Failed to sign in with Google. Please try again or use email/password.');
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
          <div className={`message ${errorMessage?.includes('Redirecting') ? 'info' : 'error'}`}>
            <span className="message-icon">
              {errorMessage?.includes('Redirecting') ? '🔄' : '⚠️'}
            </span>
            <span className="message-text">
              {errorMessage || error}
            </span>
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
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            type="standard"
            size="large"
            theme="outline"
            text="signin_with"
            shape="rectangular"
            width="100%"
            locale="en"
            cookiePolicy="single_host_origin"
            auto_select={false}
            context="signin"
          />
        </div>
        
        <p className="auth-redirect">
          Don't have an account? <Link to="/signup" onClick={(e) => { e.preventDefault(); window.location.href = '/signup'; }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;