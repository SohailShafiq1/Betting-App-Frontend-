import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import styles from '../styles/BetPage.module.css';

export default function BetPage() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [choice, setChoice] = useState('A');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await api.get('/matches');
        setMatches(response.data);
        if (response.data.length > 0) setSelectedMatch(response.data[0]._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load matches');
      }
    };
    loadMatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/bets', { amount: Number(amount), matchId: selectedMatch, choice });
      setMessage(`Bet placed ${response.data.result}. New wallet $${response.data.wallet.toFixed(2)}`);
      setAmount('');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, wallet: response.data.wallet }));
    } catch (err) {
      setError(err.response?.data?.message || 'Bet failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedMatchObject = matches.find((match) => match._id === selectedMatch);
  const selectedName = selectedMatchObject
    ? choice === 'A'
      ? selectedMatchObject.teamAName
      : selectedMatchObject.teamBName
    : 'Choose a team';

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.betGrid}>
        <section className={styles.betCard}>
          <h2>New Bet</h2>
          <p>Choose a match, pick Team A or Team B, then place your wager.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              Select Match
              <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}>
                {matches.map((match) => (
                  <option key={match._id} value={match._id}>
                    {match.teamAName} vs {match.teamBName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Select Team
              <div className={styles.choiceRow}>
                <label className={styles.choiceOption}>
                  <input
                    type="radio"
                    name="choice"
                    value="A"
                    checked={choice === 'A'}
                    onChange={() => setChoice('A')}
                  />
                  {selectedMatchObject?.teamAName || 'Team A'} ({selectedMatchObject?.oddsA?.toFixed(2) || '--'})
                </label>
                <label className={styles.choiceOption}>
                  <input
                    type="radio"
                    name="choice"
                    value="B"
                    checked={choice === 'B'}
                    onChange={() => setChoice('B')}
                  />
                  {selectedMatchObject?.teamBName || 'Team B'} ({selectedMatchObject?.oddsB?.toFixed(2) || '--'})
                </label>
              </div>
            </label>

            <label>
              Amount
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                required
              />
            </label>

            {message && <div className={styles.success}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading || !selectedMatch}>
              {loading ? 'Placing Bet...' : 'Place Bet'}
            </button>
          </form>
        </section>

        <section className={styles.previewCard}>
          <h3>Bet Summary</h3>
          <div className={styles.detailRow}>
            <span>Match</span>
            <strong>{selectedMatchObject ? `${selectedMatchObject.teamAName} vs ${selectedMatchObject.teamBName}` : 'No match selected'}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Team</span>
            <strong>{selectedName}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Odds</span>
            <strong>{selectedMatchObject ? (choice === 'A' ? selectedMatchObject.oddsA.toFixed(2) : selectedMatchObject.oddsB.toFixed(2)) : '--'}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Amount</span>
            <strong>${amount || '0'}</strong>
          </div>
          <button className={styles.linkButton} onClick={() => navigate('/')}>
            View Home
          </button>
        </section>
      </div>
    </div>
  );
}
