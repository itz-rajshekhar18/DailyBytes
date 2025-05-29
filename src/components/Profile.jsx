import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select a valid image file', type: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 5MB', type: 'error' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post('https://dailybytes-1.onrender.com/users/upload-profile-picture', formData, config);
      
      setProfileData(prev => ({
        ...prev,
        profilePicture: response.data.profilePictureUrl
      }));
      
      setMessage({ text: 'Profile picture uploaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ text: 'Failed to upload profile picture', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove profile picture
  const removeProfilePicture = async () => {
    try {
      setIsUploading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      await axios.delete('https://dailybytes-1.onrender.com/users/remove-profile-picture', config);
      
      setProfileData(prev => ({
        ...prev,
        profilePicture: ''
      }));
      
      setMessage({ text: 'Profile picture removed successfully!', type: 'success' });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setMessage({ text: 'Failed to remove profile picture', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      };

      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        profilePicture: profileData.profilePicture
      };

      const response = await axios.put('https://dailybytes-1.onrender.com/users/profile', updateData, config);
      
      // Update user context
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (profileData.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    }
    if (profileData.email) {
      return profileData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle profile picture click
  const handleProfilePictureClick = () => {
    // Always trigger upload (like WhatsApp)
    fileInputRef.current?.click();
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <BiIcons.BiArrowBack />
          <span>Back</span>
        </button>
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          <div className="message-content">
            {message.type === 'success' ? (
              <FaIcons.FaCheckCircle className="message-icon" />
            ) : (
              <FaIcons.FaExclamationCircle className="message-icon" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Picture Section */}
        <div className="form-section">
          <h2>
            <FaIcons.FaUserCircle className="section-icon" />
            Profile Picture
          </h2>
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {profileData.profilePicture ? (
                <img 
                  src={profileData.profilePicture} 
                  alt="Profile" 
                  className="profile-picture clickable" 
                  onClick={handleProfilePictureClick}
                  disabled={isUploading}
                />
              ) : (
                <div 
                  className="profile-initial-large clickable"
                  onClick={handleProfilePictureClick}
                  disabled={isUploading}
                >
                  <div className="upload-overlay">
                    <BiIcons.BiCamera />
                    <span>Add Photo</span>
                  </div>
                  {getUserInitial()}
                </div>
              )}
              {isUploading && (
                <div className="upload-spinner">
                  <FaIcons.FaSpinner className="spinning" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p className="picture-hint">
              Click to upload or change your profile picture
            </p>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="form-section">
          <h2>
            <BiIcons.BiUser className="section-icon" />
            Personal Information
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">
                <BiIcons.BiUser className="input-icon" />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">
                <BiIcons.BiUser className="input-icon" />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="form-section">
          <h2>
            <MdIcons.MdContactMail className="section-icon" />
            Contact Information
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">
                <BiIcons.BiEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">
                <BiIcons.BiPhone className="input-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-cancel"
          >
            <BiIcons.BiX />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-save"
            disabled={isLoading}
          >
            <BiIcons.BiSave />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile; 
