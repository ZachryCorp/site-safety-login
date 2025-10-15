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
  createdAt: string;
  meetingWith?: string;
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched users:', data);
        setUsers(data);
      })
      .catch((err) => {
        console.error('Failed to fetch users', err);
      });
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.plant}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.meetingWith || 'N/A'}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;