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
  trainingCompleted: boolean;
  trainingDate?: string;
  signedOutAt?: string;
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'trained' | 'untrained'>('all');
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

  const filteredUsers = users.filter(user => {
    if (filter === 'trained') return user.trainingCompleted;
    if (filter === 'untrained') return !user.trainingCompleted;
    return true;
  });

  const trainedCount = users.filter(u => u.trainingCompleted).length;
  const untrainedCount = users.filter(u => !u.trainingCompleted).length;

  const exportToCSV = () => {
  interface CSVRow {
    Name: string;
    Plant: string;
    Email: string;
    Phone: string;
    'Meeting With': string;
    'Training Status': string;
    'Training Date': string;
    'First Login': string;
    'Last Sign Out': string;
  }

  const csvData: CSVRow[] = filteredUsers.map(u => ({
    Name: `${u.firstName} ${u.lastName}`,
    Plant: u.plant,
    Email: u.email,
    Phone: u.phone,
    'Meeting With': u.meetingWith || 'N/A',
    'Training Status': u.trainingCompleted ? 'Completed' : 'Not Completed',
    'Training Date': u.trainingDate ? new Date(u.trainingDate).toLocaleString() : 'N/A',
    'First Login': new Date(u.createdAt).toLocaleString(),
    'Last Sign Out': u.signedOutAt ? new Date(u.signedOutAt).toLocaleString() : 'Currently signed in'
  }));

  if (csvData.length === 0) return;

  const headers = Object.keys(csvData[0]) as (keyof CSVRow)[];
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `safety_training_report_${new Date().toISOString().split('T')[0]}.csv`);
  a.click();
};

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
        ← Back to Home
      </button>
      
      <h2>Site Safety Training Database</h2>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Summary</h3>
        <p><strong>Total Users:</strong> {users.length}</p>
        <p style={{ color: 'green' }}>✓ <strong>Completed Training:</strong> {trainedCount}</p>
        <p style={{ color: 'orange' }}>⨯ <strong>Not Completed:</strong> {untrainedCount}</p>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label>Filter: </label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as 'all' | 'trained' | 'untrained')}
            style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
          >
            <option value="all">All Users</option>
            <option value="trained">Completed Training Only</option>
            <option value="untrained">Not Completed Only</option>
          </select>
        </div>
        
        <button 
          onClick={exportToCSV}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export to CSV
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th>Name</th>
              <th>Plant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Meeting With</th>
              <th>Training Status</th>
              <th>Training Date</th>
              <th>First Login</th>
              <th>Last Sign Out</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.plant}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.meetingWith || 'N/A'}</td>
                <td style={{ 
                  textAlign: 'center',
                  color: u.trainingCompleted ? 'green' : 'orange',
                  fontWeight: 'bold'
                }}>
                  {u.trainingCompleted ? '✓ Completed' : '⨯ Not Completed'}
                </td>
                <td>
                  {u.trainingDate 
                    ? new Date(u.trainingDate).toLocaleString() 
                    : 'N/A'}
                </td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  {u.signedOutAt 
                    ? new Date(u.signedOutAt).toLocaleString() 
                    : 'Currently signed in'}
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