import type { Card as CardType } from '../types/poker';
import { Card } from './Card';
import { evaluateHand } from '../utils/pokerUtils';

interface HandProps {
  cards: CardType[];
  label?: string;
  showHandRank?: boolean;
  faceDown?: boolean;
  onCardClick?: (card: CardType, index: number) => void;
}

export function Hand({ cards, label, showHandRank = false, faceDown = false, onCardClick }: HandProps) {
  const handEvaluation = showHandRank && cards.length >= 5 ? evaluateHand(cards) : null;

  return (
    <div className="hand">
      {label && <div className="hand-label">{label}</div>}
      <div className="hand-cards">
        {cards.map((card, index) => (
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
