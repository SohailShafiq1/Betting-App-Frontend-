import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Admin.module.css';

export default function AdminOpenBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadOpenBets = async () => {
      try {
        setLoading(true);
        const query = filter === 'win-loss' ? '?filter=win-loss' : '?filter=open';
        const response = await axios.get(`${API_URL}/admin/open-bets${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBets(response.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOpenBets();
  }, [API_URL, token, filter]);

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>{filter === 'win-loss' ? 'Win / Loss Bets' : 'Open Bets'}</h2>
            <p>
              {filter === 'win-loss'
                ? 'Settled bets showing whether each bet was a win or loss.'
                : 'All currently open bets placed by users, with match details and stake amounts.'}
            </p>
          </div>
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === 'open' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilter('open')}
            >
              Open
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === 'win-loss' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilter('win-loss')}
            >
              Win/Loss
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingSpinner}>Loading open bets...</div>
        ) : bets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No open bets found.</p>
          </div>
        ) : (
          <div className={styles.betsGrid}>
            {bets.map((bet) => (
              <div key={bet._id} className={styles.betCard}>
                <div className={styles.betHeader}>
                  <div>
                    <h3>{bet.user?.name || 'Unknown User'}</h3>
                    <p className={styles.betMeta}>{bet.user?.email || 'No email'}</p>
                  </div>
                  <span className={styles.betStatus}>
                    {bet.result ? `${bet.status} • ${bet.result}` : bet.status}
                  </span>
                </div>

                <div className={styles.betDetails}>
                  <div>
                    <span>Match</span>
                    <strong>{bet.match ? `${bet.match.teamAName} vs ${bet.match.teamBName}` : 'Unknown match'}</strong>
                  </div>
                  <div>
                    <span>Choice</span>
                    <strong>{bet.choice === 'A' ? bet.match?.teamAName || 'Team A' : bet.match?.teamBName || 'Team B'}</strong>
                  </div>
                  <div>
                    <span>Amount</span>
                    <strong>${Number(bet.amount || 0).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Odds</span>
                    <strong>{bet.odds?.toFixed(2) ?? '--'}</strong>
                  </div>
                  {bet.result && (
                    <div>
                      <span>Result</span>
                      <strong>{bet.result}</strong>
                    </div>
                  )}
                </div>

                <div className={styles.betFooter}>
                  <span>Placed on</span>
                  <strong>{new Date(bet.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
