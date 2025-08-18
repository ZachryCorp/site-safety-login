import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  plant: string;
  email: string;
  phone: string;
  meetingWith?: string;
  createdAt: string;
  signedOutAt?: string | null;
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleSignOut = async (id: number) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/signout/${id}`, {
        method: 'POST',
      });
      // Update UI to reflect sign-out
      setUsers((prev) =>
        prev.filter((u) => u.id !== id) // remove user from list after sign out
      );
    } catch (err) {
      console.error('Error signing out user', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
        ← Back to Home
      </button>
      <h2>Logged In Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: '100%', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Plant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Meeting With</th>
              <th>Login Time</th>
              <th>Sign Out</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.plant}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.meetingWith || '—'}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleSignOut(u.id)}>Sign Out</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
