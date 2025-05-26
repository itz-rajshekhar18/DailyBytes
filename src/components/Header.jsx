import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import AuthContext from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Extract username from email (part before @)
  const getDisplayName = (user) => {
    if (!user) return 'User';
    
    if ((!user.firstName || user.firstName === 'Google' || user.firstName === 'John') && user.email) {
      const emailParts = user.email.split('@');
      return emailParts[0];
    }
    
    return user.firstName;
  };
  
  // Get first character for avatar
  const getInitial = (user) => {
    if (!user) return 'U';
    
    if ((!user.firstName || user.firstName === 'Google' || user.firstName === 'John') && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return user.firstName?.charAt(0) || 'U';
  };
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          <BiIcons.BiCalendarCheck className="logo-icon" />
          <h1>DailyByte</h1>
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            <BiIcons.BiHomeAlt />
            <span>Home</span>
          </Link>
          
          <Link to="/all-bytes" className="nav-link">
            <BiIcons.BiBook />
            <span>All Bytes</span>
          </Link>
          
          <Link to="/quests" className="nav-link">
            <BiIcons.BiTask />
            <span>Quests</span>
          </Link>
          
          <Link to="/bookmarks" className="nav-link">
            <BiIcons.BiBookmark />
            <span>Bookmarks</span>
          </Link>
        </nav>
      </div>
      
      <div className="header-right">
        <button 
          onClick={toggleDarkMode} 
          className="icon-button"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <BiIcons.BiSun className="mode-icon" />
          ) : (
            <BiIcons.BiMoon className="mode-icon" />
          )}
        </button>
        
        <div className="profile-dropdown" ref={dropdownRef}>
          <button 
            className="profile-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="profile-image" 
              />
            ) : (
              <div className="profile-initial">
                {getInitial(user)}
              </div>
            )}
            <span className="profile-name">{getDisplayName(user)}</span>
            <BiIcons.BiChevronDown className="dropdown-arrow" />
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="user-info">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="dropdown-profile-image" 
                  />
                ) : (
                  <div className="dropdown-profile-initial">
                    {getInitial(user)}
                  </div>
                )}
                <div className="user-details">
                  <span className="user-name">{getDisplayName(user)}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
              </div>
              
              <Link to="/profile" className="dropdown-item">
                <BiIcons.BiUser className="dropdown-icon" />
                <span>Profile</span>
              </Link>
              <Link to="/settings" className="dropdown-item">
                <BiIcons.BiCog className="dropdown-icon" />
                <span>Settings</span>
              </Link>
              <button onClick={handleLogout} className="dropdown-item logout-button">
                <BiIcons.BiLogOut className="dropdown-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
