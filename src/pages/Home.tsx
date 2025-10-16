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
    meetingWith: '',
  });

  const [error, setError] = useState('');

  const plants = ['Cement', 'Delta', 'Hoban', 'Poteet', 'Rio Medina', 'Solms'];
  
  const cementMeetingOptions = [
    'Brittney Hill - Jr. Process Engineer',
    'Alexis Navarro - HR Generalist',
    'Adam Ybarra - Safety Manager',
    'William Aiken - QC Supervisor',
    'Robert Alvarado - Maintenance Supervisor',
    'Julio Avila - Sr. Process Engineer',
    'Ben Caccamo - Engineer',
    'Michael Castillo - Warehouse Supervisor',
    'Jose Cedeno - Reliability Engineer',
    'Diane Christensen - Procurement Manager',
    'Daniel Davis - Shift Supervisor',
    'James Davis - Electrical Supervisor',
    'Eric Ervin - VP Cement',
    'Jesse Gallegos - Shipping Lead',
    'Keith Gilson - Shift Supervisor',
    'Jose Gonzalez - Maintenance Engineer',
    'Craig Hernandez - Sr. Production Supervisor',
    'Joseph Hernandez - Yard Manager',
    'Richard Jarzombek - Engineering Manager',
    'Eric Kottke - Production Manager',
    'Mario Lira - Automation Engineer',
    'Zach McMahon - Environmental Engineer',
    'Raul Molina - Maintenance Manager',
    'Ramon Rivera - Shift Supervisor',
    'Victor Saucedo - Maintenance Engineer',
    'Jason Stehle - Heavy Equipment Supervisor',
    'Derek Thorington - Plant Manager',
    'Jagger Tiemann - Engineer Tech',
    'Arnie Tovar - Electrical Manager',
    'Mason Vanderweele - Environmental Engineer',
    'Tony Ward - Shift Supervisor',
    'Hernan Williams - Automation Engineer',
    'Scott Wolston - Director Distribution'
  ];

  const allPlantsMeetingOptions = [
    'Adam Ybarra',
    'Jacob Ackerman',
    'William Aiken',
    'Robert Allison',
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

  const getMeetingOptions = () => {
    return formData.plant === 'Cement' ? cementMeetingOptions : allPlantsMeetingOptions;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'plant' && value !== formData.plant) {
      setFormData(prev => ({ ...prev, plant: value, meetingWith: '' }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, plant, email, phone } = formData;

    if (!firstName || !lastName || !plant || !email || !phone) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await fetch('https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/check-user', {
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

  const handleDirectSignIn = async () => {
    const { firstName, lastName, plant, email, phone } = formData;

    if (!firstName || !lastName || !plant || !email || !phone) {
      setError('All fields are required for sign-in.');
      return;
    }

    try {
      const res = await fetch('https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      navigate('/thank-you');
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    }
  };

  const handleSignOut = async () => {
    const { email } = formData;

    if (!email) {
      setError('Please enter your email to sign out.');
      return;
    }

    try {
      const res = await fetch('https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        alert('You have been successfully signed out.');
        // Clear the form
        setFormData({
          firstName: '',
          lastName: '',
          plant: '',
          email: '',
          phone: '',
          meetingWith: '',
        });
        setError('');
      } else {
        setError('Unable to sign out. Please check your email.');
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
              {getMeetingOptions().map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Site Specific Training
          </button>
        </form>

        <button onClick={handleDirectSignIn} style={styles.directSignInButton}>
          Sign In
        </button>

        <button onClick={handleSignOut} style={styles.signOutButton}>
          Sign Out
        </button>

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
  directSignInButton: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#ffc107',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1rem',
    width: '100%',
  },
  signOutButton: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
  },
};