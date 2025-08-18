import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const existing = new URLSearchParams(location.search).get('existing') === 'true';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Thank You</h1>
        {existing ? (
          <p>You have successfully signed in today.</p>
        ) : (
          <p>You have been added to the database. Welcome!</p>
        )}
        <button onClick={() => navigate('/')} style={styles.button}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ThankYou;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  button: {
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
