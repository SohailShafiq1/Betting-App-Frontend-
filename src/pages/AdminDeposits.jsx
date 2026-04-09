import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Admin.module.css';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, success

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/deposits/admin/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setDeposits(response.data.deposits);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching deposits:', err);
      setError(err.response?.data?.message || 'Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethod = (deposit) => {
    if (deposit.method === 'crypto') return '🪙 Crypto';
    return '💳 Card';
  };

  const getStatusColor = (status) => {
    if (status === 'success') return '#4ade80'; // Green
    if (status === 'pending') return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  const getStatusEmoji = (status) => {
    if (status === 'success') return '✅';
    if (status === 'pending') return '⏳';
    return '❌';
  };

  const filteredDeposits = deposits.filter((deposit) => {
    if (filter === 'all') return true;
    return deposit.paymentStatus === filter;
  });

  return (
    <div className={styles.adminPage}>
      <Sidebar />

      <div className={styles.adminContent}>
        <div className={styles.pageHeader}>
          <h1>💰 Deposits Management</h1>
          <p>View all user deposits and payment statuses</p>
        </div>

        {/* Filter Buttons */}
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({deposits.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending ({deposits.filter((d) => d.paymentStatus === 'pending').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'success' ? styles.active : ''}`}
            onClick={() => setFilter('success')}
          >
            ✅ Success ({deposits.filter((d) => d.paymentStatus === 'success').length})
          </button>
          <button className={styles.filterBtn} onClick={fetchDeposits}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading deposits...</p>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No deposits found</p>
          </div>
        ) : (
          <div className={styles.depositsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.colId}>ID</div>
              <div className={styles.colUser}>User</div>
              <div className={styles.colAmount}>Deposit</div>
              <div className={styles.colWallet}>Wallet</div>
              <div className={styles.colMethod}>Method</div>
              <div className={styles.colStatus}>Status</div>
              <div className={styles.colDate}>Date</div>
              <div className={styles.colProof}>Proof</div>
              <div className={styles.colActions}>Action</div>
            </div>

            {filteredDeposits.map((deposit) => (
              <div key={deposit._id} className={styles.tableRow}>
                <div className={styles.colId}>
                  <span className={styles.idBadge}>{deposit._id.slice(-8)}</span>
                </div>
                <div className={styles.colUser}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{deposit.userId?.name || 'Unknown User'}</p>
                    <p className={styles.userEmail}>{deposit.userId?.email || ''}</p>
                  </div>
                </div>
                <div className={styles.colAmount}>
                  <span className={styles.amountBadge}>${deposit.amount}</span>
                </div>
                <div className={styles.colWallet}>
                  <span className={styles.walletBadge}>
                    💰 ${Math.round((deposit.userId?.wallet || 0) * 100) / 100}
                  </span>
                </div>
                <div className={styles.colMethod}>{getPaymentMethod(deposit)}</div>
                <div className={styles.colStatus}>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(deposit.paymentStatus) }}
                  >
                    {getStatusEmoji(deposit.paymentStatus)} {deposit.paymentStatus}
                  </span>
                </div>
                <div className={styles.colDate}>
                  <span className={styles.dateText}>
                    {new Date(deposit.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className={styles.colProof}>
                  {deposit.proofImage ? (
                    <a
                      className={styles.proofLink}
                      href={`${API_URL.replace('/api', '')}${deposit.proofImage}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    <span className={styles.dateText}>—</span>
                  )}
                </div>
                <div className={styles.colActions}>
                  {deposit.method === 'crypto' && deposit.paymentStatus === 'pending' ? (
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.approveBtn}
                        onClick={async () => {
                          try {
                            await axios.patch(`${API_URL}/deposits/admin/${deposit._id}/approve-manual`, null, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                            });
                            fetchDeposits();
                          } catch (err) {
                            setError(err.response?.data?.message || 'Approval failed');
                          }
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={async () => {
                          try {
                            await axios.patch(`${API_URL}/deposits/admin/${deposit._id}/reject-manual`, null, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                            });
                            fetchDeposits();
                          } catch (err) {
                            setError(err.response?.data?.message || 'Rejection failed');
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={styles.dateText}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDeposits;
