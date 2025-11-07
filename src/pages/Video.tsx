// src/pages/Video.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Video: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { firstName, lastName, plant, email } = location.state || {};
  const [videoWatched, setVideoWatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Plant-specific video mapping
  const videoUrls: Record<string, string> = {
    'Cement': '/Capitol Cement Site Specific - Spanish.mp4',
    'Delta': '/Delta Site Safety Video.mp4',
    'Hoban': '/Hoban Site Safety Video.mp4',
    'Poteet': '/Poteet Site Safety Video.mp4',
    'Rio Medina': '/Rio Medina Site Safety Video.mp4',
    'Solms': '/Solms Site Safety Video.mp4',
  };

  const videoUrl = videoUrls[plant] || '/Default Safety Video.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        setProgress(percent);
        
        // Mark as watched when 90% complete
        if (percent >= 90 && !videoWatched) {
          setVideoWatched(true);
          markVideoComplete();
        }
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', () => {
      setVideoWatched(true);
      markVideoComplete();
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', updateProgress);
    };
  }, [videoWatched, email, plant]);

  const markVideoComplete = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/video-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plant }),
      });
    } catch (err) {
      console.error('Failed to mark video as complete:', err);
    }
  };

  const handleNext = async () => {
    if (!videoWatched) {
      alert('Please watch the entire safety video before proceeding to the quiz.');
      return;
    }

    setLoading(true);
    navigate('/quiz', { 
      state: { firstName, lastName, plant, email } 
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Safety Training Video</h2>
        <p style={styles.subtitle}>
          {plant} Plant - {firstName} {lastName}
        </p>
        
        <div style={styles.videoContainer}>
          <video 
            ref={videoRef}
            width="100%" 
            height="auto"
            controls
            controlsList="nodownload"
            style={styles.video}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
                backgroundColor: progress >= 90 ? '#28a745' : '#007bff'
              }}
            />
          </div>
          <p style={styles.progressText}>
            {progress >= 90 ? '✓ Video Complete' : `Progress: ${Math.round(progress)}%`}
          </p>
        </div>

        <div style={styles.instructions}>
          <p>⚠️ <strong>Important:</strong></p>
          <ul style={styles.list}>
            <li>You must watch the entire video before proceeding</li>
            <li>The quiz will be available after video completion</li>
            <li>You must pass the quiz to complete your training</li>
          </ul>
        </div>

        <button 
          onClick={handleNext} 
          style={{
            ...styles.button,
            backgroundColor: videoWatched ? '#28a745' : '#6c757d',
            cursor: videoWatched ? 'pointer' : 'not-allowed'
          }}
          disabled={!videoWatched || loading}
        >
          {loading ? 'Loading...' : videoWatched ? 'Continue to Quiz →' : 'Complete Video First'}
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
    marginBottom: '1.5rem',
    color: '#666',
  },
  videoContainer: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  video: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
  progressContainer: {
    marginBottom: '1.5rem',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  progressText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: 8,
    marginBottom: '1.5rem',
  },
  list: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
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
};

export default Video;