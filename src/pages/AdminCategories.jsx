import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Admin.module.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ heading: '', logo: null });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const backendUrl = API_URL ? API_URL.replace(/\/api$/, '') : '';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setFormData((prev) => ({
        ...prev,
        logo: files?.[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.heading.trim() || !formData.logo) {
      setError('Category heading and logo are required');
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('heading', formData.heading);
      formDataToSend.append('logo', formData.logo);

      await axios.post(`${API_URL}/categories`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ heading: '', logo: null });
      setShowForm(false);
      setError('');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
      console.error('Error creating category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_URL}/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setError('');
        await fetchCategories();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
        console.error('Error deleting category:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <Sidebar />
        <main className={styles.adminContent}>
          <div className={styles.headerRow}>
            <h2>Categories</h2>
          </div>
          <div className={styles.loadingSpinner}>Loading categories...</div>
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
            <h2>Categories</h2>
            <p>Create categories to organize your tournaments.</p>
          </div>
          <button className={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Category'}
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h2>Create New Category</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="heading">Category Heading *</label>
              <input
                type="text"
                id="heading"
                name="heading"
                placeholder="Enter category heading (e.g., Esports, Fighting Games)"
                value={formData.heading}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="logo">Category Logo *</label>
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                onChange={handleInputChange}
              />
              {formData.logo && (
                <small style={{ color: '#4ade80', marginTop: '8px', display: 'block' }}>
                  ✓ {formData.logo.name}
                </small>
              )}
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No categories yet. Create one to get started!</p>
        </div>
      ) : (
        <div className={styles.categoriesGrid}>
          {categories.map((category) => {
            const logoUrl = category.logo?.startsWith('http')
              ? category.logo
              : `${backendUrl}${category.logo}`;

            return (
              <div key={category._id} className={styles.categoryCard}>
                <div className={styles.categoryLogo}>
                  <img src={logoUrl} alt={category.heading} />
                </div>

                <div className={styles.categoryContent}>
                  <h3>{category.heading}</h3>
                  <p className={styles.categoryMeta}>
                    {category.tournamentCount || 0} tournament{(category.tournamentCount || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(category._id)}
                  disabled={category.tournamentCount > 0}
                  title={
                    category.tournamentCount > 0
                      ? 'Cannot delete category with tournaments'
                      : 'Delete category'
                  }
                >
                  🗑️ Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
        </main>
    </div>
  );
}
