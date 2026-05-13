import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../api/client';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    if (form.password.length < 8) { setError('Пароль минимум 8 символов'); return; }
    setLoading(true); setError('');
    try {
      await apiRegister(form.login, form.password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Логин уже занят');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>GYMLOG</span>
        </div>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.sub}>Создай аккаунт и начни трекинг</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Логин</label>
            <input className={styles.input} type="text" value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              placeholder="your_login" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input className={styles.input} type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="минимум 8 символов" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Повтори пароль</label>
            <input className={styles.input} type="password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••" required />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Создать аккаунт'}
          </button>
        </form>
        <p className={styles.footer}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>Войти</Link>
        </p>
      </div>
    </div>
  );
}