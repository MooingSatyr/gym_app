import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const logout = useAuthStore((s) => s.logout);
  const { pathname } = useLocation();

  return (
    <header className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>◈</span>
        <span className={styles.logoText}>GYMLOG</span>
      </Link>
      <nav className={styles.links}>
        <Link to="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
          Дашборд
        </Link>
      </nav>
      <button className={styles.logout} onClick={logout}>
        Выйти
      </button>
    </header>
  );
}