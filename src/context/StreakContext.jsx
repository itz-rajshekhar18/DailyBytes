import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [streak, setStreak] = useState({ currentStreak: 0, maxStreak: 0, badges: [] });
  const [lastFetched, setLastFetched] = useState(0); // To prevent multiple fetches

  // Initialize streak when user logs in - only once
  useEffect(() => {
    if (user) {
      const fetchStreak = async () => {
        try {
          // Check if we've fetched in the last minute to avoid extra network requests
          const now = Date.now();
          if (now - lastFetched < 60000) {
            return; // Skip if we fetched recently
          }
          
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const response = await axios.get('http://localhost:5001/api/streaks', config);
          setStreak(response.data.data);
          setLastFetched(now);
        } catch (error) {
          console.error('Error fetching initial streak:', error);
        }
      };
      fetchStreak();
    }
  }, [user, lastFetched]);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    
    try {
      // First update the streak on the server
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Update streak on server
      await axios.put('http://localhost:5001/api/streaks/update', {}, config);
      
      // Then fetch the latest streak data
      const response = await axios.get('http://localhost:5001/api/streaks', config);
      setStreak(response.data.data);
      setLastFetched(Date.now());
      return response.data.data;
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user]);

  const value = {
    streak,
    updateStreak
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export default StreakContext;
