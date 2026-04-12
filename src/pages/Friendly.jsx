import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import styles from '../styles/Friendly.module.css';

export default function Friendly() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [matchId, setMatchId] = useState('');
  const [choice, setChoice] = useState('A');
  const [amount, setAmount] = useState('');
  const [joinAmount, setJoinAmount] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) {
      const loadMatches = async () => {
        try {
          const response = await api.get('/matches');
          setMatches(response.data || []);
          if (response.data?.length > 0) {
            setMatchId(response.data[0]._id);
          }
        } catch (err) {
          console.error(err);
        }
      };

      loadMatches();
    } else {
      const loadChallenge = async () => {
        try {
          const response = await api.get(`/friendly-challenges/${code}`);
          setChallenge(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Unable to load friendly challenge');
        }
      };

      loadChallenge();
    }
  }, [code]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!teamName.trim() || !matchId || !choice || !amount) {
      setError('Please fill in all fields to create a friendly match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/friendly-challenges', {
        matchId,
        teamName,
        choice,
        amount: Number(amount),
      });
      setChallenge(response.data.challenge);
      setInviteUrl(response.data.inviteUrl);
      setMessage('Friendly match created successfully. Share the invite link with a friend!');
      setAmount('');
      if (response.data.wallet !== undefined) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, wallet: response.data.wallet }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create friendly challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!joinAmount) {
      setError('Please enter a stake amount to join the match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/friendly-challenges/${code}/join`, {
        amount: Number(joinAmount),
      });
      setChallenge(response.data.challenge);
      setMessage(response.data.message || 'You joined the friendly match');
      setJoinAmount('');
      if (response.data.wallet !== undefined) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, wallet: response.data.wallet }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to join friendly challenge');
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl && challenge?.code) {
      setInviteUrl(`${window.location.origin}/friendly/${challenge.code}`);
    }

    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage('Invite link copied to clipboard');
    } catch (err) {
      setError('Unable to copy invite link');
    }
  };

  const renderCreateSection = () => (
    <div className={styles.card}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Play With Freind</h2>
          <p>Create a friendly match, name your team, and invite a friend to bet on the opposite side.</p>
        </div>
        <Link to="/friendly/dashboard" className={styles.outlineButton}>
          My friendly matches
        </Link>
      </div>

      <form onSubmit={handleCreate} className={styles.form}>
        <label>
          Your Team Name
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter a fun team name"
            required
          />
        </label>

        <label>
          Select Match
          <select value={matchId} onChange={(e) => setMatchId(e.target.value)} required>
            {matches.map((match) => (
              <option key={match._id} value={match._id}>
                {match.teamAName} vs {match.teamBName}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          Pick Your Team Side
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input type="radio" name="choice" value="A" checked={choice === 'A'} onChange={() => setChoice('A')} />
              Team A
            </label>
            <label className={styles.radioOption}>
              <input type="radio" name="choice" value="B" checked={choice === 'B'} onChange={() => setChoice('B')} />
              Team B
            </label>
          </div>
        </label>

        <label>
          Stake Amount ($)
          <input
            type="number"
            min="5"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter stake amount"
            required
          />
        </label>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} className={styles.primaryButton}>
          {loading ? 'Creating match...' : 'Create Friendly Match'}
        </button>
      </form>

      {challenge?.code && (
        <div className={styles.infoBox}>
          <h3>Invite Link</h3>
          <p>Share this link with a friend so they can join on the opposite team.</p>
          <div className={styles.inlineRow}>
            <input
              type="text"
              readOnly
              value={inviteUrl || `${window.location.origin}/friendly/${challenge.code}`}
              className={styles.linkInput}
            />
            <button type="button" onClick={copyInvite} className={styles.secondaryButton}>
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInviteSection = () => {
    if (!challenge) {
      return <div className={styles.emptyState}>{error || 'Loading friendly challenge...'}</div>;
    }

    const match = challenge.match;
    const friendSide = challenge.opponentChoice || (challenge.creatorChoice === 'A' ? 'B' : 'A');
    const friendTeam = friendSide === 'A' ? match.teamAName : match.teamBName;
    const creatorTeam = challenge.creatorChoice === 'A' ? match.teamAName : match.teamBName;

    return (
      <div className={styles.card}>
        <div className={styles.pageHeader}>
          <div>
            <h2>Friendly Match Invite</h2>
            <p>
              {challenge.isCreator
                ? 'Share the invite link below so your friend can join the opposite team.'
                : `You were invited to join a friendly match. You can only bet on the opposite team.`}
            </p>
          </div>
          <Link to="/friendly/dashboard" className={styles.outlineButton}>
            View my matches
          </Link>
        </div>

        <div className={styles.challengeRow}>
          <div className={styles.challengeBox}>
            <h4>Creator</h4>
            <p><strong>{challenge.creator.name}</strong></p>
            <p>Team: {challenge.creatorTeamName}</p>
            <p>Match Team: {creatorTeam}</p>
            <p>Stake: ${challenge.creatorAmount}</p>
          </div>
          <div className={styles.challengeBox}>
            <h4>Your Team</h4>
            <p><strong>{friendTeam}</strong></p>
            <p>Side: {friendSide === 'A' ? 'Team A' : 'Team B'}</p>
            <p>{challenge.status === 'JOINED' ? `Stake: $${challenge.opponentAmount}` : 'Waiting for your stake'}</p>
          </div>
        </div>

        {challenge.isCreator && challenge.status === 'OPEN' && (
          <div className={styles.infoBox}>
            <p>You are the creator. Share this invite link with your friend:</p>
            <div className={styles.inlineRow}>
              <input
                type="text"
                readOnly
                value={inviteUrl || `${window.location.origin}/friendly/${challenge.code}`}
                className={styles.linkInput}
              />
              <button type="button" onClick={copyInvite} className={styles.secondaryButton}>Copy Link</button>
            </div>
          </div>
        )}

        {challenge.status === 'OPEN' && !challenge.isCreator && (
          <form onSubmit={handleJoin} className={styles.form}>
            <label>
              Join Stake Amount ($)
              <input
                type="number"
                min="5"
                step="1"
                value={joinAmount}
                onChange={(e) => setJoinAmount(e.target.value)}
                required
              />
            </label>

            {message && <div className={styles.success}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Joining...' : `Join ${friendTeam}`}
            </button>
          </form>
        )}

        {challenge.status === 'JOINED' && (
          <div className={styles.statusBox}>
            <p>This friendly challenge is joined. Both players have placed their stakes.</p>
          </div>
        )}

        {challenge.status !== 'OPEN' && challenge.status !== 'JOINED' && (
          <div className={styles.statusBox}>
            <p>Challenge status: {challenge.status}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main style={{ paddingTop: '30px', paddingBottom: '40px' }}>
        {code ? renderInviteSection() : renderCreateSection()}
      </main>
    </div>
  );
}
