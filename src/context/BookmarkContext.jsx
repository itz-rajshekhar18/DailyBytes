import React, { createContext, useState, useContext, useCallback } from 'react';
import AuthContext from './AuthContext';
import axios from 'axios';

export const BookmarkContext = createContext();

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchBookmarks = useCallback(async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get('http://localhost:5001/api/bookmarks', config);
      setBookmarks(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addBookmark = async (byteId) => {
    try {
      if (!user) throw new Error('User must be logged in');
      
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.post(
        'http://localhost:5001/api/bookmarks',
        { byteId },
        config
      );

      setBookmarks(prev => [...prev, response.data.data]);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add bookmark');
      return false;
    }
  };

  const removeBookmark = async (byteId) => {
    try {
      if (!user) throw new Error('User must be logged in');
      
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.delete(`http://localhost:5001/api/bookmarks/${byteId}`, config);
      setBookmarks(prev => prev.filter(bookmark => bookmark.byte._id !== byteId));
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove bookmark');
      return false;
    }
  };

  const isBookmarked = async (byteId) => {
    try {
      if (!user) return false;
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:5001/api/bookmarks/${byteId}/check`,
        config
      );
      
      return response.data.isBookmarked;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  };

  const value = {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};