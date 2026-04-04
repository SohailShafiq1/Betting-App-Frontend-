import { NavLink } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>BET ADMIN</div>
      <nav className={styles.menu}>
        <NavLink to="/admin/dashboard" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/teams" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Matches
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
