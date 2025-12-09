// src/pages/admin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  plant: string;
  email: string;
  phone: string;
  meetingWith: string | null;
  createdAt: string;
  signedOutAt: string | null;
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL || 'https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net';

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${apiUrl}/api/users`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched users:', data);
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch users', err);
        setError('Failed to load users');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSignOut = async (userId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/sign-out/${userId}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to sign out user');
      }

      // Refresh the user list
      fetchUsers();
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Failed to sign out user');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
        <h2 style={styles.title}>Site Safety Admin Portal</h2>
        <button onClick={fetchUsers} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p>No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Plant</th>
              <th style={styles.th}>Meeting With</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Training</th>
              <th style={styles.th}>Sign In Time</th>
              <th style={styles.th}>Sign Out Time</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={styles.row}>
                <td style={styles.td}>{u.firstName} {u.lastName}</td>
                <td style={styles.td}>{u.plant}</td>
                <td style={styles.td}>{u.meetingWith || '-'}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.phone}</td>
                <td style={styles.td}>
                  <span style={styles.completedBadge}>✓ Completed</span>
                </td>
                <td style={styles.td}>{new Date(u.createdAt).toLocaleString()}</td>
                <td style={styles.td}>
                  {u.signedOutAt ? new Date(u.signedOutAt).toLocaleString() : '-'}
                </td>
                <td style={styles.td}>
                  {u.signedOutAt ? (
                    <span style={styles.signedOutBadge}>Signed Out</span>
                  ) : (
                    <span style={styles.onSiteBadge}>On Site</span>
                  )}
                </td>
                <td style={styles.td}>
                  {!u.signedOutAt && (
                    <button
                      onClick={() => handleSignOut(u.id)}
                      style={styles.signOutButton}
                    >
                      Sign Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    backgroundColor: '#343a40',
    color: '#fff',
  },
  th: {
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: 600,
  },
  row: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '12px 8px',
  },
  completedBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '0.85rem',
  },
  onSiteBadge: {
    backgroundColor: '#cce5ff',
    color: '#004085',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  signedOutBadge: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '0.85rem',
  },
  signOutButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};

export default Admin;