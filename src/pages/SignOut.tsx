import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignOut: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName) {
      setError('Please enter both first and last name.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/signout-by-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        setMessage('');
      } else {
        setMessage(`Signed out successfully at ${new Date(data.user.signedOutAt).toLocaleString()}`);
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign Out</h2>

        <form onSubmit={handleSignOut} style={styles.form}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Sign Out</button>
        </form>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <button onClick={() => navigate('/')} style={styles.homeButton}>← Back to Home</button>
      </div>
    </div>
  );
};

export default SignOut;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: 6,
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#dc3545',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  homeButton: {
    marginTop: '1rem',
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#6c757d',
    color: '#fff',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    marginTop: '1rem',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
  },
};
