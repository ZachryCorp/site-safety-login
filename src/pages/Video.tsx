// src/pages/Video.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Video: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant } = location.state || {};

  const handleNext = () => {
    navigate('/quiz', { state: { firstName, lastName, plant } });
  };

  // Map plants to their specific video files from Azure Blob Storage
  const getVideoSource = (plantName: string) => {
    const baseUrl = 'https://sitesafetyvideos.blob.core.windows.net/training-videos';
    switch (plantName) {
      case 'Poteet':
        return `${baseUrl}/Poteet Site Specific.mp4`;
      case 'Hoban':
        return `${baseUrl}/Hoban SIte Specific Hazard Training Video 2019.mp4`;
      case 'Rio Medina':
        return `${baseUrl}/Rio Medina Site Specific 6.-8-2019.mp4`;
      case 'Solms':
        return `${baseUrl}/Solms Site Specific(2).mp4`;
      case 'Delta':
        return `${baseUrl}/Delta Site Specific 2019.mp4`;
      case 'Cement':
      default:
        return `${baseUrl}/Delta Site Specific 2019.mp4`;
    }
  };

  const videoSource = getVideoSource(plant);
  const videoTitle = plant ? `${plant} Site Specific Training` : 'Site Specific Training';

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>{videoTitle}</h2>
        <div style={styles.videoContainer}>
          <video 
            width="800" 
            height="450" 
            controls 
            style={styles.video}
            key={videoSource} // Force re-render when video source changes
          >
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
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
    padding: '2rem',
  },
  content: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '900px',
    width: '100%',
  },
  title: {
    marginBottom: '1.5rem',
    color: '#333',
  },
  videoContainer: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  video: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  button: {
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default Video;