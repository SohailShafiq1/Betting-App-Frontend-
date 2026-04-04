import { useState } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Deposit.module.css';

export default function Deposit() {
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [currency, setCurrency] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const walletAddress = 'TTxP5gGuRauokRaSTD4gF25Cis55r6tdL';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert('Wallet address copied!');
  };

  const handleSkipDeposit = () => {
    window.location.href = '/betting';
  };

  return (
    <div className={styles.depositPage}>
      <Navbar />
      
      <div className={styles.depositContainer}>
        <div className={styles.depositCard}>
          <div className={styles.depositHeader}>
            <h1 className={styles.depositTitle}>Deposit Funds</h1>
            <p className={styles.depositSubtitle}>Add funds to start betting</p>
          </div>

          {/* Payment Method Tabs */}
          <div className={styles.paymentTabs}>
            <button
              className={`${styles.tab} ${paymentMethod === 'crypto' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('crypto')}
            >
              Crypto
            </button>
            <button
              className={`${styles.tab} ${paymentMethod === 'flat' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('flat')}
            >
              Bank Transfer
            </button>
          </div>

          {paymentMethod === 'crypto' && (
            <div className={styles.paymentContent}>
              {/* Currency and Network Selection */}
              <div className={styles.paymentRow}>
                <div className={styles.paymentField}>
                  <label className={styles.fieldLabel}>Currency</label>
                  <div className={styles.selectWrapper}>
                    <div className={styles.selectBox}>
                      <span className={styles.currencyIcon}>💚</span>
                      <span>{currency}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.paymentField}>
                  <label className={styles.fieldLabel}>Network</label>
                  <div className={styles.selectWrapper}>
                    <div className={styles.selectBox}>
                      <span className={styles.networkIcon}>🔴</span>
                      <span>{network}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code and Wallet Address */}
              <div className={styles.walletSection}>
                <div className={styles.qrCode}>
                  <div className={styles.qrPlaceholder}>
                    <svg viewBox="0 0 100 100" fill="none">
                      <rect x="10" y="10" width="30" height="30" fill="#A020F0" />
                      <rect x="60" y="10" width="30" height="30" fill="#A020F0" />
                      <rect x="10" y="60" width="30" height="30" fill="#A020F0" />
                      <rect x="20" y="20" width="10" height="10" fill="#000" />
                      <rect x="70" y="20" width="10" height="10" fill="#000" />
                      <rect x="20" y="70" width="10" height="10" fill="#000" />
                      <circle cx="50" cy="50" r="8" fill="#A020F0" />
                    </svg>
                  </div>
                </div>

                <div className={styles.walletInfo}>
                  <label className={styles.fieldLabel}>Wallet Address</label>
                  <div className={styles.walletAddressBox}>
                    <span className={styles.addressText}>{walletAddress}</span>
                    <button className={styles.copyBtn} onClick={copyToClipboard}>
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className={styles.warningBox}>
                <span className={styles.warningIcon}>ℹ️</span>
                <p className={styles.warningText}>
                  Please make sure to transfer using only USDT TRC20 network. Sending funds via any other network or
                  currency may cause delays or result in permanent loss of funds.
                </p>
              </div>

              {/* Max Deposit & Processing Time */}
              <div className={styles.depositInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Max deposit</span>
                  <span className={styles.infoValue}>∞</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Est. processing time</span>
                  <span className={styles.infoValue}>~2-5 minutes</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'flat' && (
            <div className={styles.paymentContent}>
              <div className={styles.bankTransferInfo}>
                <p className={styles.transferText}>Bank transfer deposits coming soon! Check back later.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.depositActions}>
            <button className={styles.btnSecondary} onClick={handleSkipDeposit}>
              Skip for Now
            </button>
            <a href="https://wallet.tron.network/" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Open Wallet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
