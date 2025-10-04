import React, { useState, useCallback, useMemo } from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { formatBettingAmount } from '../../utils/bettingUtils';
import './BettingInterface.scss';

export interface BettingInterfaceProps {
  onAction: (action: string, amount?: number) => void;
}

export const BettingInterface: React.FC<BettingInterfaceProps> = ({ onAction }) => {
  const { gameState, gameSettings } = useGameContext();
  const [customAmount, setCustomAmount] = useState<number>(0);

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const potSize = gameState.pot;
  
  // Calculate betting values based on current betting round
  const highestBet = Math.max(...gameState.players.map(p => p.currentBet));
  const callAmount = Math.max(0, highestBet - (currentPlayer?.currentBet || 0));
  const minRaise = Math.max(highestBet + gameState.bettingRound.minRaise, gameState.blinds.bigBlind);
  const maxBet = currentPlayer?.chips || 0;

  // Calculate available actions
  const canCheck = callAmount === 0;
  const canCall = callAmount > 0 && callAmount <= maxBet;
  const canBet = highestBet === 0 && maxBet >= gameState.blinds.bigBlind;
  const canRaise = highestBet > 0 && maxBet >= minRaise;

  // Calculate pot odds for educational purposes
  const potOdds = useMemo(() => {
    if (callAmount === 0) return null;
    const totalPot = potSize + callAmount;
    const odds = ((callAmount / totalPot) * 100).toFixed(1);
    return `${odds}%`;
  }, [potSize, callAmount]);

  // Betting presets as percentage of pot
  const bettingPresets = useMemo(() => {
    const minBetAmount = canBet ? gameState.blinds.bigBlind : minRaise;
    return [
      { label: '1/4 Pot', amount: Math.floor(potSize * 0.25) },
      { label: '1/2 Pot', amount: Math.floor(potSize * 0.5) },
      { label: '3/4 Pot', amount: Math.floor(potSize * 0.75) },
      { label: 'Pot', amount: potSize },
      { label: '1.5x Pot', amount: Math.floor(potSize * 1.5) },
    ].filter(preset => preset.amount <= maxBet && preset.amount >= minBetAmount);
  }, [potSize, maxBet, minRaise, canBet, gameState.blinds.bigBlind]);

  const handleAction = useCallback((action: string, amount?: number) => {
    onAction(action, amount);
    setCustomAmount(0);
  }, [onAction]);

  const formatChips = (amount: number): string => {
    return formatBettingAmount(amount, gameSettings.bigBlind, gameSettings.bettingDisplayMode);
  };

  return (
    <div className="betting-interface">
      {/* Pot Information */}
      <div className="pot-info">
        <span>Pot: {formatChips(potSize)}</span>
        {callAmount > 0 && <span>To Call: {formatChips(callAmount)}</span>}
        {potOdds && <span>Pot Odds: {potOdds}</span>}
      </div>

      {/* Betting Amount Controls */}
      {(canBet || canRaise) && (
        <div className="betting-controls">
          <div className="preset-buttons">
            {bettingPresets.map((preset) => (
              <button
                key={preset.label}
                className={`preset-btn ${customAmount === preset.amount ? 'active' : ''}`}
                onClick={() => setCustomAmount(preset.amount)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="amount-controls">
            <input
              type="range"
              min={minRaise}
              max={maxBet}
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              className="bet-slider"
              aria-label="Bet amount slider"
            />
            <input
              type="number"
              min={minRaise}
              max={maxBet}
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              className="amount-input"
              placeholder="Amount"
              aria-label="Bet amount input"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn fold-btn"
          onClick={() => handleAction('fold')}
        >
          Fold
        </button>

        {canCheck && (
          <button
            className="action-btn check-btn"
            onClick={() => handleAction('check')}
          >
            Check
          </button>
        )}

        {canCall && (
          <button
            className="action-btn call-btn"
            onClick={() => handleAction('call')}
          >
            Call {formatChips(callAmount)}
          </button>
        )}

        {canBet && (
          <button
            className="action-btn bet-btn"
            onClick={() => handleAction('bet', customAmount)}
            disabled={customAmount < gameState.blinds.bigBlind}
          >
            Bet {customAmount > 0 ? formatChips(customAmount) : ''}
          </button>
        )}

        {canRaise && (
          <button
            className="action-btn raise-btn"
            onClick={() => handleAction('raise', customAmount)}
            disabled={customAmount < minRaise}
          >
            Raise {customAmount > 0 ? formatChips(customAmount) : ''}
          </button>
        )}

        <button
          className="action-btn all-in-btn"
          onClick={() => handleAction('all_in')}
          disabled={maxBet === 0}
        >
          All-In {formatChips(maxBet)}
        </button>
      </div>
    </div>
  );
};
