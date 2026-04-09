import { createContext, useContext, useState } from 'react';

const BetslipContext = createContext();

export const BetslipProvider = ({ children }) => {
  const [betslips, setBetslips] = useState([]);

  const addToBetslip = (match, choice, odds, teamName) => {
    // Check if already added
    const exists = betslips.some(
      (bet) => bet.matchId === match._id && bet.choice === choice
    );

    if (!exists) {
      setBetslips([
        ...betslips,
        {
          matchId: match._id,
          teamAName: match.teamAName,
          teamBName: match.teamBName,
          choice,
          teamName,
          odds,
          amount: '',
        },
      ]);
    }
  };

  const removeFromBetslip = (matchId, choice) => {
    setBetslips(betslips.filter((bet) => !(bet.matchId === matchId && bet.choice === choice)));
  };

  const updateBetAmount = (matchId, choice, amount) => {
    setBetslips(
      betslips.map((bet) =>
        bet.matchId === matchId && bet.choice === choice
          ? { ...bet, amount: Number(amount) }
          : bet
      )
    );
  };

  const clearBetslip = () => {
    setBetslips([]);
  };

  return (
    <BetslipContext.Provider
      value={{
        betslips,
        addToBetslip,
        removeFromBetslip,
        updateBetAmount,
        clearBetslip,
      }}
    >
      {children}
    </BetslipContext.Provider>
  );
};

export const useBetslip = () => {
  const context = useContext(BetslipContext);
  if (!context) {
    throw new Error('useBetslip must be used within BetslipProvider');
  }
  return context;
};
