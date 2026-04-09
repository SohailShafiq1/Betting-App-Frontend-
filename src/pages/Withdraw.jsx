import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import styles from '../styles/Withdraw.module.css';

export default function Withdraw() {
  const [method, setMethod] = useState('BANK');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [coinNetwork, setCoinNetwork] = useState('TRC20');
  const [trcId, setTrcId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setAmount('');
    setReason('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setCoinNetwork('TRC20');
    setTrcId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (method === 'BANK') {
      if (!bankName || !accountNumber || !accountName) {
        setError('Bank name, account number, and account name are required');
        return;
      }
    }

    if (method === 'COIN') {
      if (!trcId) {
        setError('TRC ID is required');
        return;
      }
    }

    setLoading(true);

    try {
      await api.post('/withdrawals', {
        amount: value,
        method,
        reason,
        bank: method === 'BANK'
          ? { bankName, accountNumber, accountName }
          : undefined,
        coin: method === 'COIN'
          ? { network: coinNetwork, trcId }
          : undefined,
      });

      setSuccess('Withdrawal request submitted. Please wait for admin approval.');
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.withdrawPage}>
      <Navbar />
      <div className={styles.withdrawContainer}>
        <div className={styles.withdrawCard}>
          <h1>Withdraw Funds</h1>
          <p className={styles.subtitle}>Submit a withdrawal request for admin approval.</p>

          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${method === 'BANK' ? styles.active : ''}`}
              onClick={() => setMethod('BANK')}
              type="button"
            >
              Withdraw to Bank
            </button>
            <button
              className={`${styles.tabButton} ${method === 'COIN' ? styles.active : ''}`}
              onClick={() => setMethod('COIN')}
              type="button"
            >
              Withdraw to Coin
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              Amount to withdraw
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Reason (optional)
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for withdrawal"
                className={styles.input}
              />
            </label>

            {method === 'BANK' && (
              <div className={styles.section}>
                <label className={styles.label}>
                  Bank name
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    className={styles.input}
                  />
                </label>
                <label className={styles.label}>
                  Account number
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account number"
                    className={styles.input}
                  />
                </label>
                <label className={styles.label}>
                  Account name
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Account holder name"
                    className={styles.input}
                  />
                </label>
              </div>
            )}

            {method === 'COIN' && (
              <div className={styles.section}>
                <label className={styles.label}>
                  Network
                  <select
                    value={coinNetwork}
                    onChange={(e) => setCoinNetwork(e.target.value)}
                    className={styles.input}
                  >
                    <option value="TRC20">TRC20</option>
                    <option value="ERC20">ERC20</option>
                    <option value="BEP20">BEP20</option>
                  </select>
                </label>
                <label className={styles.label}>
                  TRC ID / Wallet Address
                  <input
                    type="text"
                    value={trcId}
                    onChange={(e) => setTrcId(e.target.value)}
                    placeholder="Wallet address"
                    className={styles.input}
                  />
                </label>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Submitting...' : 'Withdraw'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
