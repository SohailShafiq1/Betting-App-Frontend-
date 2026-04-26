import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Admin.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [API_URL, token]);

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>Users</h2>
            <p>View all active users registered on the platform.</p>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingSpinner}>Loading users...</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No active users found.</p>
          </div>
        ) : (
          <div className={styles.usersGrid}>
            {users.map((user) => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userHeader}>
                  <div>
                    <h3>{user.name}</h3>
                    <p className={styles.userMeta}>{user.email}</p>
                  </div>
                  <span className={styles.userRole}>User</span>
                </div>

                <div className={styles.userStats}>
                  <div className={styles.userStatItem}>
                    <span>Wallet</span>
                    <strong>${Number(user.wallet || 0).toFixed(2)}</strong>
                  </div>
                  <div className={styles.userStatItem}>
                    <span>Joined</span>
                    <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
