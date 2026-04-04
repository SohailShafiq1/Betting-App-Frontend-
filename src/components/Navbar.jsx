import { useState } from 'react';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <img src="/Logo.svg" alt="Parimatch Logo" className={styles.logoImg} />
          <span className={styles.logoText}>PARIMATCH</span>
        </div>

        <ul className={`${styles.navMenu} ${mobileMenuOpen ? styles.active : ''}`}>
          <li className={styles.navItem}>
            <a href="/" className={styles.navLink}>
              Home
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/deposit" className={styles.navLink}>
              Deposit
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/betting" className={styles.navLink}>
              Betting
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/withdrawals" className={styles.navLink}>
              Withdrawals
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/transactions" className={styles.navLink}>
              Transactions
            </a>
          </li>
        </ul>

        <div className={styles.navbarUser}>
          {user && user.name && (
            <>
              <span className={styles.userName}>{user.name}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        <div
          className={`${styles.hamburger} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
