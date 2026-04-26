import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Admin.module.css';

export default function AdminFriendlyBets() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadFriendlyBets = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/friendly-bets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChallenges(response.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load friendly bets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFriendlyBets();
  }, [API_URL, token]);

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>Friendly Bets</h2>
            <p>Review all friendly challenges and the bets placed on each match.</p>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingSpinner}>Loading friendly bets...</div>
        ) : challenges.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No friendly bets found.</p>
          </div>
        ) : (
          <div className={styles.friendlyGrid}>
            {challenges.map((challenge) => (
              <div key={challenge._id} className={styles.friendlyCard}>
                <div className={styles.friendlyHeader}>
                  <div>
                    <h3>Code: {challenge.code.toUpperCase()}</h3>
                    <p className={styles.betMeta}>{challenge.match ? `${challenge.match.teamAName} vs ${challenge.match.teamBName}` : 'Match unavailable'}</p>
                  </div>
                  <span className={styles.friendlyStatus}>{challenge.status}</span>
                </div>

                <div className={styles.friendlyBody}>
                  <div>
                    <span>Creator</span>
                    <strong>{challenge.creator?.name || 'Unknown'}</strong>
                    <p>{challenge.creatorTeamName} | ${Number(challenge.creatorAmount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span>Opponent</span>
                    <strong>{challenge.opponent?.name || 'Waiting'}</strong>
                    <p>
                      {challenge.opponent ? `${challenge.opponentAmount ? `$${Number(challenge.opponentAmount).toFixed(2)}` : '—'}` : 'Not joined'}
                    </p>
                  </div>
                  <div>
                    <span>Match Status</span>
                    <strong>{challenge.match?.status || 'Unknown'}</strong>
                  </div>
                </div>

                <div className={styles.betFooter}>
                  <span>Created</span>
                  <strong>{new Date(challenge.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
