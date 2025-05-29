import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import { useBookmark } from '../context/BookmarkContext';
import AuthContext from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';
import './Bytes.css';

const Bytes = () => {
  const navigate = useNavigate();
  const [todayByte, setTodayByte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showStreakAlert, setShowStreakAlert] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked: checkBookmarkStatus } = useBookmark();
  const { user } = useContext(AuthContext);
  const { streak, updateStreak } = useStreak();

  // Fetch today's byte and check if it's already answered
  useEffect(() => {
    const fetchTodayByte = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/byte/today');
        const byteData = response.data.data;
        setTodayByte(byteData);
        
        if (byteData?._id) {
          // Check bookmark status
          const bookmarkStatus = await checkBookmarkStatus(byteData._id);
          setIsBookmarked(bookmarkStatus);
          
          // Check if already answered
          const savedResponse = localStorage.getItem(`byte_response_${byteData._id}`);
          if (savedResponse) {
            const savedData = JSON.parse(savedResponse);
            setSelectedOption(savedData.selectedOption);
            setSubmitted(true);
            
            // Only show streak message if:
            // 1. It was a correct answer
            // 2. It was answered today
            // 3. The streak message hasn't been shown yet today
            const savedDate = new Date(savedData.timestamp);
            const now = new Date();
            const today = now.toDateString();
            const isSameDay = savedDate.toDateString() === today;
            const streakShownToday = localStorage.getItem(`streak_shown_${today}`);
            
            if (isSameDay && 
                savedData.selectedOption === byteData.quiz.correctAnswer && 
                !streakShownToday) {
              // Set the flag that we've shown the streak for today
              localStorage.setItem(`streak_shown_${today}`, 'true');
              setShowStreakAlert(true);
              
              // Hide streak alert after 5 seconds
              setTimeout(() => {
                setShowStreakAlert(false);
              }, 5000);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching today\'s byte:', error);
        setError('Failed to load today\'s byte');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayByte();
  }, [checkBookmarkStatus, user]);

  // Handle bookmark toggle
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    try {
      if (isBookmarked) {
        await removeBookmark(todayByte._id);
        setIsBookmarked(false);
      } else {
        await addBookmark(todayByte._id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle answer submission
  const handleSubmit = async () => {
    setSubmitted(true);
    
    // Save response to localStorage
    if (todayByte && todayByte._id) {
      localStorage.setItem(`byte_response_${todayByte._id}`, JSON.stringify({
        selectedOption,
        timestamp: new Date().toISOString()
      }));

      // If answer is correct, update streak
      if (selectedOption === todayByte.quiz.correctAnswer) {
        try {
          // Update streak using context
          const updatedStreak = await updateStreak();
          
          // Mark that we've shown the streak for today to avoid showing it again on refresh
          const today = new Date().toDateString();
          localStorage.setItem(`streak_shown_${today}`, 'true');
          
          // Show streak alert for 5 seconds
          setShowStreakAlert(true);
          setTimeout(() => {
            setShowStreakAlert(false);
          }, 5000);

          // Check for badges
          const badgeResponse = await axios.get(
            'http://localhost:5001/api/streaks',
            {
              headers: {
                Authorization: `Bearer ${user?.token}`,
              },
            }
          );

          if (badgeResponse.data.data.badges?.length > 0) {
            setTimeout(() => {
              navigate('/badges');
            }, 2000);
          }
          
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      }
    }
  };

  // Render loading and error states
  if (loading) return <div className="bytes-loading">Loading...</div>;
  if (error) return <div className="bytes-error">{error}</div>;

  return (
    <section className="bytes-section">
      {showStreakAlert && streak.currentStreak > 0 && (
        <div className="streak-alert">
          <FaIcons.FaFire className="streak-icon" />
          <div className="streak-alert-content">
            <p className="streak-count">🔥 {streak.currentStreak} day streak!</p>
          </div>
        </div>
      )}
      
      <h2 className="bytes-title">Today's Byte</h2>
      
      {todayByte && (
        <div className="byte-card">
          <div className="byte-header">
            <h3>{todayByte.title}</h3>
            <div className="byte-actions">
              <span className="byte-tag">{todayByte.category || 'Psychology'}</span>
              <button 
                className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmarkClick}
              >
                {isBookmarked ? <BiIcons.BiBookmarkAlt /> : <BiIcons.BiBookmark />}
              </button>
            </div>
          </div>
          
          <p className="byte-summary">{todayByte.summary}</p>

          {todayByte.quiz && (
            <div className="byte-quiz">
              <h4>Quick Quiz:</h4>
              <p className="quiz-question">{todayByte.quiz.question}</p>
              
              <div className="quiz-options">
                {todayByte.quiz.options.map((option, index) => (
                  <label 
                    key={index} 
                    className={`quiz-option ${
                      submitted 
                        ? option === todayByte.quiz.correctAnswer
                          ? 'correct'
                          : option === selectedOption && option !== todayByte.quiz.correctAnswer
                            ? 'incorrect'
                            : ''
                        : selectedOption === option
                          ? 'selected'
                          : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="quiz"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => !submitted && setSelectedOption(e.target.value)}
                      disabled={submitted}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
              
              {!submitted ? (
                <button 
                  className="quiz-submit-btn" 
                  onClick={handleSubmit} 
                  disabled={!selectedOption}
                >
                  Submit Answer
                </button>
              ) : (
                <p className={`quiz-result ${selectedOption === todayByte.quiz.correctAnswer ? 'correct' : 'incorrect'}`}>
                  {selectedOption === todayByte.quiz.correctAnswer
                    ? "✅ Correct!"
                    : `❌ Incorrect. Correct answer is: ${todayByte.quiz.correctAnswer}`}
                </p>
              )}
            </div>
          )}
          
          <Link to={`/byte/${todayByte._id}`} className="read-more-link">
            Read more <BiIcons.BiRightArrowAlt />
          </Link>
        </div>
      )}
    </section>
  );
};

export default Bytes;
