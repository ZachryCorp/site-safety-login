// src/pages/Video.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Video: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoWatched, setVideoWatched] = useState(false);
  const [progress, setProgress] = useState(0);

  const { firstName, lastName, plant } = location.state || {};

  // Check if user data exists
  useEffect(() => {
    if (!firstName || !lastName || !plant) {
      // Try to get from localStorage as backup
      const storedEmail = localStorage.getItem('userEmail');
      if (!storedEmail) {
        alert('Please sign in first');
        navigate('/');
      }
    }
  }, [firstName, lastName, plant, navigate]);

  const handleNext = () => {
    if (!videoWatched) {
      alert('Please watch the complete training video before proceeding to the quiz.');
      return;
    }
    navigate('/quiz', { state: { firstName, lastName, plant } });
  };

  // Map plants to their specific video files from Azure Blob Storage
  const getVideoSource = (plantName: string) => {
    const baseUrl = 'https://sitesafetyvideos.blob.core.windows.net/training-videos';
    
    const videos: { [key: string]: string } = {
      'Poteet': 'Poteet%20Site%20Specific.mp4',
      'Hoban': 'Hoban%20SIte%20Specific%20Hazard%20Training%20Video%202019.mp4',
      'Rio Medina': 'Rio%20Medina%20Site%20Specific%206.-8-2019.mp4',
      'Solms': 'Solms%20Site%20Specific(2).mp4',
      'Delta': 'Delta%20Site%20Specific%202019.mp4',
      'Cement': 'site%20specific%20-%20Cement.mp4'
    };

    const videoFile = videos[plantName] || videos['Delta']; // Default to Delta if plant not found
    return `${baseUrl}/${videoFile}`;
  };

  const handleVideoLoad = () => {
    setLoading(false);
    setError('');
  };

  const handleVideoError = () => {
    setLoading(false);
    setError('Unable to load video. Please check your connection or contact support.');
  };

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      const percentage = (video.currentTime / video.duration) * 100;
      setProgress(Math.round(percentage));
      
      // Mark as watched if they've seen 95% or more
      if (percentage >= 95 && !videoWatched) {
        setVideoWatched(true);
      }
    }
  };

  const handleVideoEnd = () => {
    setVideoWatched(true);
    setProgress(100);
  };

  const videoSource = getVideoSource(plant);
  const videoTitle = plant ? `${plant} Site Specific Training` : 'Site Specific Training';

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>{videoTitle}</h2>
        
        <div style={styles.userInfo}>
          <p><strong>Trainee:</strong> {firstName} {lastName}</p>
          <p><strong>Plant:</strong> {plant}</p>
        </div>

        <div style={styles.videoContainer}>
          {loading && (
            <div style={styles.loadingMessage}>
              Loading video...
            </div>
          )}
          
          {error && (
            <div style={styles.errorMessage}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} style={styles.retryButton}>
                Retry
              </button>
            </div>
          )}

          <video 
            width="800" 
            height="450" 
            controls 
            controlsList="nodownload"
            style={{ ...styles.video, display: loading ? 'none' : 'block' }}
            key={videoSource} // Force re-render when video source changes
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onTimeUpdate={handleVideoProgress}
            onEnded={handleVideoEnd}
          >
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {!loading && !error && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
            </div>
            <p style={styles.progressText}>
              Progress: {progress}% {videoWatched && '✓ Complete'}
            </p>
          </div>
        )}

        <div style={styles.instructions}>
          <p>Please watch the entire safety training video before proceeding to the quiz.</p>
          {videoWatched ? (
            <p style={styles.successMessage}>
              ✓ Video training complete! You may now proceed to the quiz.
            </p>
          ) : (
            <p style={styles.warningMessage}>
              ⚠ You must watch the full video (95% or more) to continue.
            </p>
          )}
        </div>

        <div style={styles.buttonContainer}>
          <button 
            onClick={handleNext} 
            disabled={!videoWatched}
            style={{
              ...styles.button,
              backgroundColor: videoWatched ? '#28a745' : '#6c757d',
              opacity: videoWatched ? 1 : 0.6,
              cursor: videoWatched ? 'pointer' : 'not-allowed'
            }}
          >
            {videoWatched ? '✓ Continue to Quiz' : 'Complete Video to Continue'}
          </button>
        </div>
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
    marginBottom: '1rem',
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: 8,
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  videoContainer: {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    minHeight: '450px',
  },
  video: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  loadingMessage: {
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  errorMessage: {
    padding: '2rem',
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    border: '1px solid #f5c6cb',
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  progressContainer: {
    marginBottom: '1.5rem',
  },
  progressBar: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.9rem',
    color: '#666',
  },
  instructions: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    border: '1px solid #ffc107',
  },
  successMessage: {
    color: '#155724',
    fontWeight: 'bold',
    marginTop: '0.5rem',
  },
  warningMessage: {
    color: '#856404',
    fontWeight: 'bold',
    marginTop: '0.5rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  button: {
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s',
  },
};

export default Video;