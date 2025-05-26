import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ByteDetail = () => {
  const [byte, setByte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5001/api/byte/${id}`)
      .then(response => {
        setByte(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching byte details:', error);
        setError('Failed to load byte details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!byte) return <p>Byte not found</p>;

  return (
    <section className="byte-detail">
      <div className="back-link">
        <Link to="/all-bytes">← Back to all bytes</Link>
      </div>
      
      <div className="byte-content">
        <h2>{byte.title}</h2>
        
        <div className="byte-meta">
          <span className="category">{byte.category}</span>
          <span className="date">
            {new Date(byte.datePublished).toLocaleDateString()}
          </span>
        </div>
        
        <div className="byte-section">
          <h3>Summary</h3>
          <p>{byte.summary}</p>
        </div>
        
        <div className="byte-section">
          <h3>Example</h3>
          <p>{byte.example}</p>
        </div>
        
        {byte.tags && byte.tags.length > 0 && (
          <div className="tags">
            <h3>Tags</h3>
            <div>
              {byte.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        {byte.quiz && (
          <div className="quiz">
            <h3>Quick Quiz</h3>
            <p>{byte.quiz.question}</p>
            
            {byte.quiz.options.map((option, index) => (
              <label key={index} style={{ display: 'block', margin: '4px 0' }}>
                <input
                  type="radio"
                  name="quiz"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={submitted}
                />{" "}
                {option}
              </label>
            ))}
            
            {!submitted ? (
              <button 
                onClick={handleSubmit} 
                disabled={!selectedOption}
                className="submit-answer"
              >
                Submit Answer
              </button>
            ) : (
              <p className={selectedOption === byte.quiz.correctAnswer ? "correct" : "incorrect"}>
                {selectedOption === byte.quiz.correctAnswer
                  ? "✅ Correct!"
                  : `❌ Incorrect. Correct answer is: ${byte.quiz.correctAnswer}`}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ByteDetail; 