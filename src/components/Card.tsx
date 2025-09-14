import type { Card as CardType } from '../types/poker';
import { Suit } from '../types/poker';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  onClick?: () => void;
}

export function Card({ card, faceDown = false, onClick }: CardProps) {
  if (faceDown) {
    return (
      <div className="card card-back" onClick={onClick}>
        <div className="card-pattern">🂠</div>
      </div>
    );
  }

  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  
  return (
    <div 
      className={`card card-front ${isRed ? 'red' : 'black'}`} 
      onClick={onClick}
      data-testid={`card-${card.rank}-${card.suit}`}
    >
      <div className="card-top">
        <span className="rank">{card.rank}</span>
        <span className="suit">{card.suit}</span>
      </div>
      <div className="card-center">
        <span className="suit-large">{card.suit}</span>
      </div>
      <div className="card-bottom">
        <span className="rank rotated">{card.rank}</span>
        <span className="suit rotated">{card.suit}</span>
      </div>
    </div>
  );
}
