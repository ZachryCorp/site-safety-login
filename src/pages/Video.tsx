// src/pages/Video.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Video: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant, email, phone } = location.state || {};

  // Map plant names to Azure Blob Storage video filenames
  const videoMap: Record<string, string> = {
    'Cement': 'site specific - Cement.mp4',
    'Delta': 'Delta Site Specific 2019.mp4',
    'Hoban': 'Hoban SIte Specific Hazard Training Video 2019.mp4',
    'Poteet': 'Poteet Site Specific.mp4',
    'Rio Medina': 'Rio Medina Site Specific 6.-8-2019.mp4',
    'Solms': 'Solms Site Specific(2).mp4',
  };

  const baseUrl = 'https://sitesafetyvideos.blob.core.windows.net/training-videos/';
  const videoFilename = videoMap[plant] || '';
  const videoUrl = baseUrl + encodeURIComponent(videoFilename);

  const handleNext = () => {
    navigate('/quiz', { state: { firstName, lastName, plant, email, phone } });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{plant} Site Safety Training</h2>
        <p style={styles.subtitle}>Please watch the entire video before continuing.</p>
        
        {videoFilename ? (
          <video width="100%" style={styles.video} controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p style={styles.error}>No video available for selected plant.</p>
        )}
        
        <button onClick={handleNext} style={styles.button}>
          Continue to Quiz
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
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '1.5rem',
  },
  video: {
    borderRadius: 8,
    backgroundColor: '#000',
  },
  button: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1.5rem',
    width: '100%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
};

export default Video;
