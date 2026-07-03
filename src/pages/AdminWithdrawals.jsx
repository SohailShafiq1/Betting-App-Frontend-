import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import styles from '../styles/Admin.module.css';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const getWithdrawalDestination = (withdrawal) => {
    if (withdrawal.method === 'BANK') {
      return {
        title: withdrawal.bank?.bankName || 'Bank details not provided',
        lines: [
          `Account: ${withdrawal.bank?.accountNumber || 'N/A'}`,
          `Name: ${withdrawal.bank?.accountName || 'N/A'}`,
        ],
      };
    }

    return {
      title: withdrawal.coin?.network || 'Coin details not provided',
      lines: [`Address: ${withdrawal.coin?.trcId || 'N/A'}`],
    };
  };

  const getWithdrawalPaymentValue = (withdrawal) => {
    if (withdrawal.method === 'BANK') {
      return withdrawal.bank?.accountNumber || 'N/A';
    }

    return withdrawal.coin?.trcId || 'N/A';
  };

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (clipboardError) {
      console.error('Copy failed', clipboardError);
    }
  };

  const openMobileRequest = (withdrawal) => {
    if (!isMobileScreen) return;
    setSelectedWithdrawal(withdrawal);
  };

  const closeMobileRequest = () => {
    setSelectedWithdrawal(null);
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/withdrawals/admin/all');
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals || []);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 680px)');

    const updateScreenSize = () => {
      setIsMobileScreen(mediaQuery.matches);
    };

    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);

    return () => mediaQuery.removeEventListener('change', updateScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobileScreen) {
      setSelectedWithdrawal(null);
    }
  }, [isMobileScreen]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/withdrawals/admin/${id}/approve`);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/withdrawals/admin/${id}/reject`);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    }
  };

  const filtered = withdrawals.filter((withdrawal) => {
    if (filter === 'all') return true;
    return withdrawal.status === filter.toUpperCase();
  });

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return '#4ade80';
    if (status === 'PENDING') return '#facc15';
    return '#ef4444';
  };

  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <div className={styles.adminContent}>
        <div className={styles.pageHeader}>
          <h1>🏦 Withdrawals</h1>
          <p>Review and approve user withdrawal requests</p>
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({withdrawals.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending ({withdrawals.filter((d) => d.status === 'PENDING').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'approved' ? styles.active : ''}`}
            onClick={() => setFilter('approved')}
          >
            ✅ Approved ({withdrawals.filter((d) => d.status === 'APPROVED').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'rejected' ? styles.active : ''}`}
            onClick={() => setFilter('rejected')}
          >
            ❌ Rejected ({withdrawals.filter((d) => d.status === 'REJECTED').length})
          </button>
          <button className={styles.filterBtn} onClick={fetchWithdrawals}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading withdrawals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No withdrawals found</p>
          </div>
        ) : (
          <div className={styles.withdrawalsTable}>
            <div className={styles.withdrawalsHeader}>
              <div className={styles.colId}>ID</div>
              <div className={styles.colUser}>User</div>
              <div className={styles.colAmount}>Amount</div>
              <div className={styles.colMethod}>Method</div>
              <div className={styles.colStatus}>Status</div>
              <div className={styles.colDate}>Date</div>
              <div className={styles.colActions}>Action</div>
            </div>

            {filtered.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className={`${styles.withdrawalsRow} ${isMobileScreen ? styles.withdrawalsRowMobile : ''}`}
                onClick={() => openMobileRequest(withdrawal)}
                role={isMobileScreen ? 'button' : undefined}
                tabIndex={isMobileScreen ? 0 : undefined}
                onKeyDown={(event) => {
                  if (!isMobileScreen) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openMobileRequest(withdrawal);
                  }
                }}
              >
                <div className={styles.colId}>
                  <span className={styles.idBadge}>{withdrawal._id.slice(-8)}</span>
                </div>
                <div className={styles.colUser}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{withdrawal.userId?.name || 'Unknown'}</p>
                    <p className={styles.userEmail}>{withdrawal.userId?.email || ''}</p>
                  </div>
                </div>
                <div className={styles.colAmount}>
                  <span className={styles.amountBadge}>${withdrawal.amount}</span>
                </div>
                <div className={styles.colMethod}>
                  <div className={styles.methodStack}>
                    <span className={styles.walletBadge}>
                      {withdrawal.method === 'BANK' ? '🏦 Bank' : '🪙 Coin'}
                    </span>
                    <div className={styles.withdrawalDetails}>
                      <p className={styles.detailTitle}>{getWithdrawalDestination(withdrawal).title}</p>
                      {getWithdrawalDestination(withdrawal).lines.map((line) => (
                        <p key={line} className={styles.detailLine}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.colStatus}>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(withdrawal.status) }}
                  >
                    {withdrawal.status}
                  </span>
                </div>
                <div className={styles.colDate}>
                  <span className={styles.dateText}>
                    {new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className={styles.colActions}>
                  {withdrawal.status === 'PENDING' ? (
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(withdrawal._id)}
                      >
                        Approve
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReject(withdrawal._id)}
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

        {isMobileScreen && selectedWithdrawal && (
          <div className={styles.mobileModalOverlay} onClick={closeMobileRequest} role="presentation">
            <div
              className={styles.mobileModal}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className={styles.mobileModalHeader}>
                <div>
                  <p className={styles.mobileModalEyebrow}>Withdrawal request</p>
                  <h2 className={styles.mobileModalTitle}>{selectedWithdrawal.userId?.name || 'Unknown user'}</h2>
                  <p className={styles.mobileModalSubtext}>{selectedWithdrawal.userId?.email || ''}</p>
                </div>
                <button type="button" className={styles.mobileCloseBtn} onClick={closeMobileRequest}>
                  ×
                </button>
              </div>

              <div className={styles.mobileModalSection}>
                <span className={styles.mobileSectionLabel}>Selected method</span>
                <div className={styles.mobilePillRow}>
                  <span className={styles.walletBadge}>
                    {selectedWithdrawal.method === 'BANK' ? '🏦 Bank' : '🪙 Coin'}
                  </span>
                  <span className={styles.mobileValueBadge}>{getWithdrawalDestination(selectedWithdrawal).title}</span>
                </div>
              </div>

              <div className={styles.mobileModalSection}>
                <span className={styles.mobileSectionLabel}>
                  {selectedWithdrawal.method === 'BANK' ? 'Account number' : 'Wallet address'}
                </span>
                <div className={styles.mobileCopyRow}>
                  <p className={styles.mobileCopyValue}>{getWithdrawalPaymentValue(selectedWithdrawal)}</p>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(getWithdrawalPaymentValue(selectedWithdrawal))}
                  >
                    Copy
                  </button>
                </div>
                {selectedWithdrawal.method === 'BANK' && (
                  <p className={styles.mobileModalMeta}>
                    Account name: {selectedWithdrawal.bank?.accountName || 'N/A'}
                  </p>
                )}
              </div>

              <div className={styles.mobileModalSection}>
                <span className={styles.mobileSectionLabel}>Request status</span>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(selectedWithdrawal.status) }}
                >
                  {selectedWithdrawal.status}
                </span>
              </div>

              {selectedWithdrawal.status === 'PENDING' && (
                <div className={styles.mobileActionButtons}>
                  <button
                    type="button"
                    className={styles.approveBtn}
                    onClick={() => handleApprove(selectedWithdrawal._id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={styles.rejectBtn}
                    onClick={() => handleReject(selectedWithdrawal._id)}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
