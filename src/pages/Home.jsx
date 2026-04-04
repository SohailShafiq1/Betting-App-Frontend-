import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
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
  const [loading, setLoading] = useState(true);

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
                  <button key={category._id} className={styles.categoryButton}>
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
                <button key={tournament._id} className={styles.leagueButton}>
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

          <section className={styles.categorySection}>
            <div className={styles.categoryCard}>SPORTS</div>
            <div className={styles.categoryCard}>ESPORTS</div>
          </section>

          <section className={styles.eventsSection}>
            <div className={styles.eventsHeader}>
              <span>Top events</span>
              <button className={styles.moreButton}>More events →</button>
            </div>

            <div className={styles.eventStrip}>
              {[
                {
                  league: 'England. FA Cup',
                  status: 'H2 80:48',
                  home: 'Man City',
                  homeScore: '2',
                  away: 'Liverpool',
                  awayScore: '4',
                  odds: ['2.20', '4.5', '1.65'],
                  tags: ['OVER', 'TOTAL', 'UNDER'],
                },
                {
                  league: 'World. Featured Bouts',
                  status: 'Tomorrow, 02:00',
                  home: 'Deontay Wilder',
                  away: 'Derek Chisora',
                  odds: ['2.64', '18.66', '1.55'],
                  tags: ['1', 'X', '2'],
                },
                {
                  league: 'India. Premier League',
                  status: 'INNINGS 1',
                  home: 'Delhi Capitals',
                  homeScore: '152/4(16.3)',
                  away: 'Mumbai Indians',
                  awayScore: '162/6',
                  odds: ['22 available outcomes'],
                  tags: [''],
                },
                {
                  league: 'India. Premier League',
                  status: 'TODAY, 19:00',
                  home: 'Gujarat Titans',
                  away: 'Rajasthan Royals',
                  odds: ['1.90', '1.90'],
                  tags: ['1', '2'],
                },
              ].map((event) => (
                <article key={`${event.league}-${event.status}`} className={styles.eventCard}>
                  <div className={styles.eventMetaRow}>
                    <span className={styles.eventMeta}>{event.league}</span>
                    <span className={styles.eventStatus}>{event.status}</span>
                  </div>
                  <div className={styles.eventTeamsRow}>
                    <div className={styles.teamName}>{event.home}</div>
                    {event.homeScore && <div className={styles.eventScore}>{event.homeScore}</div>}
                    <div className={styles.teamName}>{event.away}</div>
                    {event.awayScore && <div className={styles.eventScore}>{event.awayScore}</div>}
                  </div>
                  <div className={styles.eventOddsRow}>
                    {event.odds.map((odd, index) => (
                      <div key={index} className={styles.eventOdds}>
                        <div className={styles.oddsValue}>{odd}</div>
                        {event.tags?.[index] && <div className={styles.oddsTag}>{event.tags[index]}</div>}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.eventsSubSection}>
              <div className={styles.eventsSubHeader}>
                <span>IPL</span>
                <button className={styles.moreButton}>More events →</button>
              </div>
              <div className={styles.eventStrip}>
                {[
                  {
                    league: 'India. Premier League',
                    status: 'INNINGS 1',
                    home: 'Delhi Capitals',
                    homeScore: '152/4(16.3)',
                    away: 'Mumbai Indians',
                    awayScore: '162/6',
                    odds: ['22 available outcomes'],
                  },
                  {
                    league: 'India. Premier League',
                    status: 'TODAY, 19:00',
                    home: 'Gujarat Titans',
                    away: 'Rajasthan Royals',
                    odds: ['1.90', '1.90'],
                    tags: ['1', '2'],
                  },
                  {
                    league: 'India. Premier League',
                    status: 'TOMORROW, 15:00',
                    home: 'Sunrisers Hyderabad',
                    away: 'Lucknow Super Giants',
                    odds: ['1.70', '2.15'],
                    tags: ['1', '2'],
                  },
                  {
                    league: 'India. Premier League',
                    status: 'TOMORROW, 19:00',
                    home: 'Royal Challengers Bengaluru',
                    away: 'Chennai Super Kings',
                    odds: ['1.62', '2.30'],
                    tags: ['1', '2'],
                  },
                ].map((event) => (
                  <article key={`${event.league}-${event.status}`} className={styles.eventCard}>
                    <div className={styles.eventMetaRow}>
                      <span className={styles.eventMeta}>{event.league}</span>
                      <span className={styles.eventStatus}>{event.status}</span>
                    </div>
                    <div className={styles.eventTeamsRow}>
                      <div className={styles.teamName}>{event.home}</div>
                      {event.homeScore && <div className={styles.eventScore}>{event.homeScore}</div>}
                      <div className={styles.teamName}>{event.away}</div>
                      {event.awayScore && <div className={styles.eventScore}>{event.awayScore}</div>}
                    </div>
                    <div className={styles.eventOddsRow}>
                      {event.odds.map((odd, index) => (
                        <div key={index} className={styles.eventOdds}>
                          <div className={styles.oddsValue}>{odd}</div>
                          {event.tags?.[index] && <div className={styles.oddsTag}>{event.tags[index]}</div>}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.eventsSubSection}>
              <div className={styles.eventsSubHeader}>
                <span>Best Live Matches</span>
                <span className={styles.liveBadge}>Live</span>
              </div>
              <div className={styles.eventStrip}>
                {[
                  {
                    league: 'Football. England. FA Cup',
                    status: 'H2 80:48',
                    home: 'Man City',
                    homeScore: '2',
                    away: 'Liverpool',
                    awayScore: '0',
                    odds: ['2.20', '4.5', '1.65'],
                    tags: ['1', 'X', '2'],
                  },
                  {
                    league: 'Football. Spain. LaLiga',
                    status: 'H2 61:49',
                    home: 'Real Sociedad',
                    away: 'Levante',
                    odds: ['1.12', '6.50', '37.00'],
                    tags: ['1', 'X', '2'],
                  },
                  {
                    league: 'Football. Italy. Serie A',
                    status: 'H1 22:54',
                    home: 'Sassuolo',
                    away: 'Cagliari',
                    odds: ['2.25', '2.90', '3.60'],
                    tags: ['1', 'X', '2'],
                  },
                  {
                    league: 'Football. India. Super League',
                    status: 'H2 92:51',
                    home: 'Jamshedpur FC',
                    away: 'Mohun Bagan SG',
                    odds: ['126.00', '15.00', '1.01'],
                    tags: ['1', 'X', '2'],
                  },
                ].map((event) => (
                  <article key={`${event.league}-${event.status}`} className={styles.eventCard}>
                    <div className={styles.eventMetaRow}>
                      <span className={styles.eventMeta}>{event.league}</span>
                      <span className={styles.eventStatus}>{event.status}</span>
                    </div>
                    <div className={styles.eventTeamsRow}>
                      <div className={styles.teamName}>{event.home}</div>
                      {event.homeScore && <div className={styles.eventScore}>{event.homeScore}</div>}
                      <div className={styles.teamName}>{event.away}</div>
                      {event.awayScore && <div className={styles.eventScore}>{event.awayScore}</div>}
                    </div>
                    <div className={styles.eventOddsRow}>
                      {event.odds.map((odd, index) => (
                        <div key={index} className={styles.eventOdds}>
                          <div className={styles.oddsValue}>{odd}</div>
                          {event.tags?.[index] && <div className={styles.oddsTag}>{event.tags[index]}</div>}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
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
          <div className={styles.betSlipHeader}>Betslip</div>
          <div className={styles.betSlipTabs}>
            <button className={styles.betSlipTabActive}>Betslip</button>
            <button className={styles.betSlipTab}>My bets</button>
          </div>
          <div className={styles.betSlipEmpty}>
            <div className={styles.betSlipIcon}>🎟️</div>
            <div className={styles.betSlipTitle}>Your betslip is empty</div>
            <div className={styles.betSlipText}>Click on odds to add a bet to the betslip</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
