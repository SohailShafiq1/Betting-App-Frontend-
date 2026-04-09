import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import styles from '../styles/Transactions.module.css';

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depositsRes, withdrawalsRes] = await Promise.all([
          api.get('/deposits'),
          api.get('/withdrawals'),
        ]);

        const deposits = depositsRes.data?.deposits || [];
        const withdrawals = withdrawalsRes.data?.withdrawals || [];

        const depositItems = deposits.map((deposit) => ({
          id: deposit._id,
          type: 'Deposit',
          method: deposit.method === 'crypto' ? 'Crypto' : 'Card',
          amount: deposit.amount,
          status: deposit.paymentStatus || deposit.status || 'pending',
          createdAt: deposit.createdAt,
          details: deposit.method === 'crypto' ? deposit.network : null,
        }));

        const withdrawalItems = withdrawals.map((withdrawal) => ({
          id: withdrawal._id,
          type: 'Withdrawal',
          method: withdrawal.method === 'BANK' ? 'Bank' : 'Coin',
          amount: withdrawal.amount,
          status: withdrawal.status || 'PENDING',
          createdAt: withdrawal.createdAt,
          details: withdrawal.method === 'BANK'
            ? withdrawal.bank?.bankName
            : withdrawal.coin?.network,
        }));

        const combined = [...depositItems, ...withdrawalItems].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setItems(combined);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatStatus = (status) => {
    const value = String(status || '').toUpperCase();
    if (value === 'SUCCESS' || value === 'APPROVED') return 'APPROVED';
    if (value === 'FAILED' || value === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <div>
              <h1>Transactions</h1>
              <p className={styles.subtitle}>Deposits and withdrawal history</p>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {loading ? (
            <div className={styles.loading}>Loading transactions...</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>No transactions found</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div>ID</div>
                <div>Type</div>
                <div>Method</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Date</div>
              </div>
              {items.map((item) => {
                const status = formatStatus(item.status);
                return (
                  <div key={item.id} className={styles.tableRow}>
                    <div className={styles.idBadge}>{item.id.slice(-8)}</div>
                    <div className={styles.type}>{item.type}</div>
                    <div className={styles.method}>
                      {item.method}
                      {item.details ? ` · ${item.details}` : ''}
                    </div>
                    <div className={styles.amount}>${Number(item.amount).toFixed(2)}</div>
                    <div className={`${styles.status} ${styles[`status${status}`]}`}>
                      {status}
                    </div>
                    <div className={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
