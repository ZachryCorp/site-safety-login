// src/pages/admin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  company: string | null;
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

      fetchUsers();
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Failed to sign out user');
    }
  };

  const generateCertificate = (user: User) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const trainingDate = new Date(user.createdAt);
    const expirationDate = new Date(user.createdAt);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Blue header
    doc.setFillColor(30, 80, 140);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Site Specific Certificate', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Complies with 30 CFR § 46.11', pageWidth / 2, 30, { align: 'center' });

    // Company info
    doc.setFontSize(16);
    doc.text('Capitol Aggregates', pageWidth / 2, 42, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Capitol ${user.plant}`, pageWidth / 2, 48, { align: 'center' });

    // Certificate details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    const startY = 70;
    const labelX = 50;
    const valueX = 110;
    const lineHeight = 12;

    const fields = [
      ['First Name', user.firstName],
      ['Last Name', user.lastName],
      ['Company', user.company || 'N/A'],
      ['Training Date', trainingDate.toLocaleDateString()],
      ['Expiration Date', expirationDate.toLocaleDateString()],
      ['Training Version', trainingDate.toISOString()],
      ['Site Contact', user.meetingWith || 'N/A'],
      ['Language', 'English'],
    ];

    fields.forEach((field, index) => {
      const y = startY + index * lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text(field[0], labelX, y);
      doc.setFont('helvetica', 'normal');
      doc.text(field[1], valueX, y);
    });

    // Version number at bottom
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`v-${user.id}`, pageWidth / 2, 180, { align: 'center' });

    // Border
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(10, 55, pageWidth - 20, 140, 3, 3);

    // Save
    doc.save(`certificate-${user.firstName}-${user.lastName}.pdf`);
  };

  const getExpirationDate = (createdAt: string) => {
    const date = new Date(createdAt);
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString();
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
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Plant</th>
                <th style={styles.th}>Meeting With</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Training Date</th>
                <th style={styles.th}>Expiration</th>
                <th style={styles.th}>Sign In Time</th>
                <th style={styles.th}>Sign Out Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={styles.row}>
                  <td style={styles.td}>{u.firstName} {u.lastName}</td>
                  <td style={styles.td}>{u.company || '-'}</td>
                  <td style={styles.td}>{u.plant}</td>
                  <td style={styles.td}>{u.meetingWith || '-'}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.phone}</td>
                  <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>{getExpirationDate(u.createdAt)}</td>
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
                    <div style={styles.actionButtons}>
                      {!u.signedOutAt && (
                        <button
                          onClick={() => handleSignOut(u.id)}
                          style={styles.signOutButton}
                        >
                          Sign Out
                        </button>
                      )}
                      <button
                        onClick={() => generateCertificate(u)}
                        style={styles.certButton}
                      >
                        Certificate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
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
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: '1200px',
  },
  headerRow: {
    backgroundColor: '#343a40',
    color: '#fff',
  },
  th: {
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  row: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '12px 8px',
    whiteSpace: 'nowrap',
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
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
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
  certButton: {
    padding: '6px 12px',
    backgroundColor: '#17a2b8',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};

export default Admin;