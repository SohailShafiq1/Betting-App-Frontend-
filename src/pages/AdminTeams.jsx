import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import styles from '../styles/Admin.module.css';

export default function AdminTeams() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [oddsA, setOddsA] = useState(1.8);
  const [oddsB, setOddsB] = useState(1.8);
  const [teamALogo, setTeamALogo] = useState(null);
  const [teamBLogo, setTeamBLogo] = useState(null);
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchesRes, tournamentsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/tournaments'),
        ]);
        setMatches(matchesRes.data);
        setTournaments(tournamentsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load data');
      }
    };
    loadData();
  }, []);

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!selectedTournament || !teamAName || !teamBName || !oddsA || !oddsB || !matchDate || !matchTime) {
      setError('Tournament, team names, odds, date and time are all required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('tournament', selectedTournament);
      formData.append('teamAName', teamAName);
      formData.append('teamBName', teamBName);
      formData.append('oddsA', oddsA);
      formData.append('oddsB', oddsB);
      formData.append('matchDate', matchDate);
      formData.append('matchTime', matchTime);
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
      setMatchDate('');
      setMatchTime('');
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

  const handleStatusChange = async (matchId, status) => {
    try {
      const response = await api.patch(`/matches/${matchId}/status`, { status });
      setMatches((prev) => prev.map((m) => (m._id === matchId ? response.data : m)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResultChange = async (matchId, result) => {
    if (result === 'PENDING') {
      return;
    }
    try {
      const response = await api.patch(`/matches/${matchId}/result`, { result });
      setMatches((prev) => prev.map((m) => (m._id === matchId ? response.data.match : m)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set result');
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
            <p>Create a match under a tournament with Team A, Team B, and their individual odds.</p>
          </div>
        </div>

        <form className={styles.teamForm} onSubmit={handleAddMatch}>
          <label>
            Tournament *
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              required
            >
              <option value="">Select a tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name} ({tournament.matchCount || 0} matches)
                </option>
              ))}
            </select>
            {tournaments.length === 0 && (
              <small style={{ color: '#FF4D6D', marginTop: '8px', display: 'block' }}>
                No tournaments available. Create one first.
              </small>
            )}
          </label>

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

          <label>
            Match Date *
            <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} required />
          </label>

          <label>
            Match Time *
            <input type="time" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} required />
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
                  <div>
                    <h3>{match.teamAName} vs {match.teamBName}</h3>
                    {match.tournament && (
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' }}>
                        🎮 {match.tournament.name}
                      </p>
                    )}
                    {match.matchDate && (
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
                        📅 {new Date(match.matchDate).toLocaleDateString()} at {match.matchTime}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(match._id)}>Delete</button>
                </div>
                <div className={styles.matchControlsRow}>
                  <label className={styles.matchControlLabel}>
                    Status
                    <select
                      value={match.status || 'OPEN'}
                      onChange={(e) => handleStatusChange(match._id, e.target.value)}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="RUNNING">RUNNING</option>
                      <option value="FINISHED">FINISHED</option>
                    </select>
                  </label>
                  <label className={styles.matchControlLabel}>
                    Result
                    <select
                      value={match.result || 'PENDING'}
                      onChange={(e) => handleResultChange(match._id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="A">{match.teamAName} WIN</option>
                      <option value="B">{match.teamBName} WIN</option>
                    </select>
                  </label>
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
