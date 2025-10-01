import { PlayerHand } from '../PlayerHand/PlayerHand';
import type { Player } from '../../types/poker';

interface TablePlayerProps {
  player: Player;
  index: number;
  seatIndex: number;
  position?: { x: number; y: number };
  dealerSeatIndex: number;
  totalPlayers: number;
  isCurrentPlayer: boolean;
  faceDown: boolean;
  showHandRank: boolean;
}

export function TablePlayer({
  player,
  index,
  seatIndex,
  position,
  dealerSeatIndex,
  totalPlayers,
  isCurrentPlayer,
  faceDown,
  showHandRank
}: TablePlayerProps) {
  const style = position ? {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)'
  } : {};

  return (
    <div 
      className="player-seat"
      data-seat={seatIndex}
      style={style}
    >
      <div className="player-content">
        <PlayerHand
          player={player}
          seatIndex={index}
          dealerSeatIndex={dealerSeatIndex}
          totalPlayers={totalPlayers}
          isCurrentPlayer={isCurrentPlayer}
          faceDown={faceDown}
          showHandRank={showHandRank}
        />
      </div>
    </div>
  );
}