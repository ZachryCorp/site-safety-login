// src/pages/admin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TrainingRecord = {
  id: number;
  plant: string;
  videoWatched: boolean;
  videoCompletedAt: string | null;
  quizPassed: boolean;
  quizScore: number | null;
  quizCompletedAt: string | null;
  trainingCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  trainingRecords: TrainingRecord[];
};

type Stats = {
  totalUsers: number;
  totalTrainingRecords: number;
  completedTraining: number;
  completionRate: number;
  byPlant: { plant: string; count: number }[];
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    plant: '',
    trained: '',
    search: ''
  });
  
  const navigate = useNavigate();

  const plants = ['All', 'Cement', 'Delta', 'Hoban', 'Poteet', 'Rio Medina', 'Solms'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await fetch(`${process.env.REACT_APP_API_URL}/api/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Fetch stats
      const statsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/training-stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by plant
    if (filter.plant && filter.plant !== 'All') {
      filtered = filtered.filter(user => 
        user.trainingRecords.some(tr => tr.plant === filter.plant)
      );
    }

    // Filter by training status
    if (filter.trained === 'true') {
      filtered = filtered.filter(user => 
        user.trainingRecords.some(tr => tr.trainingCompleted)
      );
    } else if (filter.trained === 'false') {
      filtered = filtered.filter(user => 
        !user.trainingRecords.some(tr => tr.trainingCompleted) || user.trainingRecords.length === 0
      );
    }

    // Search filter
    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Plant', 'Training Status', 'Quiz Score', 'Completion Date'];
    const rows = filteredUsers.flatMap(user => {
      if (user.trainingRecords.length === 0) {
        return [[
          `${user.firstName} ${user.lastName}`,
          user.email,
          user.phone,
          'N/A',
          'Not Started',
          'N/A',
          'N/A'
        ]];
      }
      return user.trainingRecords.map(tr => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.phone,
        tr.plant,
        tr.trainingCompleted ? 'Complete' : tr.videoWatched ? 'In Progress' : 'Not Started',
        tr.quizScore ? `${tr.quizScore}%` : 'N/A',
        tr.completedAt ? new Date(tr.completedAt).toLocaleDateString() : 'N/A'
      ]);
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
        <h1 style={styles.title}>Training Administration Portal</h1>
      </div>

      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.totalTrainingRecords}</div>
            <div style={styles.statLabel}>Training Sessions</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.completedTraining}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.completionRate}%</div>
            <div style={styles.statLabel}>Completion Rate</div>
          </div>
        </div>
      )}

      <div style={styles.controls}>
        <div style={styles.filters}>
          <select 
            value={filter.plant} 
            onChange={(e) => handleFilterChange('plant', e.target.value)}
            style={styles.select}
          >
            <option value="">All Plants</option>
            {plants.map(p => (
              <option key={p} value={p === 'All' ? '' : p}>{p}</option>
            ))}
          </select>

          <select 
            value={filter.trained} 
            onChange={(e) => handleFilterChange('trained', e.target.value)}
            style={styles.select}
          >
            <option value="">All Status</option>
            <option value="true">Trained</option>
            <option value="false">Not Trained</option>
          </select>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={filter.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button onClick={exportToCSV} style={styles.exportButton}>
          Export to CSV
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Training Records</th>
              <th style={styles.th}>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.noData}>
                  No users found matching your filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={styles.row}>
                  <td style={styles.td}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone}</td>
                  <td style={styles.td}>
                    {user.trainingRecords.length === 0 ? (
                      <span style={styles.statusBadge}>No Training</span>
                    ) : (
                      <div style={styles.trainingList}>
                        {user.trainingRecords.map(tr => (
                          <div key={tr.id} style={styles.trainingItem}>
                            <span style={styles.plantName}>{tr.plant}:</span>
                            {tr.trainingCompleted ? (
                              <span style={{ ...styles.statusBadge, backgroundColor: '#28a745' }}>
                                ✓ Complete ({tr.quizScore}%)
                              </span>
                            ) : tr.videoWatched ? (
                              <span style={{ ...styles.statusBadge, backgroundColor: '#ffc107' }}>
                                In Progress
                              </span>
                            ) : (
                              <span style={{ ...styles.statusBadge, backgroundColor: '#dc3545' }}>
                                Not Started
                              </span>
                            )}
                            {tr.completedAt && (
                              <span style={styles.completedDate}>
                                {new Date(tr.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <p>Total Records: {filteredUsers.length}</p>
        <p>Last Updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '2rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  title: {
    color: '#333',
    marginBottom: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  statLabel: {
    color: '#666',
    fontSize: '0.9rem',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  select: {
    padding: '0.5rem',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: '1rem',
    minWidth: '150px',
  },
  searchInput: {
    padding: '0.5rem',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: '1rem',
    minWidth: '250px',
  },
  exportButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 500,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#f8f9fa',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: 600,
    color: '#333',
    borderBottom: '2px solid #dee2e6',
  },
  row: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '1rem',
    color: '#666',
  },
  trainingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  trainingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  plantName: {
    fontWeight: 500,
    minWidth: '80px',
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: 4,
    fontSize: '0.85rem',
    color: '#fff',
    backgroundColor: '#6c757d',
    whiteSpace: 'nowrap',
  },
  completedDate: {
    fontSize: '0.85rem',
    color: '#999',
    marginLeft: '0.5rem',
  },
  noData: {
    textAlign: 'center',
    padding: '3rem',
    color: '#999',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#666',
    padding: '3rem',
  },
};

export default Admin;