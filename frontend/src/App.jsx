import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Bytes from './components/Bytes';
import BytesBrowser from './components/BytesBrowser';
import ByteDetail from './components/ByteDetail';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Footer from './components/Footer';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);
  
  if (!user) {
    return <div className="loading">Redirecting to login...</div>;
  }
  
  return children;
};

// Google Auth Success Handler
const GoogleAuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const email = params.get('email');
    const profilePicture = params.get('profilePicture');
    
    if (token && userId) {
      const userData = {
        _id: userId,
        firstName,
        lastName,
        email,
        profilePicture,
        token
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update context
      setUser(userData);
      
      // Use window.location for immediate redirect
      window.location.href = '/';
    } else {
      window.location.href = '/login';
    }
  }, [location, navigate, setUser]);
  
  return <div className="loading">Processing authentication...</div>;
};

// Layout component for main pages with header and footer
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

// Home page component
const HomePage = () => (
  <>
    <Hero />
    <Bytes />
  </>
);

const App = () => {
  return (
    <GoogleOAuthProvider 
      clientId="530698123278-3cn31ts9qdpn2ted90mnfds3rg0kbcgb.apps.googleusercontent.com"
    >
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/all-bytes" element={
              <ProtectedRoute>
                <MainLayout>
                  <BytesBrowser />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/byte/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <ByteDetail />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
