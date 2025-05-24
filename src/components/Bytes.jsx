import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="bytes">
      {todayByte && (
        <div className="today-byte">
          <h3>Today's Byte</h3>
          <h4>{todayByte.title}</h4>
          <p>{todayByte.summary}</p>

          {todayByte.quiz && (
            <div className="quiz">
              <h5>Quick Quiz:</h5>
              <p>{todayByte.quiz.question}</p>
              {todayByte.quiz.options.map((option, index) => (
                <label key={index} style={{ display: 'block', margin: '4px 0' }}>
                  <input
                    type="radio"
                    name="quiz"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />{" "}
                  {option}
                </label>
              ))}
              {!submitted ? (
                <button onClick={handleSubmit} disabled={!selectedOption}>
                  Submit Answer
                </button>
              ) : (
                <p>
                  {selectedOption === todayByte.quiz.correctAnswer
                    ? "✅ Correct!"
                    : `❌ Incorrect. Correct answer is: ${todayByte.quiz.correctAnswer}`}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Bytes;
