import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import './Bytes.css';

const Bytes = () => {
  const [todayByte, setTodayByte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fetch today's byte only
  useEffect(() => {
    axios.get('http://localhost:5001/api/byte/today')
      .then(response => {
        setTodayByte(response.data.data);
        // Check if user has already answered this byte's quiz
        if (response.data.data && response.data.data._id) {
          const savedResponse = localStorage.getItem(`byte_response_${response.data.data._id}`);
          if (savedResponse) {
            const savedData = JSON.parse(savedResponse);
            setSelectedOption(savedData.selectedOption);
            setSubmitted(true);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching today\'s byte:', error);
        setError('Failed to load today\'s byte');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    // Save response to localStorage to prevent changes
    if (todayByte && todayByte._id) {
      localStorage.setItem(`byte_response_${todayByte._id}`, JSON.stringify({
        selectedOption,
        timestamp: new Date().toISOString()
      }));
    }
  };

  if (loading) return <div className="bytes-loading">Loading...</div>;
  if (error) return <div className="bytes-error">{error}</div>;

  return (
    <section className="bytes-section">
      <h2 className="bytes-title">Today's Bytes</h2>
      
      {todayByte && (
        <div className="byte-card">
          <div className="byte-header">
            <h3>{todayByte.title}</h3>
            <span className="byte-tag">{todayByte.category || 'Psychology'}</span>
          </div>
          
          <p className="byte-summary">
            {todayByte.summary}
          </p>

          {todayByte.quiz && (
            <div className="byte-quiz">
              <h4>Quick Quiz:</h4>
              <p className="quiz-question">{todayByte.quiz.question}</p>
              
              <div className="quiz-options">
                {todayByte.quiz.options.map((option, index) => (
                  <label key={index} className={`quiz-option ${submitted && selectedOption === option ? 'selected' : ''}`}>
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
