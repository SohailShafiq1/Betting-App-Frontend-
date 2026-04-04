import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import styles from '../styles/UserDashboard.module.css';

export default function UserDashboard() {
  const [wallet, setWallet] = useState(0);
  const [bets, setBets] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setWallet(user.wallet || 0);

    const fetchData = async () => {
      try {
        const [betsResponse, matchesResponse] = await Promise.all([
          api.get('/bets'),
          api.get('/matches'),
        ]);
        setBets(betsResponse.data);
        setMatches(matchesResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data');
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      <section className={styles.heroSection}>
        <div className={styles.walletCard}>
          <span>Wallet Balance</span>
          <strong>${wallet.toFixed(2)}</strong>
          <p>Available funds for betting and payouts.</p>
        </div>
        <div className={styles.actionCards}>
          <div className={styles.smallCard}>
            <span>Open Bets</span>
            <strong>{bets.filter((bet) => bet.result === 'LOSE' || bet.result === 'WIN').length}</strong>
          </div>
          <div className={styles.smallCard}>
            <span>Active Matches</span>
            <strong>{matches.length}</strong>
          </div>
        </div>
      </section>

      <section className={styles.betSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Bets</h2>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.betTable}>
          <div className={styles.tableHeader}>
            <span>Date</span>
            <span>Match</span>
            <span>Team</span>
            <span>Amount</span>
            <span>Odds</span>
            <span>Result</span>
          </div>
          {bets.slice(0, 5).map((bet) => (
            <div key={bet._id} className={styles.tableRow}>
              <span>{new Date(bet.createdAt).toLocaleDateString()}</span>
              <span>{bet.match ? `${bet.match.teamAName} vs ${bet.match.teamBName}` : 'Match removed'}</span>
              <span>{bet.choice === 'A' ? bet.match?.teamAName || 'Team A' : bet.match?.teamBName || 'Team B'}</span>
              <span>${bet.amount.toFixed(2)}</span>
              <span>{bet.odds.toFixed(2)}</span>
              <span className={bet.result === 'WIN' ? styles.win : styles.lose}>{bet.result}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
