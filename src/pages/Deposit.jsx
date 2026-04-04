import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
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
  const [activeTab, setActiveTab] = useState('card');

  const API_URL = import.meta.env.VITE_API_URL;

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

  return (
    <div>
      <Navbar />
      <div className={styles.depositContainer}>
        <div className={styles.depositCard}>
          <h1>💰 Make a Deposit</h1>
          <p className={styles.subtitle}>Add funds to your betting wallet</p>

          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === 'card' ? styles.active : ''}`}
              onClick={() => setActiveTab('card')}
            >
              💳 Card Payment
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'crypto' ? styles.active : ''}`}
              onClick={() => setActiveTab('crypto')}
              disabled
            >
              🪙 Crypto (Coming Soon)
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'bank' ? styles.active : ''}`}
              onClick={() => setActiveTab('bank')}
              disabled
            >
              🏦 Bank Transfer (Coming Soon)
            </button>
          </div>

          {activeTab === 'card' && (
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
                🔒 Your payment is processed securely via Stripe. We never store your card details.
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
          )}

          {activeTab === 'crypto' && (
            <div className={styles.comingSoon}>
              <p>🪙 Cryptocurrency deposits coming soon!</p>
            </div>
          )}
          {activeTab === 'bank' && (
            <div className={styles.comingSoon}>
              <p>🏦 Bank transfers coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
