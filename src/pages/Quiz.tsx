// src/pages/Quiz.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant, email } = location.state || {};
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    { id: 'q1', text: 'Signing In and Out of mine site is mandatory.', correct: true },
    { id: 'q2', text: 'Mining equipment always has the right of way; never assume mining equipment can see you.', correct: true },
    { id: 'q3', text: 'It\'s ok to park in blind spots as long as it\'s only for a short period of time.', correct: false },
    { id: 'q4', text: 'Drive according to road conditions and obey all traffic signs.', correct: true },
    { id: 'q5', text: 'Hard Hat, Safety Glasses, Reflective Clothing and Safety Toe Boots are always required when on mine site.', correct: true },
    { id: 'q6', text: 'Face shields and guards on a handheld grinder are not required when using a handheld grinder?', correct: false },
    { id: 'q7', text: 'Fall Protection is required anytime there is a danger of falling.', correct: true },
    { id: 'q8', text: 'Pre-Shift Inspections and Workplace Examinations must be completed prior to operating equipment or working on task.', correct: true },
    { id: 'q9', text: 'Park Brakes and Chock Blocks are not required if I get out of my piece of equipment for less than 5 minutes.', correct: false },
    { id: 'q10', text: 'Implements such as outriggers, buckets, moboard, rippers, excavator boom, must be lowered to the ground before getting out of equipment.', correct: true },
  ];

  const handleChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitted(true);
    setLoading(true);
    
    const quizScore = calculateScore();
    setScore(quizScore);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          plant,
          score: quizScore
        }),
      });

      const data = await response.json();
      
      if (data.passed) {
        // Quiz passed - redirect to thank you
        navigate('/thank-you', { 
          state: { 
            passed: true,
            score: quizScore,
            firstName,
            lastName,
            plant
          } 
        });
      } else {
        // Quiz failed - show results
        setShowResults(true);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Quiz Results</h2>
          <div style={styles.resultsBox}>
            <p style={styles.scoreText}>Your Score: {score}%</p>
            <p style={styles.failText}>
              You need 100% to pass the safety quiz.
            </p>
            <p>Review the questions you missed:</p>
            <ul style={styles.incorrectList}>
              {questions.filter(q => answers[q.id] !== q.correct).map(q => (
                <li key={q.id}>
                  Question {q.id.substring(1)}: {q.text}
                  <br />
                  <span style={styles.correctAnswer}>
                    Correct answer: {q.correct ? 'True' : 'False'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleRetry} style={styles.retryButton}>
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Safety Training Quiz</h2>
        <p style={styles.subtitle}>
          {plant} Plant - {firstName} {lastName}
        </p>
        <p style={styles.instructions}>
          Answer all questions correctly to complete your training.
        </p>

        <div style={styles.questionsContainer}>
          {questions.map((q, index) => (
            <div key={q.id} style={styles.question}>
              <p style={styles.questionText}>
                <strong>{index + 1}.</strong> {q.text}
              </p>
              <div style={styles.options}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name={q.id}
                    checked={answers[q.id] === true}
                    onChange={() => handleChange(q.id, true)}
                    disabled={submitted}
                  />
                  <span>True</span>
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name={q.id}
                    checked={answers[q.id] === false}
                    onChange={() => handleChange(q.id, false)}
                    disabled={submitted}
                  />
                  <span>False</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.progressIndicator}>
          {Object.keys(answers).length} of {questions.length} questions answered
        </div>

        <button 
          onClick={handleSubmit} 
          style={{
            ...styles.button,
            backgroundColor: Object.keys(answers).length === questions.length ? '#007bff' : '#6c757d',
            cursor: Object.keys(answers).length === questions.length ? 'pointer' : 'not-allowed'
          }}
          disabled={submitted || loading || Object.keys(answers).length !== questions.length}
        >
          {loading ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 800,
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#666',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#dc3545',
    fontWeight: 500,
  },
  questionsContainer: {
    marginBottom: '1.5rem',
  },
  question: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: 8,
    marginBottom: '1rem',
  },
  questionText: {
    marginBottom: '0.75rem',
    lineHeight: 1.5,
  },
  options: {
    display: 'flex',
    gap: '2rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  progressIndicator: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: '#666',
    fontSize: '0.9rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
  resultsBox: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: 8,
    marginBottom: '1.5rem',
  },
  scoreText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  failText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  incorrectList: {
    marginTop: '1rem',
    paddingLeft: '1.5rem',
  },
  correctAnswer: {
    color: '#28a745',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  retryButton: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#ffc107',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default Quiz;