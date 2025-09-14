import type { Card as CardType, Player } from '../types/poker';
import { Card } from './Card';
import { DealerChip } from './DealerChip';
import { evaluateHand } from '../utils/pokerUtils';
import { getPokerPosition, getPositionDisplay, shouldShowDealerChip, getPositionCategory } from '../utils/positionUtils';

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
  
  // Get poker position for this player
  const pokerPosition = getPokerPosition(seatIndex, dealerSeatIndex, totalPlayers);
  const positionDisplay = getPositionDisplay(pokerPosition);
  const showDealer = shouldShowDealerChip(pokerPosition);
  
  // Get position category for styling
  const positionCategory = getPositionCategory(pokerPosition);

  return (
    <div className={`player-hand ${isMainPlayer ? 'main-player' : 'opponent'} ${isCurrentPlayer ? 'current-player' : ''}`}>
      {showDealer && <DealerChip />}
      <div className="player-info">
        <div className="player-name">
          <span className={`position-badge position-${positionCategory}`}>{positionDisplay}</span>
          <span className="player-actual-name">{player.name}</span>
          {isCurrentPlayer && <span className="current-player-indicator">●</span>}
        </div>
        <div className="player-chips">{player.chips} chips</div>
        {player.currentBet > 0 && (
          <div className="player-bet">Bet: ${player.currentBet}</div>
        )}
      </div>
      
      <div className="player-cards">
        {player.hand.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            faceDown={faceDown}
            onClick={() => onCardClick?.(card, index)}
          />
        ))}
      </div>
      
      {handEvaluation && (
        <div className="hand-rank">
          {handEvaluation.description}
        </div>
      )}
    </div>
  );
}