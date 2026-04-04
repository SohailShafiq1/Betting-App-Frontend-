import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import styles from '../styles/Admin.module.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ winRate: 65, upOdds: 1.45, downOdds: 2.1, trend: 'NORMAL' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: name === 'trend' ? value : Number(value) }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.put('/settings', settings);
      setSettings(response.data);
      setMessage('Settings updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>Settings</h2>
            <p>Update win rate, odds, and trend configuration.</p>
          </div>
        </div>

        <form className={styles.settingsForm} onSubmit={handleSubmit}>
          <label>
            Win Rate (%)
            <input type="number" name="winRate" value={settings.winRate} onChange={handleChange} min="0" max="100" required />
          </label>
          <label>
            Up Odds
            <input type="number" name="upOdds" value={settings.upOdds} onChange={handleChange} step="0.01" min="1" required />
          </label>
          <label>
            Down Odds
            <input type="number" name="downOdds" value={settings.downOdds} onChange={handleChange} step="0.01" min="1" required />
          </label>
          <label>
            Trend
            <select name="trend" value={settings.trend} onChange={handleChange}>
              <option value="UP">UP</option>
              <option value="DOWN">DOWN</option>
              <option value="NORMAL">NORMAL</option>
            </select>
          </label>

          {message && <div className={styles.success}>{message}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  );
}
