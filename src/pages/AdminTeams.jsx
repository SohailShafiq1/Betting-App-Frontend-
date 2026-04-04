import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import styles from '../styles/Admin.module.css';

export default function AdminTeams() {
  const [matches, setMatches] = useState([]);
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [oddsA, setOddsA] = useState(1.8);
  const [oddsB, setOddsB] = useState(1.8);
  const [teamALogo, setTeamALogo] = useState(null);
  const [teamBLogo, setTeamBLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await api.get('/matches');
        setMatches(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load matches');
      }
    };
    loadMatches();
  }, []);

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!teamAName || !teamBName || !oddsA || !oddsB) {
      setError('Both team names and odds are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('teamAName', teamAName);
      formData.append('teamBName', teamBName);
      formData.append('oddsA', oddsA);
      formData.append('oddsB', oddsB);
      if (teamALogo) formData.append('teamALogo', teamALogo);
      if (teamBLogo) formData.append('teamBLogo', teamBLogo);

      const response = await api.post('/matches', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMatches((prev) => [response.data, ...prev]);
      setTeamAName('');
      setTeamBName('');
      setOddsA(1.8);
      setOddsB(1.8);
      setTeamALogo(null);
      setTeamBLogo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/matches/${id}`);
      setMatches((prev) => prev.filter((match) => match._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : '';

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>Matches</h2>
            <p>Create a match with Team A, Team B, and their individual odds.</p>
          </div>
        </div>

        <form className={styles.teamForm} onSubmit={handleAddMatch}>
          <label>
            Team A Name
            <input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} placeholder="Team A name" required />
          </label>
          <label>
            Team A Logo
            <input type="file" accept="image/*" onChange={(e) => setTeamALogo(e.target.files?.[0] ?? null)} />
          </label>
          <label>
            Team A Odds
            <input type="number" step="0.01" min="1" value={oddsA} onChange={(e) => setOddsA(e.target.value)} required />
          </label>

          <label>
            Team B Name
            <input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} placeholder="Team B name" required />
          </label>
          <label>
            Team B Logo
            <input type="file" accept="image/*" onChange={(e) => setTeamBLogo(e.target.files?.[0] ?? null)} />
          </label>
          <label>
            Team B Odds
            <input type="number" step="0.01" min="1" value={oddsB} onChange={(e) => setOddsB(e.target.value)} required />
          </label>

          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Add Match'}
          </button>
        </form>

        <div className={styles.teamGrid}>
          {matches.map((match) => {
            const logoA = match.teamALogo?.startsWith('http') ? match.teamALogo : `${backendUrl}${match.teamALogo}`;
            const logoB = match.teamBLogo?.startsWith('http') ? match.teamBLogo : `${backendUrl}${match.teamBLogo}`;
            return (
              <div key={match._id} className={styles.teamCard}>
                <div className={styles.teamCardHeader}>
                  <h3>{match.teamAName} vs {match.teamBName}</h3>
                  <button onClick={() => handleDelete(match._id)}>Delete</button>
                </div>
                <div className={styles.matchOddsRow}>
                  <div className={styles.matchTeamBlock}>
                    {logoA && <img src={logoA} alt={match.teamAName} className={styles.teamLogo} />}
                    <span>{match.teamAName}</span>
                    <strong>Odds: {match.oddsA.toFixed(2)}</strong>
                  </div>
                  <div className={styles.matchTeamBlock}>
                    {logoB && <img src={logoB} alt={match.teamBName} className={styles.teamLogo} />}
                    <span>{match.teamBName}</span>
                    <strong>Odds: {match.oddsB.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
