import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Video: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant } = location.state || {};

  const handleNext = () => {
    navigate('/quiz', { state: { firstName, lastName, plant } });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Training Video</h2>
        <video
          width="100%"
          height="auto"
          autoPlay
          controls
          style={styles.video}
        >
          <source src="/Delta Site Specific 2019.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button onClick={handleNext} style={styles.button}>
          Continue to Quiz
        </button>
      </div>
    </div>
  );
};

export default Video;

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
    maxWidth: 800,
    width: '100%',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  video: {
    maxWidth: '100%',
    borderRadius: 8,
    marginBottom: '2rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
