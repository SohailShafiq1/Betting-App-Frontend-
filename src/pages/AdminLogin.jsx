import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from '../styles/AdminLogin.module.css';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', credentials);
      const user = response.data.user;
      if (user.role !== 'admin') {
        setError('Admin credentials required');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}> 
      <div className={styles.card}>
        <h1>Admin Login</h1>
        <p>Sign in with admin credentials to access the panel.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
