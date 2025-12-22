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
  const [loading, setLoading] = useState(false);

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
    'Scott Wolston - Director Distribution',
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
    'Scott Wolston',
  ];

  const getMeetingOptions = () => {
    return formData.plant === 'Cement' ? cementMeetingOptions : allPlantsMeetingOptions;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'plant' && value !== formData.plant) {
      setFormData((prev) => ({ ...prev, plant: value, meetingWith: '' }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const validateForm = () => {
    const { firstName, lastName, plant, email, phone, meetingWith } = formData;
    if (!firstName || !lastName || !plant || !email || !phone || !meetingWith) {
      setError('All fields are required.');
      return false;
    }
    return true;
  };

  const apiUrl =
    process.env.REACT_APP_API_URL ||
    'https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net';

  // Sign In - for visitors/contractors who need training
  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === 'existing') {
        // User has completed training - log them in
        await fetch(`${apiUrl}/api/sign-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        navigate('/thank-you?existing=true');
      } else {
        // User needs training - go to video
        navigate('/video', { state: formData });
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    }
    setLoading(false);
  };

  // Continue - for employees who don't need training
  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await fetch(`${apiUrl}/api/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isEmployee: true }),
      });
      navigate('/thank-you?existing=true');
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Site Safety Login</h2>
        <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
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

          {formData.plant && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Meeting With</label>
              <select
                name="meetingWith"
                value={formData.meetingWith}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select a person</option>
                {getMeetingOptions().map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            style={styles.signInButton}
          >
            {loading ? 'Please wait...' : 'Sign In (Visitor/Contractor)'}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            style={styles.continueButton}
          >
            {loading ? 'Please wait...' : 'Continue (Employee)'}
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
  signInButton: {
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
  continueButton: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  adminButton: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#6c757d',
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