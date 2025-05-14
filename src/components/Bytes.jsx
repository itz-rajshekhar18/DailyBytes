import React from 'react';

const Bytes = () => {
  return (
    <section className="bytes">
      <h3>Today's Bytes</h3>
      <h4>Understanding Emotional Intelligence</h4>
      <p>
        Explore the fundamental aspects of emotional intelligence and how it impacts our daily interactions. 
        Learn to recognize and manage emotions effectively.
      </p>
      <div className="quiz">
        <h5>Quick Quiz:</h5>
        <p>Which component of emotional intelligence relates to understanding other people's emotions?</p>
        <label>
          <input type="radio" name="quiz" value="self-awareness" /> Self-awareness
        </label>
        <label>
          <input type="radio" name="quiz" value="social-awareness" /> Social awareness
        </label>
        <button>Read more</button>
      </div>
    </section>
  );
};

export default Bytes;
