import { useEffect, useState } from 'react';
import { useBetslip } from '../context/BetslipContext';
import api from '../api/axios';
import styles from '../styles/Betslip.module.css';

export default function Betslip() {
  const { betslips, removeFromBetslip, updateBetAmount, clearBetslip } = useBetslip();
  const [activeTab, setActiveTab] = useState('betslip');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [myBets, setMyBets] = useState([]);
  const [myBetsLoading, setMyBetsLoading] = useState(false);
  const [myBetsError, setMyBetsError] = useState('');

  // Get current wallet from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentWallet = user.wallet || 0;

  const totalStake = betslips.reduce((sum, bet) => sum + (bet.amount || 0), 0);
  const estimatedReturn = betslips.reduce((sum, bet) => {
    const betReturn = (bet.amount || 0) * bet.odds;
    return sum + betReturn;
  }, 0);

  const fetchMyBets = async () => {
    setMyBetsLoading(true);
    setMyBetsError('');
    try {
      const response = await api.get('/bets');
      setMyBets(response.data || []);
    } catch (err) {
      setMyBetsError(err.response?.data?.message || 'Unable to load bets');
    } finally {
      setMyBetsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mybets') {
      fetchMyBets();
    }
  }, [activeTab]);

  const getBetStatus = (bet) => {
    if (bet.status === 'OPEN' || bet.result === 'PENDING') {
      return 'OPEN';
    }
    if (bet.result === 'WIN') {
      return 'WIN';
    }
    if (bet.result === 'LOSE') {
      return 'LOSE';
    }
    return bet.status || 'OPEN';
  };

  const handleAddAmount = (amount) => {
    if (betslips.length > 0) {
      const lastBet = betslips[betslips.length - 1];
      const newAmount = (lastBet.amount || 0) + amount;
      updateBetAmount(lastBet.matchId, lastBet.choice, newAmount);
    }
  };

  const handleAllIn = () => {
    if (betslips.length > 0) {
      const lastBet = betslips[betslips.length - 1];
      updateBetAmount(lastBet.matchId, lastBet.choice, currentWallet);
    }
  };

  const handlePlaceBets = async () => {
    if (betslips.length === 0) {
      setError('No bets to place');
      return;
    }

    if (betslips.some((bet) => !bet.amount || bet.amount < 5)) {
      setError('All bets must be at least 5 USD');
      return;
    }

    if (totalStake > currentWallet) {
      setError(`Insufficient balance. Available: $${currentWallet.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const results = await Promise.all(
        betslips.map((bet) =>
          api.post('/bets', {
            amount: bet.amount,
            matchId: bet.matchId,
            choice: bet.choice,
          })
        )
      );

      const totalWinnings = results.reduce((sum, result) => sum + (result.data.payout || 0), 0);
      const wins = results.filter((r) => r.data.result === 'WIN').length;

      setMessage(
        `✅ ${wins} of ${betslips.length} bets won! Total winnings: $${totalWinnings.toFixed(2)}`
      );

      const newWallet = results[results.length - 1].data.wallet;
      localStorage.setItem('user', JSON.stringify({ ...user, wallet: newWallet }));

      setTimeout(() => {
        clearBetslip();
        setMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.betslipWrapper}>
      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'betslip' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('betslip')}
        >
          Betslip
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mybets' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('mybets')}
        >
          My bets
        </button>
      </div>

      {activeTab === 'betslip' ? (
        <div className={styles.betslipContent}>
          {/* <div className={styles.betTypeContainer}>
            <button className={`${styles.betTypeBtn} ${styles.betTypeBtnActive}`}>Single bet</button>
            <button className={styles.betTypeBtn}>Parlay</button>
            <button className={styles.betTypeBtn}>System</button>
          </div> */}

          {betslips.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No bets added</p>
              <small>Click on odds to add bets</small>
            </div>
          ) : (
            <>
              {/* Bets List */}
              <div className={styles.betsList}>
                {betslips.map((bet, idx) => (
                  <div key={`${bet.matchId}-${bet.choice}`} className={styles.betItem}>
                    <div className={styles.betItemHeader}>
                      <span className={styles.liveBadge}>Live</span>
                      <button
                        className={styles.removeBetBtn}
                        onClick={() => removeFromBetslip(bet.matchId, bet.choice)}
                      >
                        ×
                      </button>
                    </div>

                    <div className={styles.betMatchInfo}>
                      <small className={styles.matchDescription}>
                        Innings 1, {bet.teamAName} - {bet.teamBName}
                      </small>
                    </div>

                    <div className={styles.betWinnerSection}>
                      <span className={styles.winnerLabel}>Winner</span>
                      <div className={styles.teamAndOdds}>
                        <span className={styles.teamNameBet}>{bet.teamName}</span>
                        <span className={styles.oddsDisplay}>{bet.odds.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Parlay Boost Offer */}
                    {idx === 0 && betslips.length > 1 && (
                      <div className={styles.boostOffer}>
                        <span className={styles.boostIcon}>✓</span>
                        <span className={styles.boostText}>
                          Add 2 outcomes to activate Parlay Boost
                        </span>
                        <span className={styles.infoIcon}>ℹ</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Amount Buttons */}
              <div className={styles.amountButtons}>
                <button
                  className={styles.amountBtn}
                  onClick={() => handleAddAmount(10)}
                  disabled={loading}
                >
                  +10
                </button>
                <button
                  className={styles.amountBtn}
                  onClick={() => handleAddAmount(25)}
                  disabled={loading}
                >
                  +25
                </button>
                <button
                  className={styles.amountBtn}
                  onClick={() => handleAddAmount(100)}
                  disabled={loading}
                >
                  +100
                </button>
                <button
                  className={styles.amountBtn}
                  onClick={handleAllIn}
                  disabled={loading}
                >
                  All in
                </button>
              </div>

              {/* Bet Amount Input */}
              <div className={styles.betAmountSection}>
                <label className={styles.betAmountLabel}>Bet amount</label>
                <div className={styles.betAmountInputWrapper}>
                  <input
                    type="number"
                    placeholder="0"
                    min="5"
                    step="1"
                    value={betslips[betslips.length - 1]?.amount || ''}
                    onChange={(e) => {
                      const lastBet = betslips[betslips.length - 1];
                      if (lastBet) {
                        updateBetAmount(lastBet.matchId, lastBet.choice, e.target.value);
                      }
                    }}
                    disabled={loading}
                    className={styles.betAmountInput}
                  />
                  <span className={styles.currencyLabel}>USDT</span>
                </div>
              </div>

              {/* Error or Status */}
              {error && <div className={styles.errorMessage}>{error}</div>}
              {message && <div className={styles.successMessage}>{message}</div>}

              {currentWallet < totalStake && totalStake > 0 && (
                <div className={styles.insufficientFunds}>
                  Not enough money in the account. Available amount{' '}
                  <strong>${currentWallet.toFixed(2)} USDT</strong>
                </div>
              )}

              {/* Action Button */}
              {currentWallet < totalStake && totalStake > 0 ? (
                <button className={styles.depositButton}>+ Make a deposit</button>
              ) : (
                <button
                  className={styles.placeBetButton}
                  onClick={handlePlaceBets}
                  disabled={loading || betslips.length === 0 || totalStake > currentWallet}
                >
                  {loading ? 'Placing...' : `Place Bet (${totalStake.toFixed(2)} USDT)`}
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.myBetsContent}>
          {myBetsLoading && <p>Loading your bets...</p>}
          {!myBetsLoading && myBetsError && <p>{myBetsError}</p>}
          {!myBetsLoading && !myBetsError && myBets.length === 0 && (
            <p>No bets yet</p>
          )}
          {!myBetsLoading && !myBetsError && myBets.length > 0 && (
            <div className={styles.myBetsList}>
              {myBets.map((bet) => {
                const match = bet.match;
                const status = getBetStatus(bet);
                const teamName =
                  bet.teamName ||
                  (bet.choice === 'A' ? match?.teamAName : match?.teamBName) ||
                  'Team';

                return (
                  <div key={bet._id} className={styles.myBetItem}>
                    <div className={styles.myBetHeader}>
                      <span className={styles.myBetTeams}>
                        {match ? `${match.teamAName} vs ${match.teamBName}` : 'Match'}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${
                          status === 'WIN'
                            ? styles.statusWin
                            : status === 'LOSE'
                              ? styles.statusLose
                              : styles.statusOpen
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className={styles.myBetRow}>
                      <span className={styles.myBetLabel}>Pick</span>
                      <span className={styles.myBetValue}>{teamName}</span>
                    </div>
                    <div className={styles.myBetRow}>
                      <span className={styles.myBetLabel}>Amount</span>
                      <span className={styles.myBetValue}>
                        ${Number(bet.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.myBetRow}>
                      <span className={styles.myBetLabel}>Odds</span>
                      <span className={styles.myBetValue}>
                        {Number(bet.odds || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
