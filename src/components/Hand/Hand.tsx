import type { Card as CardType, Player } from '../../types/poker';
import { Card } from '../Card/Card';
import { evaluateHand } from '../../utils/pokerUtils';
import { useState, useEffect } from 'react';
import { useWinningCardsHighlight } from '../../hooks/useWinningCardsHighlight';
import "./Hand.scss";

interface HandProps {
  cards: CardType[];
  label?: string;
  showHandRank?: boolean;
  faceDown?: boolean;
  onCardClick?: (card: CardType, index: number) => void;
  player?: Player; // Optional player for determining winning card highlights
}

export function Hand({ cards, label, showHandRank = false, faceDown = false, onCardClick, player }: HandProps) {
  const handEvaluation = showHandRank && cards.length >= 5 ? evaluateHand(cards) : null;
  const { isCardHighlighted, isCommunityCardHighlighted } = useWinningCardsHighlight();
  
  // Determine if this is a community hand based on the label
  const isCommunityHand = label?.toLowerCase().includes('community');
  const handClass = isCommunityHand ? 'hand hand--community' : 'hand';
  const cardsClass = isCommunityHand ? 'hand-cards community-cards' : 'hand-cards';

  // Animation state for community cards
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const [previousCardCount, setPreviousCardCount] = useState(cards.length);

  // Track when new community cards are added for animation
  useEffect(() => {
    if (isCommunityHand && cards.length > previousCardCount) {
      const newCardIds = new Set<string>();
      
      // Add new cards to animation set
      for (let i = previousCardCount; i < cards.length; i++) {
        if (cards[i]) {
          newCardIds.add(cards[i].id);
        }
      }
      
      setAnimatingCards(newCardIds);
      
      // Add haptic feedback for mobile devices
      if (navigator.vibrate && cards.length - previousCardCount === 3) {
        // Vibrate for flop (3 cards)
        navigator.vibrate([50, 100, 50, 100, 50]);
      } else if (navigator.vibrate) {
        // Single vibration for turn/river
        navigator.vibrate(30);
      }
      
      // Clear animation state after animation completes
      const timeout = setTimeout(() => {
        setAnimatingCards(new Set());
      }, 1500); // Total animation duration including stagger
      
      setPreviousCardCount(cards.length);
      
      return () => clearTimeout(timeout);
    } else if (cards.length < previousCardCount) {
      // Handle card count decrease (new hand)
      setPreviousCardCount(cards.length);
      setAnimatingCards(new Set());
    }
  }, [cards, previousCardCount, isCommunityHand]);

  // Get animation class for a card
  const getCardAnimationClass = (card: CardType, index: number): string => {
    if (!isCommunityHand || !animatingCards.has(card.id)) return '';
    
    // For flop cards (indices 0, 1, 2), stagger the animation
    if (index < 3) {
      return `card-dealing card-dealing--flop card-dealing--delay-${index}`;
    }
    // For turn and river, single card animation
    return 'card-dealing card-dealing--single';
  };

  return (
    <div className={handClass}>
      {label && <div className="hand-label">{label}</div>}
      <div className={`${cardsClass} ${animatingCards.size > 0 ? 'dealing-cards' : ''}`}>
        {cards.map((card, index) => {
          // Determine if this card should be highlighted
          const shouldHighlight = isCommunityHand 
            ? isCommunityCardHighlighted(card)
            : player ? isCardHighlighted(card, player) : false;
            
          return (
            <div 
              key={card.id} 
              className={`card-wrapper ${getCardAnimationClass(card, index)}`}
            >
              <Card
                card={card}
                faceDown={faceDown}
                onClick={() => onCardClick?.(card, index)}
                isWinningCard={shouldHighlight}
              />
            </div>
          );
        })}
      </div>
      {handEvaluation && (
        <div className="hand-rank">
          {handEvaluation.description}
        </div>
      )}
    </div>
  );
}
