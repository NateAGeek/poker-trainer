import type { Card, HandEvaluation } from '../types/poker';
import { Suit, Rank, HandRanking } from '../types/poker';

// Create a standard deck of 52 cards
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits = Object.values(Suit);
  const ranks = Object.values(Rank);

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        id: `${rank}_${suit}`
      });
    }
  }

  return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal cards from the deck
export function dealCards(deck: Card[], count: number): { dealtCards: Card[], remainingDeck: Card[] } {
  const dealtCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { dealtCards, remainingDeck };
}

// Get numerical value of a rank for comparison
export function getRankValue(rank: Rank): number {
  switch (rank) {
    case Rank.TWO: return 2;
    case Rank.THREE: return 3;
    case Rank.FOUR: return 4;
    case Rank.FIVE: return 5;
    case Rank.SIX: return 6;
    case Rank.SEVEN: return 7;
    case Rank.EIGHT: return 8;
    case Rank.NINE: return 9;
    case Rank.TEN: return 10;
    case Rank.JACK: return 11;
    case Rank.QUEEN: return 12;
    case Rank.KING: return 13;
    case Rank.ACE: return 14;
  }
}

// Check if cards form a straight
function isStraight(ranks: number[]): boolean {
  const sorted = [...ranks].sort((a, b) => a - b);
  
  // Check for regular straight
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i-1] + 1) {
      // Check for ace-low straight (A,2,3,4,5)
      if (sorted.join(',') === '2,3,4,5,14') {
        return true;
      }
      return false;
    }
  }
  return true;
}

// Check if cards form a flush
function isFlush(suits: Suit[]): boolean {
  return suits.every(suit => suit === suits[0]);
}

// Count occurrences of each rank
function countRanks(ranks: Rank[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const rank of ranks) {
    counts.set(rank, (counts.get(rank) || 0) + 1);
  }
  return counts;
}

// Generate all possible 5-card combinations from a set of cards
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  
  return [...withFirst, ...withoutFirst];
}

// Evaluate a specific 5-card hand
function evaluateFiveCardHand(hand: Card[]): HandEvaluation {
  if (hand.length !== 5) {
    throw new Error('evaluateFiveCardHand requires exactly 5 cards');
  }

  const ranks = hand.map(card => card.rank);
  const suits = hand.map(card => card.suit);
  const rankValues = ranks.map(getRankValue);
  const rankCounts = countRanks(ranks);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

  const straight = isStraight(rankValues);
  const flush = isFlush(suits);

  // Royal Flush
  if (straight && flush && Math.min(...rankValues) === 10) {
    return {
      ranking: HandRanking.ROYAL_FLUSH,
      description: 'Royal Flush',
      cards: hand
    };
  }

  // Straight Flush
  if (straight && flush) {
    return {
      ranking: HandRanking.STRAIGHT_FLUSH,
      description: 'Straight Flush',
      cards: hand
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return {
      ranking: HandRanking.FOUR_OF_A_KIND,
      description: 'Four of a Kind',
      cards: hand
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      ranking: HandRanking.FULL_HOUSE,
      description: 'Full House',
      cards: hand
    };
  }

  // Flush
  if (flush) {
    return {
      ranking: HandRanking.FLUSH,
      description: 'Flush',
      cards: hand
    };
  }

  // Straight
  if (straight) {
    return {
      ranking: HandRanking.STRAIGHT,
      description: 'Straight',
      cards: hand
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return {
      ranking: HandRanking.THREE_OF_A_KIND,
      description: 'Three of a Kind',
      cards: hand
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      ranking: HandRanking.TWO_PAIR,
      description: 'Two Pair',
      cards: hand
    };
  }

  // Pair
  if (counts[0] === 2) {
    return {
      ranking: HandRanking.PAIR,
      description: 'Pair',
      cards: hand
    };
  }

  // High Card
  return {
    ranking: HandRanking.HIGH_CARD,
    description: 'High Card',
    cards: hand
  };
}

// Compare two hand evaluations to determine which is better
// Returns: positive if hand1 is better, negative if hand2 is better, 0 if tie
function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  // Higher ranking wins
  if (hand1.ranking !== hand2.ranking) {
    return hand1.ranking - hand2.ranking;
  }
  
  // Same ranking - need to compare high cards/kickers
  // For now, we'll do a simplified comparison by comparing the highest card values
  const hand1Values = hand1.cards.map(card => getRankValue(card.rank)).sort((a, b) => b - a);
  const hand2Values = hand2.cards.map(card => getRankValue(card.rank)).sort((a, b) => b - a);
  
  // Compare each card from highest to lowest
  for (let i = 0; i < Math.min(hand1Values.length, hand2Values.length); i++) {
    if (hand1Values[i] !== hand2Values[i]) {
      return hand1Values[i] - hand2Values[i];
    }
  }
  
  // If all compared cards are equal, it's a true tie
  return 0;
}

// Evaluate the best 5-card hand from up to 7 cards
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    return {
      ranking: HandRanking.HIGH_CARD,
      description: 'High Card',
      cards: cards
    };
  }

  // If exactly 5 cards, evaluate directly
  if (cards.length === 5) {
    return evaluateFiveCardHand(cards);
  }

  // For more than 5 cards, find the best possible 5-card combination
  const allCombinations = getCombinations(cards, 5);
  let bestHand: HandEvaluation | null = null;

  for (const combination of allCombinations) {
    const evaluation = evaluateFiveCardHand(combination);
    
    if (!bestHand || compareHands(evaluation, bestHand) > 0) {
      bestHand = evaluation;
    }
  }

  return bestHand!;
}
