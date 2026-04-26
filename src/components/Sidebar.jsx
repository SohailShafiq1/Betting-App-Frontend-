import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
      {menuOpen && <div className={styles.backdrop} onClick={closeMenu} />}
      <div className={styles.topRow}>
        <div className={styles.brand}>BET ADMIN</div>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav className={`${styles.menu} ${menuOpen ? styles.open : ''}`}>
        <NavLink to="/admin/dashboard" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/deposits" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>💰</span>
          Deposits
        </NavLink>
        <NavLink to="/admin/withdrawals" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>🏦</span>
          Withdrawals
        </NavLink>
        <NavLink to="/admin/users" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>👥</span>
          Users
        </NavLink>
        <NavLink to="/admin/open-bets" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>🎯</span>
          Bets Open
        </NavLink>
        <NavLink to="/admin/friendly-bets" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>🤝</span>
          Friendly Bets
        </NavLink>
        <NavLink to="/admin/categories" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>📂</span>
          Categories
        </NavLink>
        <NavLink to="/admin/tournaments" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>🎮</span>
          Tournaments
        </NavLink>
        <NavLink to="/admin/teams" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>🏟️</span>
          Matches
        </NavLink>
        <NavLink to="/admin/settings" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>⚙️</span>
          Settings
        </NavLink>
      </nav>
      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
