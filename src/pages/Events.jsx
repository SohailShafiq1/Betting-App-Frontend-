import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Betslip from '../components/Betslip';
import { useBetslip } from '../context/BetslipContext';
import styles from '../styles/Home.module.css';

const staticItems = [
  'Favorites',
  'Top Parlays',
  'Bonuses',
];

export default function Events() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [listView, setListView] = useState({ type: 'top', label: 'Top events', matches: [] });
  const { addToBetslip } = useBetslip();
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const backendUrl = API_URL ? API_URL.replace(/\/api$/, '') : '';

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileView) {
      setIsSidebarOpen(false);
    }
  }, [isMobileView]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/tournaments`),
        ]);
        setCategories(cRes.data.data || []);
        setTournaments(tRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        setMatches(response.data || []);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setMatchesLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const tournamentById = useMemo(() => {
    return tournaments.reduce((acc, tournament) => {
      acc[tournament._id] = tournament;
      return acc;
    }, {});
  }, [tournaments]);

  const isOpenMatch = (match) => {
    const status = match.status || 'OPEN';
    const result = match.result || 'PENDING';
    return (status === 'OPEN' || status === 'RUNNING') && result === 'PENDING';
  };

  const openMatches = matches.filter(isOpenMatch);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfDayAfter = new Date(startOfToday);
  startOfDayAfter.setDate(startOfDayAfter.getDate() + 2);

  const topEvents = openMatches
    .filter((match) => match.matchDate)
    .filter((match) => {
      const date = new Date(match.matchDate);
      return date >= startOfToday && date < startOfDayAfter;
    })
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  const getTournamentName = (match) => match.tournament?.name || 'Tournament';
  const getTournamentId = (match) => match.tournament?._id || match.tournament;
  const getCategoryId = (match) => {
    const tournamentId = getTournamentId(match);
    const tournament = tournamentById[tournamentId];
    return tournament?.category?._id || tournament?.category || null;
  };
  const getCategoryName = (match) => {
    const tournamentId = getTournamentId(match);
    const tournament = tournamentById[tournamentId];
    return tournament?.category?.heading || 'Category';
  };

  const formatMatchStatus = (match) => {
    if (!match.matchDate) return match.status || 'OPEN';
    const matchDate = new Date(match.matchDate);
    const timeLabel = match.matchTime || matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (match.status === 'RUNNING') return `LIVE, ${timeLabel}`;
    if (matchDate >= startOfToday && matchDate < startOfTomorrow) return `TODAY, ${timeLabel}`;
    if (matchDate >= startOfTomorrow && matchDate < startOfDayAfter) return `TOMORROW, ${timeLabel}`;
    return `${matchDate.toLocaleDateString()} ${timeLabel}`;
  };

  const buildListView = (type, id) => {
    if (type === 'category') {
      const category = categories.find((item) => item._id === id);
      const filtered = openMatches.filter((match) => getCategoryId(match) === id);
      return { type, label: category?.heading || 'Sport', matches: filtered };
    }
    if (type === 'tournament') {
      const tournament = tournaments.find((item) => item._id === id);
      const filtered = openMatches.filter((match) => getTournamentId(match) === id);
      return { type, label: tournament?.name || 'Tournament', matches: filtered };
    }
    return { type: 'top', label: 'Top events', matches: topEvents };
  };

  useEffect(() => {
    const state = location.state || { type: 'top' };
    setListView(buildListView(state.type, state.id));
  }, [location.state, categories, tournaments, matches]);

  const handleOddClick = (match, choice) => {
    const odds = choice === 'A' ? match.oddsA : match.oddsB;
    const teamName = choice === 'A' ? match.teamAName : match.teamBName;
    addToBetslip(match, choice, odds, teamName);
  };

  const handleTopEvents = () => {
    navigate('/event', { state: { type: 'top' } });
  };

  const handleCategoryMatches = (category) => {
    navigate('/event', { state: { type: 'category', id: category._id } });
  };

  const handleTournamentMatches = (tournament) => {
    navigate('/event', { state: { type: 'tournament', id: tournament._id } });
  };

  return (
    <div className={styles.homePage}>
      <Navbar />

      <div className={styles.layoutGrid}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <span className={styles.sidebarToggleLine}></span>
          <span className={styles.sidebarToggleLine}></span>
          <span className={styles.sidebarToggleLine}></span>
        </button>

        {isMobileView && isSidebarOpen && (
          <button
            type="button"
            className={styles.sidebarBackdrop}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <aside className={`${styles.sidebar} ${isMobileView && isSidebarOpen ? styles.sidebarMobileOpen : ''}`}>
          <div className={styles.sidebarHeader}>PARIMATCH</div>
          <div className={styles.sidebarLinks}>
            {staticItems.map((item) => (
              <button
                key={item}
                className={styles.sidebarButton}
                onClick={() => {
                  if (isMobileView) setIsSidebarOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.sportsHeader}>SPORTS</div>
          <div className={styles.categoriesList}>
            {loading ? (
              <div className={styles.loadingCategories}>Loading sports...</div>
            ) : categories.length > 0 ? (
              categories.map((category) => {
                const logoUrl = category.logo?.startsWith('http')
                  ? category.logo
                  : `${backendUrl}${category.logo}`;

                return (
                  <button
                    key={category._id}
                    className={styles.categoryButton}
                    onClick={() => {
                      handleCategoryMatches(category);
                      if (isMobileView) setIsSidebarOpen(false);
                    }}
                  >
                    <img src={logoUrl} alt={category.heading} className={styles.categoryLogo} />
                    <span className={styles.categoryName}>{category.heading}</span>
                  </button>
                );
              })
            ) : (
              <div className={styles.noCategories}>No sports available</div>
            )}
          </div>

          <div className={styles.popularLabel}>TOURNAMENTS</div>
          <div className={styles.leagueList}>
            {loading ? (
              <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                Loading tournaments...
              </div>
            ) : tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <button
                  key={tournament._id}
                  className={styles.leagueButton}
                  onClick={() => {
                    handleTournamentMatches(tournament);
                    if (isMobileView) setIsSidebarOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', width: '100%' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{tournament.name}</div>
                    {tournament.category && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                        📂 {tournament.category.heading}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                No tournaments available
              </div>
            )}
          </div>
        </aside>

        <main className={styles.mainContent}>
          <section className={styles.matchesListSection}>
            <div className={styles.matchesListHeader}>
              <div>
                <h3 className={styles.matchesListTitle}>{listView.label}</h3>
                <p className={styles.matchesListSubtitle}>
                  {listView.type === 'category'
                    ? 'All matches for this sport'
                    : listView.type === 'tournament'
                      ? 'All matches for this tournament'
                      : 'Upcoming matches'}
                </p>
              </div>
              <button className={styles.moreButton} onClick={handleTopEvents}>
                Top events
              </button>
            </div>

            {matchesLoading && (
              <div className={styles.matchesListEmpty}>Loading matches...</div>
            )}
            {!matchesLoading && listView.matches.length === 0 && (
              <div className={styles.matchesListEmpty}>No matches available</div>
            )}
            {!matchesLoading && listView.matches.length > 0 && (
              <div className={styles.matchesList}>
                {listView.matches.map((match) => (
                  <div key={match._id} className={styles.matchRowCard}>
                    <div className={styles.matchRowHeader}>
                      <span className={styles.matchRowLeague}>{getTournamentName(match)}</span>
                      <span className={styles.matchRowStatus}>{formatMatchStatus(match)}</span>
                    </div>
                    <div className={styles.matchRowBody}>
                      <div className={styles.matchRowTeamsOdds}>
                        <div className={styles.matchRowTeamCol}>
                          <div className={styles.matchRowTeamName}>{match.teamAName}</div>
                          <button
                            type="button"
                            className={styles.matchRowOddButton}
                            onClick={() => handleOddClick(match, 'A')}
                          >
                            <span>{Number(match.oddsA).toFixed(2)}</span>
                            <small>1</small>
                          </button>
                        </div>
                        <div className={styles.matchRowTeamCol}>
                          <div className={styles.matchRowTeamName}>{match.teamBName}</div>
                          <button
                            type="button"
                            className={styles.matchRowOddButton}
                            onClick={() => handleOddClick(match, 'B')}
                          >
                            <span>{Number(match.oddsB).toFixed(2)}</span>
                            <small>2</small>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.matchRowMeta}>{getCategoryName(match)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className={styles.betSlip}>
          <Betslip />
        </aside>
      </div>
    </div>
  );
}
