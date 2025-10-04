import type { Card as CardType, Player } from '../../types/poker';
import { Card } from '../Card/Card';
import { DealerChip } from '../DealerChip/DealerChip';
import { evaluateHand } from '../../utils/pokerUtils';
import { getPokerPosition, getPositionDisplay, shouldShowDealerChip, getPositionCategory } from '../../utils/positionUtils';
import { formatChipStack, formatBettingAmount } from '../../utils/bettingUtils';
import { useWinningCardsHighlight } from '../../hooks/useWinningCardsHighlight';
import { useGameContext } from '../../hooks/useGameContext';
import "./PlayerHand.scss";

interface PlayerHandProps {
  player: Player;
  showHandRank?: boolean;
  faceDown?: boolean;
  seatIndex: number;
  dealerSeatIndex: number;
  totalPlayers: number;
  isCurrentPlayer?: boolean;
  onCardClick?: (card: CardType, index: number) => void;
}

export function PlayerHand({ 
  player, 
  showHandRank = false, 
  faceDown = false, 
  seatIndex,
  dealerSeatIndex,
  totalPlayers,
  isCurrentPlayer = false,
  onCardClick 
}: PlayerHandProps) {
  const handEvaluation = showHandRank && player.hand.length >= 5 ? evaluateHand(player.hand) : null;
  const isMainPlayer = seatIndex === 0; // Assuming seat 0 is the main player
  const { isCardHighlighted } = useWinningCardsHighlight();
  const { gameSettings } = useGameContext();
  
  // Get poker position for this player
  const pokerPosition = getPokerPosition(seatIndex, dealerSeatIndex, totalPlayers);
  const positionDisplay = getPositionDisplay(pokerPosition);
  const showDealer = shouldShowDealerChip(pokerPosition);
  
  // Get position category for styling
  const positionCategory = getPositionCategory(pokerPosition);

  // Format chip count using the new utility
  const formatChips = (amount: number): string => {
    return formatChipStack(amount, gameSettings.bigBlind, gameSettings.bettingDisplayMode);
  };

  // Format betting amounts
  const formatBet = (amount: number): string => {
    return formatBettingAmount(amount, gameSettings.bigBlind, gameSettings.bettingDisplayMode);
  };

  // Determine player status classes
  const getPlayerClasses = (): string => {
    const classes = ['player-hand'];
    
    if (isMainPlayer) classes.push('player-hand--main');
    if (isCurrentPlayer) classes.push('player-hand--current');
    if (player.hasFolded) classes.push('player-hand--folded');
    if (player.isAllIn) classes.push('player-hand--all-in');
    if (player.isEliminated) classes.push('player-hand--eliminated');
    
    return classes.join(' ');
  };

  return (
    <div className={getPlayerClasses()}>
      {showDealer && <DealerChip />}
      
      {/* Player Status Indicators */}
      <div className="player-status">
        {player.lastAction && (
          <div className={`last-action last-action--${player.lastAction}`}>
            {player.lastAction.toUpperCase()}
          </div>
        )}
      </div>

      <div className="player-info">
        <div className="player-name">
          <span className={`position-badge position-badge--${positionCategory}`}>
            {positionDisplay}
          </span>
          <span className="player-actual-name">{player.name}</span>
          {player.isEliminated && (
            <span className="eliminated-indicator" title="Eliminated">💀</span>
          )}
          {isCurrentPlayer && !player.isEliminated && (
            <span className="current-player-indicator" title="Current Player">●</span>
          )}
        </div>
        
        {/* Last Action Display for Visual Debugging */}
        {player.lastAction && (
          <div className="last-action">
            <span className="action-label">Last:</span>
            <span className={`action-value action-value--${player.lastAction}`}>
              {player.lastAction.toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Debug: Show all-in status */}
        {player.isAllIn && (
          <div className="last-action">
            <span className="action-label">Status:</span>
            <span className="action-value action-value--all_in">
              ALL-IN
            </span>
          </div>
        )}
        
        <div className="player-stats">
          <div className={`chip-count ${player.isEliminated ? 'eliminated' : ''}`}>
            <span className="chip-icon">🪙</span>
            {player.isEliminated ? 'ELIMINATED' : formatChips(player.chips)}
          </div>
          
          {player.currentBet > 0 && (
            <div className="current-bet">
              <span className="bet-label">Bet:</span>
              <span className="bet-amount">{formatBet(player.currentBet)}</span>
            </div>
          )}
          
          {player.totalBetThisRound > 0 && player.totalBetThisRound !== player.currentBet && (
            <div className="total-bet">
              <span className="total-label">Total:</span>
              <span className="total-amount">{formatBet(player.totalBetThisRound)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="player-cards">
        {player.hand.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            faceDown={faceDown}
            onClick={() => onCardClick?.(card, index)}
            isWinningCard={!faceDown && isCardHighlighted(card, player)}
          />
        ))}
        {player.hand.length === 0 && (
          <div className="no-cards">
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
          </div>
        )}
      </div>
      
      {handEvaluation && (
        <div className="hand-rank">
          <span className="hand-rank-icon">🏆</span>
          <span className="hand-rank-text">{handEvaluation.description}</span>
        </div>
      )}
      
      {/* Player Position at Bottom */}
      <div className="player-position-bottom">
        <span className={`position-indicator position-indicator--${positionCategory}`}>
          {positionDisplay}
        </span>
      </div>
    </div>
  );
}