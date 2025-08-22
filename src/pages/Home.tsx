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
    meetingWith: '', // Add this field
  });

  const [error, setError] = useState('');

  const plants = ['Cement', 'Delta', 'Hoban', 'Poteet', 'Rio Medina', 'Solms'];
  
  const meetingWithOptions = [
    'Adam Ybarra',
    'Jacob Ackerman', 
    'William Aiken',
    'Robert Alvarado',
    'Julio Avila',
    'Benjamin Caccamo',
    'Michael Castillo',
    'Jose Cedeno',
    'Diane Christensen',
    'Daniel Davis',
    'James Davis',
    'Eric Ervin',
    'Jesse Gallegos',
    'Keith Gilson',
    'Jose Gonzalez',
    'Craig Hernandez',
    'Joseph Hernandez',
    'Richard Jarzombek',
    'Erik Kottke',
    'Mario Lira',
    'Zachary McMahon',
    'Raul Molina',
    'Ramon Riviera',
    'Jason Stehle',
    'Derek E. Thorington',
    'Jagger Tieman',
    'Arnie Tovar',
    'Mason Vanderweele',
    'Tony Ward',
    'Mike Watson',
    'Hernan Williams',
    'Scott Wolston'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, plant, email, phone, meetingWith } = formData;

    if (!firstName || !lastName || !plant || !email || !phone) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === 'existing') {
        navigate('/thank-you');
      } else {
        navigate('/video', { state: formData });
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Meeting With</label>
            <select
              name="meetingWith"
              value={formData.meetingWith}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select a person (optional)</option>
              {meetingWithOptions.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

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
  },
};