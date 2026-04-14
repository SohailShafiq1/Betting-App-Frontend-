import Navbar from '../components/Navbar';
import Betslip from '../components/Betslip';
import styles from '../styles/BettingScreen.module.css';

export default function BettingScreen() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.header}>
          <h1>Betting Screen</h1>
          <p>Manage your betslip, adjust stake amounts, and place bets from one full-page view.</p>
        </section>

        <section className={styles.betslipPanel}>
          <Betslip />
        </section>
      </main>
    </div>
  );
}
