import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecentMatches from '../components/RecentMatches';
import Betslip from '../components/Betslip';
import { useBetslip } from '../context/BetslipContext';
import styles from '../styles/Home.module.css';

const bannerImages = ['/banner1.png', '/banner2.png'];

const staticItems = [
  'Favorites',
  'Top Parlays',
  'Bonuses',
];

export default function Home() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const { addToBetslip } = useBetslip();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const backendUrl = API_URL ? API_URL.replace(/\/api$/, '') : '';

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  const liveMatches = openMatches.filter((match) => match.status === 'RUNNING');

  const tournamentGroups = openMatches.reduce((acc, match) => {
    const name = match.tournament?.name || 'Tournament';
    if (!acc[name]) acc[name] = [];
    acc[name].push(match);
    return acc;
  }, {});

  const tournamentSections = Object.entries(tournamentGroups)
    .map(([name, groupMatches]) => [
      name,
      groupMatches.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate)),
    ])
    .slice(0, 2);

  const tournamentById = tournaments.reduce((acc, tournament) => {
    acc[tournament._id] = tournament;
    return acc;
  }, {});

  const getTournamentName = (match) => match.tournament?.name || 'Tournament';
  const getCategoryId = (match) => {
    const tournamentId = match.tournament?._id || match.tournament;
    const tournament = tournamentById[tournamentId];
    return tournament?.category?._id || tournament?.category || null;
  };
  const getCategoryName = (match) => {
    const tournamentId = match.tournament?._id || match.tournament;
    const tournament = tournamentById[tournamentId];
    return tournament?.category?.heading || 'Category';
  };

  const showTopEvents = () => {
    navigate('/event', { state: { type: 'top' } });
  };

  const showCategoryMatches = (category) => {
    navigate('/event', { state: { type: 'category', id: category._id } });
  };

  const showTournamentMatches = (tournament) => {
    navigate('/event', { state: { type: 'tournament', id: tournament._id } });
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

  const handleOddClick = (match, choice) => {
    const odds = choice === 'A' ? match.oddsA : match.oddsB;
    const teamName = choice === 'A' ? match.teamAName : match.teamBName;
    addToBetslip(match, choice, odds, teamName);
  };

  const renderEventCard = (match) => (
    <article key={match._id} className={styles.eventCard}>
      <div className={styles.eventMetaRow}>
        <span className={styles.eventMeta}>{match.tournament?.name || 'Tournament'}</span>
        <span className={styles.eventStatus}>{formatMatchStatus(match)}</span>
      </div>
      <div className={styles.eventTeamsRow}>
        <div className={styles.teamName}>{match.teamAName}</div>
        <div className={styles.teamName}>{match.teamBName}</div>
      </div>
      <div className={styles.eventOddsRow}>
        <button
          type="button"
          className={styles.eventOdds}
          onClick={() => handleOddClick(match, 'A')}
        >
          <div className={styles.oddsValue}>{Number(match.oddsA).toFixed(2)}</div>
          <div className={styles.oddsTag}>1</div>
        </button>
        <button
          type="button"
          className={styles.eventOdds}
          onClick={() => handleOddClick(match, 'B')}
        >
          <div className={styles.oddsValue}>{Number(match.oddsB).toFixed(2)}</div>
          <div className={styles.oddsTag}>2</div>
        </button>
      </div>
    </article>
  );

  return (
    <div className={styles.homePage}>
      <div className={styles.topBar}>
        <span>Win your share of <strong>200,000 USDT & 24K Coins</strong></span>
        <button className={styles.closeButton}>×</button>
      </div>

      <Navbar />

      <div className={styles.layoutGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>PARIMATCH</div>
          <div className={styles.sidebarLinks}>
            {staticItems.map((item) => (
              <button key={item} className={styles.sidebarButton}>{item}</button>
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
                    onClick={() => showCategoryMatches(category)}
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
                  onClick={() => showTournamentMatches(tournament)}
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
          <section className={styles.bannerSection}>
            <div className={styles.bannerToolbar}>
              <span>Live Events</span>
              <span>Upcoming events</span>
            </div>

            <div className={styles.bannerFrame}>
              <img
                key={bannerIndex}
                src={bannerImages[bannerIndex]}
                alt="Banner"
                className={styles.bannerImage}
              />
              <div className={styles.bannerOverlay}>
                <div className={styles.matchScore}>106 : 162</div>
                <div className={styles.matchTitle}>Delhi Capitals × Mumbai Indians</div>
                <div className={styles.matchSubtitle}>India Premier League</div>
              </div>
            </div>

            <div className={styles.bannerOdds}>
              <div className={styles.oddsTile}>
                <div className={styles.oddsValue}>1.02</div>
                <div className={styles.oddsLabel}>OVER</div>
              </div>
              <div className={styles.oddsTile}>
                <div className={styles.oddsValue}>4.5</div>
                <div className={styles.oddsLabel}>TOTAL</div>
              </div>
              <div className={styles.oddsTile}>
                <div className={styles.oddsValue}>2.75</div>
                <div className={styles.oddsLabel}>UNDER</div>
              </div>
            </div>
          </section>

          <RecentMatches />

          <section className={styles.categorySection}>
            <div className={styles.categoryCard}>SPORTS</div>
            <div className={styles.categoryCard}>ESPORTS</div>
          </section>

          <section className={styles.eventsSection}>
            <div className={styles.eventsHeader}>
              <span>Top events</span>
              <button className={styles.moreButton} onClick={showTopEvents}>More events →</button>
            </div>

            <div className={styles.eventStrip}>
              {matchesLoading && (
                <div style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.6)' }}>
                  Loading events...
                </div>
              )}
              {!matchesLoading && topEvents.length === 0 && (
                <div style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.6)' }}>
                  No upcoming events
                </div>
              )}
              {!matchesLoading && topEvents.length > 0 && topEvents.map(renderEventCard)}
            </div>

            {tournamentSections.map(([name, groupMatches]) => (
              <div key={name} className={styles.eventsSubSection}>
                <div className={styles.eventsSubHeader}>
                  <span>{name}</span>
                  <button
                    className={styles.moreButton}
                    onClick={() => {
                      const tournament = tournaments.find((item) => item.name === name);
                      if (tournament) {
                        showTournamentMatches(tournament);
                      }
                    }}
                  >
                    More events →
                  </button>
                </div>
                <div className={styles.eventStrip}>
                  {groupMatches.length === 0 ? (
                    <div style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.6)' }}>
                      No events available
                    </div>
                  ) : (
                    groupMatches.map(renderEventCard)
                  )}
                </div>
              </div>
            ))}

            <div className={styles.eventsSubSection}>
              <div className={styles.eventsSubHeader}>
                <span>Best Live Matches</span>
                <span className={styles.liveBadge}>Live</span>
              </div>
              <div className={styles.eventStrip}>
                {matchesLoading && (
                  <div style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.6)' }}>
                    Loading live matches...
                  </div>
                )}
                {!matchesLoading && liveMatches.length === 0 && (
                  <div style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.6)' }}>
                    No live matches
                  </div>
                )}
                {!matchesLoading && liveMatches.length > 0 && liveMatches.map(renderEventCard)}
              </div>
            </div>
          </section>

          <section className={styles.bonusSection}>
            <div className={styles.bonusHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Choose your bonus now</h2>
                <p className={styles.sectionSubtitle}>All bonus packs in one place for sports, casino and mixed offers.</p>
              </div>
              <button className={styles.seeAllButton}>All →</button>
            </div>

            <div className={styles.bonusNav}>
              {['All', 'Casino', 'Sports', 'Mix'].map((item) => (
                <button key={item} className={styles.bonusNavButton}>{item}</button>
              ))}
            </div>

            <div className={styles.bonusCards}>
              {[
                {
                  tag: 'Sports',
                  expires: '1d',
                  title: 'PREDICTION FOR THE WEST HAM - LEEDS',
                  footer: [
                    { label: '20,000 USDT', description: 'Prize fund' },
                  ],
                },
                {
                  tag: '',
                  expires: '4d',
                  title: 'MONEY BONUS 5% FOR DEPOSIT',
                  footer: [
                    { label: '300 USDT', description: 'Max. bonus' },
                    { label: '10 USDT', description: 'Minimum deposit' },
                  ],
                },
                {
                  tag: 'Sports',
                  expires: '4d',
                  title: '15% FREE BET OF THE DEPOSIT AMOUNT',
                  footer: [
                    { label: '200 USDT', description: 'Free Bet amount up to' },
                    { label: '10 USDT', description: 'Minimum deposit' },
                  ],
                },
                {
                  tag: '',
                  expires: '4d',
                  title: '25% BET IN PACK FOR DEPOSIT',
                  footer: [
                    { label: '1 bonus', description: 'in pack' },
                  ],
                },
              ].map((card, index) => (
                <article key={`${card.title}-${index}`} className={styles.bonusCard}>
                  <div className={styles.bonusMetaRow}>
                    <div className={styles.bonusTag}>{card.tag || 'Bonus'}</div>
                    <div className={styles.bonusExpires}>{card.expires}</div>
                  </div>
                  <h3 className={styles.bonusTitle}>{card.title}</h3>
                  <div className={styles.bonusFooter}>
                    {card.footer.map((item) => (
                      <div key={item.label} className={styles.bonusStat}>
                        <span className={styles.bonusValue}>{item.label}</span>
                        <span className={styles.bonusDescription}>{item.description}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className={styles.betSlip}>
          <Betslip />
        </aside>
      </div>
    </div>
  );
}
