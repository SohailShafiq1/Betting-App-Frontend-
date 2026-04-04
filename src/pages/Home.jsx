import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

const bannerImages = ['/banner1.png', '/banner2.png'];
const sidebarItems = [
  'Favorites',
  'Top Parlays',
  'Bonuses',
  'Football',
  'Basketball',
  'Tennis',
  'Esports',
  'Volleyball',
];

const leagueItems = [
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Conference League',
  'England Premier League',
  'Spain LaLiga',
  'Spain Copa del Rey',
  'Italy Serie A',
];

export default function Home() {
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 2000);
    return () => clearInterval(interval);
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
            {sidebarItems.map((item) => (
              <button key={item} className={styles.sidebarButton}>{item}</button>
            ))}
          </div>

          <div className={styles.popularLabel}>FOOTBALL · POPULAR</div>
          <div className={styles.leagueList}>
            {leagueItems.map((item) => (
              <button key={item} className={styles.leagueButton}>{item}</button>
            ))}
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

            <div className={styles.eventsGrid}>
              <article className={styles.eventCard}>
                <div className={styles.eventMeta}>England. FA Cup</div>
                <div className={styles.eventTeams}>
                  <div>Man City</div>
                  <div className={styles.eventScore}>1</div>
                  <div>Liverpool</div>
                  <div className={styles.eventScore}>3</div>
                </div>
                <div className={styles.eventOddsRow}>
                  <div className={styles.eventOdds}>1.44</div>
                  <div className={styles.eventOdds}>4.5</div>
                  <div className={styles.eventOdds}>2.75</div>
                </div>
              </article>

              <article className={styles.eventCard}>
                <div className={styles.eventMeta}>World. Featured Bouts</div>
                <div className={styles.eventTeams}>
                  <div>Deontay Wilder</div>
                  <div className={styles.eventScore}>vs</div>
                  <div>Derek Chisora</div>
                </div>
                <div className={styles.eventOddsRow}>
                  <div className={styles.eventOdds}>2.64</div>
                  <div className={styles.eventOdds}>18.66</div>
                  <div className={styles.eventOdds}>1.55</div>
                </div>
              </article>

              <article className={styles.eventCard}>
                <div className={styles.eventMeta}>India. Premier League</div>
                <div className={styles.eventTeams}>
                  <div>Delhi Capitals</div>
                  <div className={styles.eventScore}>1</div>
                  <div>Mumbai Indians</div>
                  <div className={styles.eventScore}>2</div>
                </div>
                <div className={styles.eventOddsRow}>
                  <div className={styles.eventOdds}>1.02</div>
                  <div className={styles.eventOdds}>15.42</div>
                </div>
              </article>
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
