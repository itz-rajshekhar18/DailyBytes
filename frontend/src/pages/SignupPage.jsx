import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import * as jwt_decode from 'jwt-decode';
import './Auth.css';
import * as BiIcons from 'react-icons/bi';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, googleLogin, error, clearError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const { fullName, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    // Split fullName into firstName and lastName for the API
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      const userData = await register({ firstName, lastName, email, password });
      if (userData) {
        window.location.href = '/';
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      setErrorMessage(errorMsg);
      
      // If error is "User already exists", redirect to login after 3 seconds
      if (errorMsg.includes('User already exists')) {
        setErrorMessage('Account with this email already exists. Redirecting you to login...');
        setTimeout(() => {
          window.location.href = '/login';
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
          <h2>Create an Account</h2>
          <p>Join thousands of users on Dailybyte</p>
        </div>
        
        {(errorMessage || error) && (
          <div className="error-message">
            {errorMessage || error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={onChange}
              placeholder="Enter your full name"
              className="form-input"
            />
          </div>
          
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
              placeholder="Create a password"
              className="form-input"
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
              className="form-input"
              autoComplete="new-password"
            />
          </div>
          
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              required
            />
            <label htmlFor="terms">
              I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
            </label>
          </div>
          
          <button type="submit" className="auth-button">
            Sign Up
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
            Sign up with Google
          </button>
        </div>
        
        <p className="auth-redirect">
          Already have an account? <Link to="/login" onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage; 