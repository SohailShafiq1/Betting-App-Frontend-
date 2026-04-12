import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import styles from '../styles/Friendly.module.css';

export default function FriendlyDashboard() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await api.get('/friendly-challenges/my');
        setChallenges(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load friendly matches');
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const renderChallenge = (challenge) => {
    const opponentName = challenge.opponent ? challenge.opponent.name : 'Waiting for opponent';
    const statusLabel = challenge.status === 'OPEN' ? 'Waiting' : challenge.status === 'JOINED' ? 'Ready' : challenge.status;
    const joinSide = challenge.opponentChoice || (challenge.creatorChoice === 'A' ? 'B' : 'A');
    const joinTeam = challenge.match ? (joinSide === 'A' ? challenge.match.teamAName : challenge.match.teamBName) : '-';

    return (
      <article key={challenge._id} className={styles.challengeCard}>
        <div className={styles.challengeCardHeader}>
          <span className={styles.challengeCode}>#{challenge.code}</span>
          <span className={`${styles.statusBadge} ${styles[challenge.status.toLowerCase()]}`}>{statusLabel}</span>
        </div>

        <div className={styles.challengeRow}>
          <div>
            <h4>Match</h4>
            <p>{challenge.match?.teamAName} vs {challenge.match?.teamBName}</p>
          </div>
          <div>
            <h4>Match date</h4>
            <p>{challenge.match?.matchDate ? new Date(challenge.match.matchDate).toLocaleDateString() : 'TBD'}</p>
          </div>
        </div>

        <div className={styles.challengeRow}>
          <div>
            <h4>Your side</h4>
            <p>{challenge.creatorTeamName} ({challenge.creatorChoice === 'A' ? challenge.match?.teamAName : challenge.match?.teamBName})</p>
            <p>Stake: ${challenge.creatorAmount}</p>
          </div>
          <div>
            <h4>Opponent</h4>
            <p>{opponentName}</p>
            <p>{challenge.status === 'JOINED' ? `Stake: $${challenge.opponentAmount}` : 'No stake yet'}</p>
          </div>
        </div>

        <div className={styles.challengeCardFooter}>
          <Link to={`/friendly/${challenge.code}`} className={styles.outlineButton}>
            View Invite
          </Link>
          {challenge.status === 'OPEN' && (
            <span className={styles.inviteText}>Copy or share: {window.location.origin}/friendly/{challenge.code}</span>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.dashboardMain}>
        <section className={styles.pageHeader}>
          <div>
            <h2>Friendly Matches</h2>
            <p>View your active and pending friendly matches. Create a new challenge or continue with an existing invite.</p>
          </div>
          <Link to="/friendly" className={styles.primaryButton}>
            Create new challenge
          </Link>
        </section>

        {loading && <div className={styles.emptyState}>Loading friendly matches...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {!loading && !error && challenges.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No friendly matches yet</h3>
            <p>Start one now and invite a friend to join the opposite team.</p>
          </div>
        )}

        <div className={styles.challengeGrid}>
          {challenges.map(renderChallenge)}
        </div>
      </main>
    </div>
  );
}
