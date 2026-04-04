import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Admin.module.css';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', name: '', description: '', status: 'UPCOMING' });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          axios.get(`${API_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTournaments(tRes.data.data || []);
        setCategories(cRes.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.name.trim() || !formData.description.trim()) {
      setError('Category, tournament name and description are required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/tournaments`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({ category: '', name: '', description: '', status: 'UPCOMING' });
      setShowForm(false);
      setError('');
      
      // Reload tournaments
      const response = await axios.get(`${API_URL}/tournaments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTournaments(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament');
      console.error('Error creating tournament:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await axios.delete(`${API_URL}/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setError('');
        
        // Reload tournaments
        const response = await axios.get(`${API_URL}/tournaments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTournaments(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete tournament');
        console.error('Error deleting tournament:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <Sidebar />
        <main className={styles.adminContent}>
          <div className={styles.headerRow}>
            <h2>Tournaments</h2>
          </div>
          <div className={styles.loadingSpinner}>Loading tournaments...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <main className={styles.adminContent}>
        <div className={styles.headerRow}>
          <div>
            <h2>Tournaments</h2>
            <p>Create tournaments and organize your matches by category.</p>
          </div>
          <button className={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Tournament'}
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h2>Create New Tournament</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.heading} ({cat.tournamentCount || 0} tournaments)
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <small style={{ color: '#FF4D6D', marginTop: '8px', display: 'block' }}>
                  No categories available. Create one first.
                </small>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Tournament Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter tournament name (e.g., League of Legends Championship)"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter tournament description..."
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleInputChange}>
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Tournament'}
            </button>
          </form>
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tournaments yet. Create one to get started!</p>
        </div>
      ) : (
        <div className={styles.tournamentsGrid}>
          {tournaments.map((tournament) => (
            <div key={tournament._id} className={styles.tournamentCard}>
              <div className={styles.tournamentHeader}>
                <h3>{tournament.name}</h3>
                <span className={`${styles.statusBadge} ${styles[`status${tournament.status}`]}`}>
                  {tournament.status}
                </span>
              </div>

              {tournament.category && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 8px 0' }}>
                  📂 {tournament.category.heading}
                </p>
              )}

              <p className={styles.description}>{tournament.description}</p>

              <div className={styles.cardFooter}>
                <div className={styles.matchCount}>
                  <span className={styles.matchLabel}>Matches:</span>
                  <span className={styles.matchValue}>{tournament.matchCount || 0}</span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(tournament._id)}
                  disabled={tournament.matchCount > 0}
                  title={tournament.matchCount > 0 ? 'Cannot delete tournament with matches' : 'Delete tournament'}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}
