// src/pages/Quiz.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, company, plant, email, phone, meetingWith } = location.state || {};

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

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
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net';
      
      const res = await fetch(`${apiUrl}/api/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, company, plant, email, phone, meetingWith }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        navigate('/thank-you', { state: { certificate: data.certificate } });
      } else {
        setError('Failed to submit quiz. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{plant} Safety Quiz</h2>
        <p style={styles.subtitle}>You must answer all questions correctly to proceed.</p>

        <div style={styles.questions}>
          <div style={styles.question}>
            <p>1. Signing In and Out of mine site is mandatory.</p>
            <label style={styles.option}>
              <input type="radio" name="q1" onChange={() => handleChange('q1', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q1" onChange={() => handleChange('q1', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>2. Mining equipment always has the right of way; never assume mining equipment can see you.</p>
            <label style={styles.option}>
              <input type="radio" name="q2" onChange={() => handleChange('q2', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q2" onChange={() => handleChange('q2', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>3. It's ok to park in blind spots as long as it's only for a short period of time.</p>
            <label style={styles.option}>
              <input type="radio" name="q3" onChange={() => handleChange('q3', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q3" onChange={() => handleChange('q3', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>4. Drive according to road conditions and obey all traffic signs.</p>
            <label style={styles.option}>
              <input type="radio" name="q4" onChange={() => handleChange('q4', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q4" onChange={() => handleChange('q4', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>5. Hard Hat, Safety Glasses, Reflective Clothing and Safety Toe Boots are always required when on mine site.</p>
            <label style={styles.option}>
              <input type="radio" name="q5" onChange={() => handleChange('q5', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q5" onChange={() => handleChange('q5', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>6. Face shields and guards on a handheld grinder are not required when using a handheld grinder?</p>
            <label style={styles.option}>
              <input type="radio" name="q6" onChange={() => handleChange('q6', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q6" onChange={() => handleChange('q6', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>7. Fall Protection is required anytime there is a danger of falling.</p>
            <label style={styles.option}>
              <input type="radio" name="q7" onChange={() => handleChange('q7', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q7" onChange={() => handleChange('q7', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>8. Pre-Shift Inspections and Workplace Examinations must be completed prior to operating equipment or working on task.</p>
            <label style={styles.option}>
              <input type="radio" name="q8" onChange={() => handleChange('q8', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q8" onChange={() => handleChange('q8', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>9. Park Brakes and Chock Blocks are not required if I get out of my piece of equipment for less than 5 minutes.</p>
            <label style={styles.option}>
              <input type="radio" name="q9" onChange={() => handleChange('q9', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q9" onChange={() => handleChange('q9', false)} /> False
            </label>
          </div>

          <div style={styles.question}>
            <p>10. Implements such as outriggers, buckets, moboard, rippers, excavator boom, must be lowered to the ground before getting out of equipment.</p>
            <label style={styles.option}>
              <input type="radio" name="q10" onChange={() => handleChange('q10', true)} /> True
            </label>
            <label style={styles.option}>
              <input type="radio" name="q10" onChange={() => handleChange('q10', false)} /> False
            </label>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} disabled={!allCorrect} style={{
          ...styles.button,
          backgroundColor: allCorrect ? '#28a745' : '#ccc',
          cursor: allCorrect ? 'pointer' : 'not-allowed',
        }}>
          Submit Quiz
        </button>

        {!allCorrect && Object.keys(answers).length === 10 && (
          <p style={styles.warning}>Some answers are incorrect. Please review and try again.</p>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
    padding: '2rem 1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 700,
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '1.5rem',
  },
  questions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  question: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  option: {
    marginRight: '1.5rem',
    cursor: 'pointer',
  },
  button: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '1.5rem',
    width: '100%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '1rem',
  },
  warning: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: '1rem',
    fontWeight: 500,
  },
};

export default Quiz;