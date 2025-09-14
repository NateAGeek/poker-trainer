import type { Card as CardType } from '../../types/poker';
import { Suit } from '../../types/poker';
import "./Card.scss";

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  highlighted?: boolean;
  isWinningCard?: boolean;
}

export function Card({ card, faceDown = false, onClick, highlighted = false, isWinningCard = false }: CardProps) {
  if (faceDown) {
    return (
      <div className="card card--face-down" onClick={onClick}>
        <div className="card__back">
          <div className="card__pattern">🂠</div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  
  // Build CSS classes for the card
  const cardClasses = [
    'card',
    'card--face-up',
    isRed ? 'card--red' : 'card--black',
    highlighted && 'card--highlighted',
    isWinningCard && 'card--winning'
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      data-testid={`card-${card.rank}-${card.suit}`}
    >
      <div className="card__front">
        {/* Top-left corner */}
        <div className="card__corner card__corner--top-left">
          <span className="card__rank">{card.rank}</span>
          <span className="card__suit">{card.suit}</span>
        </div>
        
        {/* Center large suit */}
        <div className="card__center">
          <span className="card__suit card__suit--large">{card.suit}</span>
        </div>
        
        {/* Bottom-right corner (rotated) */}
        <div className="card__corner card__corner--bottom-right">
          <span className="card__rank">{card.rank}</span>
          <span className="card__suit">{card.suit}</span>
        </div>
      </div>
    </div>
  );
}
