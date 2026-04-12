import { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import styles from '../styles/Deposit.module.css';

const Deposit = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('crypto');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [coins, setCoins] = useState([]);
  const [selectedCoinIndex, setSelectedCoinIndex] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const response = await api.get('/settings/public');
        const list = response.data?.coins || [];
        setCoins(list);
        setSelectedCoinIndex(0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load deposit coins');
      }
    };

    loadCoins();
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || !isNaN(value)) {
      setAmount(value);
    }
  };

  const validateForm = () => {
    setError('');
    
    if (!amount) {
      setError('❌ Please enter an amount');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 10 || amountNum > 10000) {
      setError('❌ Amount must be between $10 and $10,000');
      return false;
    }

    if (!cardholderName.trim()) {
      setError('❌ Please enter cardholder name');
      return false;
    }

    if (!stripe || !elements) {
      setError('❌ Payment system not ready');
      return false;
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔄 Creating payment intent...');
      const intentResponse = await axios.post(
        `${API_URL}/deposits/create-payment-intent`,
        { amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { clientSecret, depositId } = intentResponse.data;
      console.log('✅ Payment intent created:', depositId);

      console.log('🔄 Confirming payment with card...');
      const cardElement = elements.getElement(CardElement);
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
            },
          },
        }
      );

      console.log('💳 Stripe Response:', { stripeError, paymentIntent });

      if (stripeError) {
        console.error('❌ Payment error:', stripeError.message);
        setError(`❌ Payment failed: ${stripeError.message}`);
        setLoading(false);
        return;
      }

      console.log('Payment Intent Status:', paymentIntent?.status);

      if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment successful!');
        setSuccess('✅ Payment successful! Your wallet has been credited.');
        
        setAmount('');
        setCardholderName('');
        if (cardElement) {
          cardElement.clear();
        }

        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        console.error('Payment status:', paymentIntent?.status);
        setError(`❌ Payment failed with status: ${paymentIntent?.status}`);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amountNum = parseFloat(cryptoAmount);
    const selectedCoin = coins[selectedCoinIndex];

    if (!selectedCoin) {
      setError('❌ No crypto coin configured. Please contact support.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('❌ Please enter a valid amount');
      return;
    }

    if (!proofFile) {
      setError('❌ Please upload a payment screenshot');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('amount', amountNum);
      formData.append('network', selectedCoin.network);
      formData.append('walletAddress', selectedCoin.address);
      formData.append('coinName', selectedCoin.name);
      formData.append('coinSymbol', selectedCoin.symbol);
      formData.append('proof', proofFile);

      await api.post('/deposits/crypto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('✅ Crypto deposit submitted for admin approval.');
      setCryptoAmount('');
      setProofFile(null);
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.depositPage}>
      <Navbar />
      <div className={styles.depositContainer}>
        <section className={styles.depositCard}>
          <header className={styles.depositHeader}>
            <h1 className={styles.depositTitle}>Make a Deposit</h1>
            <p className={styles.depositSubtitle}>Add funds to your betting wallet</p>
          </header>

          <div className={styles.tabsContainer}>
            {/* <button
              className={`${styles.tabButton} ${activeTab === 'card' ? styles.active : ''}`}
              onClick={() => setActiveTab('card')}
            >
              💳 Card Payment
            </button> */}
            <button
              className={`${styles.tabButton} ${activeTab === 'crypto' ? styles.active : ''}`}
              onClick={() => setActiveTab('crypto')}
            >
              🪙 Crypto
            </button>
            {/* <button
              className={`${styles.tabButton} ${activeTab === 'bank' ? styles.active : ''}`}
              onClick={() => setActiveTab('bank')}
              disabled
            >
              🏦 Bank Transfer (Coming Soon)
            </button> */}
          </div>

          {/* {activeTab === 'card' && (
            <form onSubmit={handlePayment} className={styles.cardForm}>
              <div className={styles.formGroup}>
                <label htmlFor="amount">Deposit Amount</label>
                <div className={styles.amountInput}>
                  <span className={styles.currencySymbol}>$</span>
                  <input
                    id="amount"
                    type="text"
                    placeholder="10.00"
                    value={amount}
                    onChange={handleAmountChange}
                    className={styles.inputField}
                    disabled={loading}
                  />
                </div>
                <small className={styles.hint}>Minimum: $10 | Maximum: $10,000</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cardholderName">Cardholder Name</label>
                <input
                  id="cardholderName"
                  type="text"
                  placeholder="Full Name on Card"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className={styles.inputField}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="card">Card Details</label>
                <div className={styles.cardElementWrapper}>
                  {stripe && elements ? (
                    <CardElement
                      id="card"
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#A020F0',
                            fontFamily: '"Segoe UI", "Roboto", sans-serif',
                            '::placeholder': {
                              color: '#C77DFF',
                            },
                          },
                          invalid: {
                            color: '#FF4D6D',
                          },
                        },
                      }}
                      disabled={loading}
                    />
                  ) : (
                    <p className={styles.error}>Loading payment system...</p>
                  )}
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              {success && <div className={styles.successBox}>{success}</div>}

              <div className={styles.securityInfo}>
                <span className={styles.securityIcon}>🔒</span>
                <p className={styles.securityText}>
                  Your payment is processed securely via Stripe. We never store your card details.
                </p>
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading || !stripe || !elements}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Processing Payment...
                  </>
                ) : (
                  `💳 Pay $${amount || '0.00'}`
                )}
              </button>
            </form>
          )} */}

          {activeTab === 'crypto' && (
            <form onSubmit={handleCryptoSubmit} className={styles.paymentContent}>
              {coins.length === 0 && (
                <div className={styles.warningBox}>
                  <span className={styles.warningIcon}>i</span>
                  <p className={styles.warningText}>
                    No crypto wallets configured yet. Please contact support.
                  </p>
                </div>
              )}
              <div className={styles.paymentRow}>
                <div className={styles.paymentField}>
                  <span className={styles.fieldLabel}>Currency</span>
                  <select
                    className={styles.inputField}
                    value={selectedCoinIndex}
                    onChange={(e) => setSelectedCoinIndex(Number(e.target.value))}
                  >
                    {coins.map((coin, index) => (
                      <option key={`${coin.symbol}-${index}`} value={index}>
                        {coin.symbol} · {coin.network}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.paymentField}>
                  <span className={styles.fieldLabel}>Network</span>
                  <div className={styles.selectBox}>
                    <span className={styles.networkIcon}>🌐</span>
                    <strong>{coins[selectedCoinIndex]?.network || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.walletSection}>
                <div className={styles.qrPlaceholder}>
                  {coins[selectedCoinIndex]?.address ? (
                    <img
                      alt="Wallet QR"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                        coins[selectedCoinIndex].address
                      )}`}
                    />
                  ) : (
                    <span>QR</span>
                  )}
                </div>
                <div className={styles.walletInfo}>
                  <div className={styles.walletAddressBox}>
                    <span className={styles.addressText}>
                      {coins[selectedCoinIndex]?.address || 'No address'}
                    </span>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => {
                        if (coins[selectedCoinIndex]?.address) {
                          navigator.clipboard.writeText(coins[selectedCoinIndex].address);
                        }
                      }}
                      disabled={!coins[selectedCoinIndex]?.address}
                    >
                      Copy address
                    </button>
                  </div>
                  <div className={styles.warningBox}>
                    <span className={styles.warningIcon}>i</span>
                    <p className={styles.warningText}>
                      Please use {coins[selectedCoinIndex]?.symbol || 'this coin'}{' '}
                      {coins[selectedCoinIndex]?.network || ''} network only. Sending to
                      other networks may result in loss of funds.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.paymentRow}>
                <div className={styles.paymentField}>
                  <span className={styles.fieldLabel}>Amount</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                    className={styles.inputField}
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.paymentField}>
                  <span className={styles.fieldLabel}>Upload screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className={styles.inputField}
                  />
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}
              {success && <div className={styles.successBox}>{success}</div>}

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading || coins.length === 0}
              >
                {loading ? 'Submitting...' : 'Submit Crypto Deposit'}
              </button>
            </form>
          )}
          {/* {activeTab === 'bank' && (
            <div className={styles.comingSoon}>
              <p>🏦 Bank transfers coming soon!</p>
            </div>
          )} */}
        </section>
      </div>
    </div>
  );
};

export default Deposit;
