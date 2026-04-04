import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import styles from '../styles/Admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load admin stats');
      }
    };

    loadStats();
  }, []);

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>Admin Dashboard</h2>
            <p>Monitor users, wallet totals, and platform health.</p>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span>Users</span>
            <strong>{stats?.userCount ?? '—'}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Admins</span>
            <strong>{stats?.adminCount ?? '—'}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Total Wallet</span>
            <strong>${stats?.walletTotal?.toFixed(2) ?? '—'}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Current Admin</span>
            <strong>{stats?.currentAdmin?.email ?? '—'}</strong>
          </article>
        </div>
      </main>
    </div>
  );
}
