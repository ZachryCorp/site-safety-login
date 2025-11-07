// src/pages/ThankYou.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const existing = searchParams.get('existing') === 'true';
  const trained = searchParams.get('trained') === 'true';
  
  const { passed, score, firstName, lastName, plant, trainingRecord } = location.state || {};

  const handleBackToHome = () => {
    navigate('/');
  };

  // Different messages based on context
  let message = '';
  let subtitle = '';
  let status = 'success';

  if (passed) {
    // Just completed training successfully
    message = 'Training Complete!';
    subtitle = `Congratulations ${firstName} ${lastName}! You have successfully completed the safety training for ${plant} plant with a score of ${score}%.`;
    status = 'success';
  } else if (existing && trained) {
    // Returning user who has already trained
    message = 'Welcome Back!';
    subtitle = `Hello ${firstName || 'User'}! You have already completed safety training for ${plant || 'this'} plant. You are authorized to access the site.`;
    status = 'info';
  } else if (existing) {
    // Existing user signing in (shouldn't happen with new flow)
    message = 'Sign-In Successful';
    subtitle = 'You have been successfully signed in for today.';
    status = 'info';
  } else {
    // New user added (shouldn't happen with new flow)
    message = 'Registration Complete';
    subtitle = 'You have been added to the system. Please complete the safety training.';
    status = 'warning';
  }

  const getStatusColor = () => {
    switch(status) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#007bff';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{
          ...styles.statusIcon,
          backgroundColor: getStatusColor()
        }}>
          {status === 'success' ? '✓' : status === 'info' ? 'ℹ' : '!'}
        </div>
        
        <h1 style={styles.title}>{message}</h1>
        <p style={styles.subtitle}>{subtitle}</p>

        {trainingRecord && (
          <div style={styles.detailsBox}>
            <h3 style={styles.detailsTitle}>Training Record</h3>
            <div style={styles.detailsGrid}>
              <div>
                <span style={styles.label}>Training Date:</span>
                <span>{new Date(trainingRecord.completedAt || trainingRecord.updatedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span style={styles.label}>Plant:</span>
                <span>{plant}</span>
              </div>
              {trainingRecord.quizScore && (
                <div>
                  <span style={styles.label}>Quiz Score:</span>
                  <span>{trainingRecord.quizScore}%</span>
                </div>
              )}
              <div>
                <span style={styles.label}>Status:</span>
                <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
                  {trainingRecord.trainingCompleted ? 'Complete' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={styles.nextSteps}>
          <h3>Next Steps:</h3>
          <ul style={styles.stepsList}>
            {status === 'success' && (
              <>
                <li>Your training record has been saved</li>
                <li>You are now authorized to access {plant} plant</li>
                <li>Please follow all safety protocols on site</li>
                <li>Remember to sign in/out at the site office</li>
              </>
            )}
            {status === 'info' && trained && (
              <>
                <li>Proceed to the site office to sign in</li>
                <li>Your training is valid for this location</li>
                <li>Follow all posted safety guidelines</li>
              </>
            )}
            {status === 'warning' && (
              <>
                <li>Complete the safety video training</li>
                <li>Pass the safety quiz with 100%</li>
                <li>Receive your site access authorization</li>
              </>
            )}
          </ul>
        </div>

        <button onClick={handleBackToHome} style={styles.button}>
          Return to Home
        </button>

        {(status === 'success' || (status === 'info' && trained)) && (
          <p style={styles.printNote}>
            Please take a screenshot of this page for your records.
          </p>
        )}
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
    maxWidth: 600,
    textAlign: 'center',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    color: '#fff',
    margin: '0 auto 1.5rem',
  },
  title: {
    marginBottom: '1rem',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
  detailsBox: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: 8,
    marginBottom: '2rem',
    textAlign: 'left',
  },
  detailsTitle: {
    marginBottom: '1rem',
    color: '#333',
    fontSize: '1.1rem',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '0.5rem',
    color: '#555',
  },
  nextSteps: {
    textAlign: 'left',
    marginBottom: '2rem',
  },
  stepsList: {
    marginTop: '0.5rem',
    paddingLeft: '1.5rem',
    color: '#666',
    lineHeight: 1.8,
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
    transition: 'background-color 0.2s',
  },
  printNote: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default ThankYou;