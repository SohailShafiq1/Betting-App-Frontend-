import { useEffect, useState } from 'react';
import { useBetslip } from '../context/BetslipContext';
import api from '../api/axios';
import styles from '../styles/RecentMatches.module.css';

export default function RecentMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToBetslip } = useBetslip();

  const API_URL = import.meta.env.VITE_API_URL;
  const backendUrl = API_URL ? API_URL.replace(/\/api$/, '') : '';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        // Get only the 2 most recent matches
        const recentMatches = response.data.slice(0, 2);
        setMatches(recentMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    // Refresh matches every 30 seconds
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOddClick = (match, choice) => {
    const odds = choice === 'A' ? match.oddsA : match.oddsB;
    const teamName = choice === 'A' ? match.teamAName : match.teamBName;
    addToBetslip(match, choice, odds, teamName);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading recent matches...</div>;
  }

  if (matches.length === 0) {
    return <div className={styles.noMatches}>No matches available</div>;
  }

  return (
    <div className={styles.recentMatchesContainer}>
      <h3 className={styles.title}>Top Events</h3>
      <div className={styles.matchesGrid}>
        {matches.map((match) => {
          const teamALogoUrl = match.teamALogo?.startsWith('http')
            ? match.teamALogo
            : `${backendUrl}${match.teamALogo}`;

          const teamBLogoUrl = match.teamBLogo?.startsWith('http')
            ? match.teamBLogo
            : `${backendUrl}${match.teamBLogo}`;

          return (
            <div key={match._id} className={styles.matchCard}>
              <div className={styles.tournamentName}>
                {match.tournament?.name || 'Tournament'}
              </div>

              <div className={styles.matchContent}>
                <div className={styles.teamSection}>
                  <div className={styles.team}>
                    {match.teamALogo && (
                      <img
                        src={teamALogoUrl}
                        alt={match.teamAName}
                        className={styles.teamLogo}
                      />
                    )}
                    <span className={styles.teamName}>{match.teamAName}</span>
                  </div>

                  <div className={styles.divider}>vs</div>

                  <div className={styles.team}>
                    <span className={styles.teamName}>{match.teamBName}</span>
                    {match.teamBLogo && (
                      <img
                        src={teamBLogoUrl}
                        alt={match.teamBName}
                        className={styles.teamLogo}
                      />
                    )}
                  </div>
                </div>

                <div className={styles.oddsContainer}>
                  <button
                    className={styles.oddButton}
                    onClick={() => handleOddClick(match, 'A')}
                  >
                    <div className={styles.oddsValue}>{match.oddsA.toFixed(2)}</div>
                    <div className={styles.oddsLabel}>{match.teamAName}</div>
                  </button>

                  <button
                    className={styles.oddButton}
                    onClick={() => handleOddClick(match, 'B')}
                  >
                    <div className={styles.oddsValue}>{match.oddsB.toFixed(2)}</div>
                    <div className={styles.oddsLabel}>{match.teamBName}</div>
                  </button>
                </div>
              </div>

              {match.matchDate && (
                <div className={styles.matchTime}>
                  {new Date(match.matchDate).toLocaleDateString()} {match.matchTime}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
