import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { to: '/', label: 'Home', icon: '⌂' },
    { to: '/deposit', label: 'Deposit', icon: '⊕' },
    { to: '/betting', label: 'Betting', icon: '◉' },
    { to: '/friendly', label: 'Friendly', icon: '◌' },
    { to: '/withdraw', label: 'Withdraw', icon: '⇣' },
    { to: '/transactions', label: 'History', icon: '↻' },
  ];
  
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
          {/* <img src="/Logo.svg" alt="Parimatch Logo" className={styles.logoImg} /> */}
          <span className={styles.logoText}>WINORA</span>
        </div>

        <ul className={styles.navMenu}>
          {navItems.map((item) => (
            <li className={styles.navItem} key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
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
              {user.userId && <span className={styles.userId}>ID: {user.userId}</span>}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

      </div>

      <ul className={styles.bottomNav}>
        {navItems.map((item) => (
          <li className={styles.bottomNavItem} key={`bottom-${item.to}`}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.bottomNavLinkActive : ''}`}
            >
              <span className={styles.bottomNavIcon}>{item.icon}</span>
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
