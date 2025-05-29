import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import * as jwt_decode from 'jwt-decode';
import './Auth.css';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register, googleLogin, error, clearError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const { fullName, email, password, confirmPassword } = formData;

  // Clear today's byte data for new signup
  const clearTodayByteData = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('byte_response_') || key.startsWith('streak_shown_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
    clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Form validation
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters');
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
        // Clear today's byte data for fresh start
        clearTodayByteData();
        
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.response?.data?.message || 'Registration failed';
      
      // Handle specific error cases
      if (errorMsg.includes('User already exists') || errorMsg.includes('already registered') || errorMsg.includes('Email already in use')) {
        setErrorMessage('An account with this email already exists. Redirecting to login page...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else if (errorMsg.includes('Invalid email')) {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(errorMsg);
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
        // Clear today's byte data for fresh start
        clearTodayByteData();
        
        setSuccessMessage('Google signup successful! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      let errorMessage = 'Failed to sign up with Google';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google signup error:', error);
    setErrorMessage('Failed to sign up with Google. Please try again or use email/password.');
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
          <div className={`message ${errorMessage?.includes('Redirecting') ? 'info' : 'error'}`}>
            <span className="message-icon">
              {errorMessage?.includes('Redirecting') ? 
                <FaIcons.FaInfoCircle /> : 
                <FaIcons.FaExclamationTriangle />
              }
            </span>
            <span className="message-text">
              {errorMessage || error}
            </span>
          </div>
        )}

        {successMessage && (
          <div className="message success">
            <span className="message-icon">
              <FaIcons.FaCheckCircle />
            </span>
            <span className="message-text">
              {successMessage}
            </span>
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
              required
              minLength="2"
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
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Create a password"
                className="form-input password-input"
                autoComplete="new-password"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm your password"
                className="form-input password-input"
                autoComplete="new-password"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
              </button>
            </div>
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
          <button className="google-button">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              type="standard"
              size="large"
              theme="outline"
              text="signup_with"
              shape="rectangular"
              width={400}
              locale="en"
              cookiePolicy="single_host_origin"
              auto_select={false}
              context="signup"
            />
          </button>
        </div>
        
        <p className="auth-redirect">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;