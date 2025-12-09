import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    plant: '',
    email: '',
    phone: '',
  });

  const [error, setError] = useState('');

  const plants = ['Cement', 'Delta', 'Hoban', 'Poteet', 'Rio Medina', 'Solms'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, plant, email, phone } = formData;

    if (!firstName || !lastName || !plant || !email || !phone) {
      setError('All fields are required.');
      return;
    }

    try {
      console.log('Sending data to backend:', formData);
      console.log('API URL:', process.env.REACT_APP_API_URL || 'NOT SET - using default');
      
      const apiUrl = process.env.REACT_APP_API_URL || 'https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net';
      const fullUrl = `${apiUrl}/api/users`;
      console.log('Full URL:', fullUrl);

      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      // Get the response as text first to see what's actually being returned
      const responseText = await res.text();
      console.log('Raw response:', responseText);

      if (!res.ok) {
        console.error('Server error. Status:', res.status, 'Response:', responseText);
        setError(`Server error (${res.status}): ${responseText}`);
        return;
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        setError('Invalid response from server');
        return;
      }

      if (data.status === 'existing' && !data.needsTraining) {
        navigate('/thank-you?existing=true');
      } else {
        navigate('/video', { state: formData });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Site Safety Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Plant</label>
            <select
              name="plant"
              value={formData.plant}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select a plant</option>
              {plants.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.error}>{error}</p>
              <p style={styles.errorHint}>Check the browser console for more details</p>
            </div>
          )}

          <button type="submit" style={styles.button}>
            Continue
          </button>
        </form>

        <button onClick={() => navigate('/admin')} style={styles.adminButton}>
          Go to Admin Portal
        </button>
      </div>
    </div>
  );
}

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
    maxWidth: 450,
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: 4,
    fontWeight: 500,
  },
  input: {
    padding: '0.5rem',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: '1rem',
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
    marginTop: '1rem',
  },
  adminButton: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1rem',
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    margin: 0,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #ffcdd2',
    borderRadius: 4,
    padding: '0.5rem',
  },
  errorHint: {
    color: '#666',
    fontSize: '0.8rem',
    margin: '4px 0 0 0',
  },
};
