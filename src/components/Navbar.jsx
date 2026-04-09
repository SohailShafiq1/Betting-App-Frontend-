import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUserWallet();
  }, []);

  const fetchUserWallet = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.data.user) {
        setWallet(response.data.user.wallet || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <a href="/withdraw" className={styles.navLink}>
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
          {!loading && (
            <div className={styles.walletDisplay}>
              <span className={styles.walletLabel}>Balance</span>
              <span className={styles.walletAmount}>${Math.round(wallet * 100) / 100}</span>
            </div>
          )}
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
