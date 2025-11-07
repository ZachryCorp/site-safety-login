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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.needsTraining) {
        // User needs to complete training for this plant
        navigate('/video', { state: formData });
      } else {
        // User has already completed training for this plant
        navigate('/thank-you?existing=true&trained=true', { 
          state: { 
            ...formData,
            trainingRecord: data.trainingRecord 
          } 
        });
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Site Safety Login</h2>
        <p style={styles.subtitle}>Capitol Aggregates Safety Training System</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Plant Location *</label>
            <select
              name="plant"
              value={formData.plant}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
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
            <label style={styles.label}>Email *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="(555) 123-4567"
              required
              disabled={loading}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <div style={styles.divider}>
          <hr style={styles.hr} />
          <span style={styles.dividerText}>Admin Access</span>
          <hr style={styles.hr} />
        </div>

        <button 
          onClick={() => navigate('/admin')} 
          style={styles.adminButton}
          disabled={loading}
        >
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
    maxWidth: 450,
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
    fontSize: '0.9rem',
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
    color: '#555',
  },
  input: {
    padding: '0.5rem',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
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
    transition: 'background-color 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0 1rem',
  },
  hr: {
    flex: 1,
    border: 'none',
    borderTop: '1px solid #ddd',
  },
  dividerText: {
    padding: '0 1rem',
    color: '#999',
    fontSize: '0.85rem',
  },
  adminButton: {
    padding: '0.75rem',
    border: '1px solid #28a745',
    borderRadius: 6,
    backgroundColor: 'transparent',
    color: '#28a745',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
};