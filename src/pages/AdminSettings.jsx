import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import styles from '../styles/Admin.module.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    winRate: 65,
    upOdds: 1.45,
    downOdds: 2.1,
    trend: 'NORMAL',
    coins: [],
  });
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

  const handleCoinChange = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...(prev.coins || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, coins: updated };
    });
    setError('');
    setMessage('');
  };

  const addCoin = () => {
    setSettings((prev) => ({
      ...prev,
      coins: [
        ...(prev.coins || []),
        { name: '', symbol: '', network: '', address: '' },
      ],
    }));
  };

  const removeCoin = (index) => {
    setSettings((prev) => ({
      ...prev,
      coins: prev.coins.filter((_, i) => i !== index),
    }));
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

          <div className={styles.sectionHeader}>Crypto Coins</div>
          <p className={styles.sectionHint}>These coins are shown on the Deposit page.</p>

          <div className={styles.coinsList}>
            {settings.coins?.length === 0 && (
              <div className={styles.emptyCoins}>No coins added yet.</div>
            )}
            {settings.coins?.map((coin, index) => (
              <div key={`coin-${index}`} className={styles.coinRow}>
                <label>
                  Name
                  <input
                    type="text"
                    value={coin.name}
                    onChange={(e) => handleCoinChange(index, 'name', e.target.value)}
                    placeholder="Tether"
                  />
                </label>
                <label>
                  Symbol
                  <input
                    type="text"
                    value={coin.symbol}
                    onChange={(e) => handleCoinChange(index, 'symbol', e.target.value)}
                    placeholder="USDT"
                  />
                </label>
                <label>
                  Network
                  <input
                    type="text"
                    value={coin.network}
                    onChange={(e) => handleCoinChange(index, 'network', e.target.value)}
                    placeholder="TRC20"
                  />
                </label>
                <label>
                  Address
                  <input
                    type="text"
                    value={coin.address}
                    onChange={(e) => handleCoinChange(index, 'address', e.target.value)}
                    placeholder="Wallet address"
                  />
                </label>
                <button
                  type="button"
                  className={styles.removeCoinBtn}
                  onClick={() => removeCoin(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button type="button" className={styles.addCoinBtn} onClick={addCoin}>
            + Add Coin
          </button>

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
