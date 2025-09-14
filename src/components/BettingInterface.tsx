import { useState } from 'react';
import type { PlayerAction } from '../types/poker';
import { PlayerAction as Action } from '../types/poker';

interface BettingInterfaceProps {
  availableActions: PlayerAction[];
  currentBet: number;
  minRaise: number;
  maxBet: number;
  playerChips: number;
  potSize: number;
  onAction: (action: PlayerAction, amount?: number) => void;
  disabled?: boolean;
}

export function BettingInterface({
  availableActions,
  currentBet,
  minRaise,
  maxBet,
  playerChips,
  potSize,
  onAction,
  disabled = false
}: BettingInterfaceProps) {
  const [betAmount, setBetAmount] = useState(minRaise);
  const [showBetSlider, setShowBetSlider] = useState(false);

  const handleAction = (action: PlayerAction) => {
    if (action === Action.BET || action === Action.RAISE) {
      setShowBetSlider(true);
    } else {
      onAction(action);
      setShowBetSlider(false);
    }
  };

  const confirmBet = () => {
    onAction(showBetSlider ? (currentBet > 0 ? Action.RAISE : Action.BET) : Action.CALL, betAmount);
    setShowBetSlider(false);
  };

  const getCallAmount = () => {
    return Math.min(currentBet, playerChips);
  };

  const getPotOdds = () => {
    const callAmount = getCallAmount();
    if (callAmount === 0 || potSize === 0) return 0;
    return ((callAmount / (potSize + callAmount)) * 100).toFixed(1);
  };

  if (showBetSlider) {
    return (
      <div className="betting-interface betting-slider">
        <div className="bet-info">
          <p>Pot: ${potSize} | Your Chips: ${playerChips}</p>
          <p>Current Bet: ${currentBet} | Min Raise: ${minRaise}</p>
        </div>
        
        <div className="bet-amount-section">
          <label htmlFor="bet-slider">Bet Amount: ${betAmount}</label>
          <div className="bet-input-container">
            <input
              id="bet-amount-input"
              type="number"
              min={minRaise}
              max={Math.min(maxBet, playerChips)}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(minRaise, Math.min(Number(e.target.value) || minRaise, Math.min(maxBet, playerChips))))}
              className="bet-amount-input"
              placeholder="Enter amount"
            />
            <input
              id="bet-slider"
              type="range"
              min={minRaise}
              max={Math.min(maxBet, playerChips)}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bet-slider"
            />
          </div>
          <div className="bet-presets">
            <button onClick={() => setBetAmount(Math.min(Math.floor(potSize * 0.5), playerChips))}>
              1/2 Pot
            </button>
            <button onClick={() => setBetAmount(Math.min(potSize, playerChips))}>
              Pot
            </button>
            <button onClick={() => setBetAmount(playerChips)}>
              All-In
            </button>
          </div>
        </div>
        
        <div className="bet-actions">
          <button onClick={confirmBet} className="confirm-bet">
            {currentBet > 0 ? 'Raise' : 'Bet'} ${betAmount}
          </button>
          <button onClick={() => setShowBetSlider(false)} className="cancel-bet">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="betting-interface">
      <div className="pot-info">
        <span>Pot: ${potSize}</span>
        {currentBet > 0 && <span>To Call: ${getCallAmount()}</span>}
        {currentBet > 0 && <span>Pot Odds: {getPotOdds()}%</span>}
      </div>
      
      <div className="action-buttons">
        {availableActions.includes(Action.FOLD) && (
          <button
            onClick={() => handleAction(Action.FOLD)}
            disabled={disabled}
            className="action-btn fold-btn"
          >
            Fold
          </button>
        )}
        
        {availableActions.includes(Action.CHECK) && (
          <button
            onClick={() => handleAction(Action.CHECK)}
            disabled={disabled}
            className="action-btn check-btn"
          >
            Check
          </button>
        )}
        
        {availableActions.includes(Action.CALL) && (
          <button
            onClick={() => handleAction(Action.CALL)}
            disabled={disabled}
            className="action-btn call-btn"
          >
            Call ${getCallAmount()}
          </button>
        )}
        
        {availableActions.includes(Action.BET) && (
          <button
            onClick={() => handleAction(Action.BET)}
            disabled={disabled}
            className="action-btn bet-btn"
          >
            Bet
          </button>
        )}
        
        {availableActions.includes(Action.RAISE) && (
          <button
            onClick={() => handleAction(Action.RAISE)}
            disabled={disabled}
            className="action-btn raise-btn"
          >
            Raise
          </button>
        )}
        
        {playerChips > 0 && (
          <button
            onClick={() => onAction(Action.ALL_IN)}
            disabled={disabled}
            className="action-btn all-in-btn"
          >
            All-In ${playerChips}
          </button>
        )}
      </div>
    </div>
  );
}
