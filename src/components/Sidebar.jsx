import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
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
        <NavLink to="/admin/teams" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>🏟️</span>
          Matches
        </NavLink>
        <NavLink to="/admin/settings" onClick={closeMenu} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}>⚙️</span>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
