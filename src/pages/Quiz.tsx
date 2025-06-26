// src/pages/Quiz.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant } = location.state || {};
  const [correct, setCorrect] = useState(false);

  const handleSubmit = async () => {
    // 👇 Replace with real API call to add new user
    await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, plant }),
    });

    navigate('/thank-you');
  };

  return (
    <div>
      <h2>Quiz</h2>
      <p>What should you wear on a construction site?</p>
      <label>
        <input
          type="radio"
          name="q1"
          onChange={() => setCorrect(true)}
        />
        Hard hat, vest, and steel-toed boots
      </label><br />
      <label>
        <input
          type="radio"
          name="q1"
          onChange={() => setCorrect(false)}
        />
        Flip flops and sunglasses
      </label><br />
      <button onClick={handleSubmit} disabled={!correct}>
        Submit
      </button>
    </div>
  );
};

export default Quiz;

