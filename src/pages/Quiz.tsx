import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 🔁 Shuffle helper
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant } = location.state || {};

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

  const originalQuestions = [
    { key: 'q1', text: 'Signing In and Out of mine site is mandatory.' },
    { key: 'q2', text: 'Mining equipment always has the right of way; never assume mining equipment can see you.' },
    { key: 'q3', text: 'It’s ok to park in blind spots as long as it’s only for a short period of time.' },
    { key: 'q4', text: 'Drive according to road conditions and obey all traffic signs.' },
    { key: 'q5', text: 'Hard Hat, Safety Glasses, Reflective Clothing and Safety Toe Boots are always required when on mine site.' },
    { key: 'q6', text: 'Face shields and guards on a handheld grinder are not required when using a handheld grinder?' },
    { key: 'q7', text: 'Fall Protection is required anytime there is a danger of falling.' },
    { key: 'q8', text: 'Pre-Shift Inspections and Workplace Examinations must be completed prior to operating equipment or working on task.' },
    { key: 'q9', text: 'Park Brakes and Chock Blocks are not required if I get out of my piece of equipment for less than 5 minutes.' },
    { key: 'q10', text: 'Implements such as outriggers, buckets, moboard, rippers, excavator boom, must be lowered to the ground before getting out of equipment.' },
  ];

  const [questions] = useState(() => shuffle(originalQuestions));

  const handleChange = (question: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const isComplete = Object.keys(correctAnswers).length === Object.keys(answers).length;
  const isAllCorrect = isComplete && Object.keys(correctAnswers).every(q => answers[q] === correctAnswers[q]);

  const handleSubmit = async () => {
    await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, plant }),
    });

    if (isAllCorrect) {
      navigate('/thank-you');
    } else {
      navigate('/video');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Site Safety Quiz</h2>
        <form style={styles.form}>
          {questions.map(({ key, text }, index) => (
            <div key={key} style={styles.questionBlock}>
              <p style={styles.question}><strong>{index + 1}.</strong> {text}</p>
              <label style={styles.option}>
                <input
                  type="radio"
                  name={key}
                  onChange={() => handleChange(key, true)}
                  checked={answers[key] === true}
                />
                True
              </label>
              <label style={styles.option}>
                <input
                  type="radio"
                  name={key}
                  onChange={() => handleChange(key, false)}
                  checked={answers[key] === false}
                />
                False
              </label>
            </div>
          ))}
        </form>

        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          style={{
            ...styles.button,
            backgroundColor: isComplete ? '#007bff' : '#ccc',
            cursor: isComplete ? 'pointer' : 'not-allowed',
          }}
        >
          Submit
        </button>

        {!isAllCorrect && isComplete && (
          <p style={styles.hint}>Some answers are incorrect. You will be redirected to the training video.</p>
        )}
      </div>
    </div>
  );
};

export default Quiz;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#f4f4f4',
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
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  questionBlock: {
    marginBottom: '1rem',
  },
  question: {
    marginBottom: '0.5rem',
    fontSize: '1rem',
  },
  option: {
    display: 'inline-block',
    marginRight: '1.5rem',
    fontSize: '0.95rem',
  },
  button: {
    marginTop: '2rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
  },
  hint: {
    marginTop: '1rem',
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },
};
