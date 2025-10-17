// src/pages/Quiz.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant, email, phone } = location.state || {};

  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const correctAnswers: Record<string, boolean> = {
    q1: true,
    q2: true,
    q3: false,
    q4: true,
    q5: true,
    q6: false,
    q7: true,
    q8: true,
    q9: false,
    q10: true,
  };

  const handleChange = (question: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const allCorrect =
    Object.keys(correctAnswers).length === Object.keys(answers).length &&
    Object.keys(correctAnswers).every(q => answers[q] === correctAnswers[q]);

  const handleSubmit = async () => {
    // Mark training as completed
    await fetch('https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/complete-training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    navigate('/thank-you');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Site Safety Quiz</h2>
      <p style={{ marginBottom: '2rem' }}>Please answer all questions correctly to complete your training.</p>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>1. Signing In and Out of mine site is mandatory.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q1" onChange={() => handleChange('q1', true)} /> True
        </label>
        <label>
          <input type="radio" name="q1" onChange={() => handleChange('q1', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>2. Mining equipment always has the right of way; never assume mining equipment can see you.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q2" onChange={() => handleChange('q2', true)} /> True
        </label>
        <label>
          <input type="radio" name="q2" onChange={() => handleChange('q2', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>3. It's ok to park in blind spots as long as it's only for a short period of time.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q3" onChange={() => handleChange('q3', true)} /> True
        </label>
        <label>
          <input type="radio" name="q3" onChange={() => handleChange('q3', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>4. Drive according to road conditions and obey all traffic signs.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q4" onChange={() => handleChange('q4', true)} /> True
        </label>
        <label>
          <input type="radio" name="q4" onChange={() => handleChange('q4', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>5. Hard Hat, Safety Glasses, Reflective Clothing and Safety Toe Boots are always required when on mine site.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q5" onChange={() => handleChange('q5', true)} /> True
        </label>
        <label>
          <input type="radio" name="q5" onChange={() => handleChange('q5', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>6. Face shields and guards on a handheld grinder are not required when using a handheld grinder?</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q6" onChange={() => handleChange('q6', true)} /> True
        </label>
        <label>
          <input type="radio" name="q6" onChange={() => handleChange('q6', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>7. Fall Protection is required anytime there is a danger of falling.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q7" onChange={() => handleChange('q7', true)} /> True
        </label>
        <label>
          <input type="radio" name="q7" onChange={() => handleChange('q7', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>8. Pre-Shift Inspections and Workplace Examinations must be completed prior to operating equipment or working on task.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q8" onChange={() => handleChange('q8', true)} /> True
        </label>
        <label>
          <input type="radio" name="q8" onChange={() => handleChange('q8', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>9. Park Brakes and Chock Blocks are not required if I get out of my piece of equipment for less than 5 minutes.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q9" onChange={() => handleChange('q9', true)} /> True
        </label>
        <label>
          <input type="radio" name="q9" onChange={() => handleChange('q9', false)} /> False
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>10. Implements such as outriggers, buckets, moldboard, rippers, excavator boom, must be lowered to the ground before getting out of equipment.</strong></p>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" name="q10" onChange={() => handleChange('q10', true)} /> True
        </label>
        <label>
          <input type="radio" name="q10" onChange={() => handleChange('q10', false)} /> False
        </label>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={!allCorrect}
        style={{
          padding: '0.75rem 2rem',
          marginTop: '2rem',
          backgroundColor: allCorrect ? '#28a745' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: allCorrect ? 'pointer' : 'not-allowed'
        }}
      >
        {allCorrect ? 'Submit and Complete Training' : 'Please answer all questions correctly'}
      </button>
    </div>
  );
};

export default Quiz;