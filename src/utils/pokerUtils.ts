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
      cards: hand,
      winningCards: hand // All cards contribute to royal flush
    };
  }

  // Straight Flush
  if (straight && flush) {
    return {
      ranking: HandRanking.STRAIGHT_FLUSH,
      description: 'Straight Flush',
      cards: hand,
      winningCards: hand // All cards contribute to straight flush
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    const fourOfAKindRank = Array.from(rankCounts.entries()).find(([, count]) => count === 4)?.[0];
    const winningCards = hand.filter(card => card.rank === fourOfAKindRank);
    return {
      ranking: HandRanking.FOUR_OF_A_KIND,
      description: 'Four of a Kind',
      cards: hand,
      winningCards
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const threeOfAKindRank = Array.from(rankCounts.entries()).find(([, count]) => count === 3)?.[0];
    const pairRank = Array.from(rankCounts.entries()).find(([, count]) => count === 2)?.[0];
    const winningCards = hand.filter(card => card.rank === threeOfAKindRank || card.rank === pairRank);
    return {
      ranking: HandRanking.FULL_HOUSE,
      description: 'Full House',
      cards: hand,
      winningCards
    };
  }

  // Flush
  if (flush) {
    return {
      ranking: HandRanking.FLUSH,
      description: 'Flush',
      cards: hand,
      winningCards: hand // All cards contribute to flush
    };
  }

  // Straight
  if (straight) {
    return {
      ranking: HandRanking.STRAIGHT,
      description: 'Straight',
      cards: hand,
      winningCards: hand // All cards contribute to straight
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    const threeOfAKindRank = Array.from(rankCounts.entries()).find(([, count]) => count === 3)?.[0];
    const winningCards = hand.filter(card => card.rank === threeOfAKindRank);
    return {
      ranking: HandRanking.THREE_OF_A_KIND,
      description: 'Three of a Kind',
      cards: hand,
      winningCards
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairRanks = Array.from(rankCounts.entries())
      .filter(([, count]) => count === 2)
      .map(([rank]) => rank);
    const winningCards = hand.filter(card => pairRanks.includes(card.rank));
    return {
      ranking: HandRanking.TWO_PAIR,
      description: 'Two Pair',
      cards: hand,
      winningCards
    };
  }

  // Pair
  if (counts[0] === 2) {
    const pairRank = Array.from(rankCounts.entries()).find(([, count]) => count === 2)?.[0];
    const winningCards = hand.filter(card => card.rank === pairRank);
    return {
      ranking: HandRanking.PAIR,
      description: 'Pair',
      cards: hand,
      winningCards
    };
  }

  // High Card - just the highest card
  const highestCard = hand.reduce((highest, card) => 
    getRankValue(card.rank) > getRankValue(highest.rank) ? card : highest
  );
  
  return {
    ranking: HandRanking.HIGH_CARD,
    description: 'High Card',
    cards: hand,
    winningCards: [highestCard]
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

// Calculate hand strength as a percentage (0-100)
// This gives a relative strength of the hand based on ranking and high cards
export function calculateHandStrength(cards: Card[]): { strength: number; explanation: string } {
  if (cards.length < 2) {
    return { 
      strength: 0, 
      explanation: "Insufficient cards to calculate hand strength" 
    };
  }

  const evaluation = evaluateHand(cards);
  const { ranking, cards: handCards } = evaluation;
  
  // Base strength based on hand ranking (out of 10 levels)
  let baseStrength = 0;
  let strengthDescription = "";
  
  switch (ranking) {
    case HandRanking.ROYAL_FLUSH:
      baseStrength = 100;
      strengthDescription = "Royal Flush - The strongest possible hand";
      break;
    case HandRanking.STRAIGHT_FLUSH:
      baseStrength = 95;
      strengthDescription = "Straight Flush - Five consecutive cards of the same suit";
      break;
    case HandRanking.FOUR_OF_A_KIND:
      baseStrength = 90;
      strengthDescription = "Four of a Kind - Four cards of the same rank";
      break;
    case HandRanking.FULL_HOUSE:
      baseStrength = 85;
      strengthDescription = "Full House - Three of a kind plus a pair";
      break;
    case HandRanking.FLUSH:
      baseStrength = 75;
      strengthDescription = "Flush - Five cards of the same suit";
      break;
    case HandRanking.STRAIGHT:
      baseStrength = 65;
      strengthDescription = "Straight - Five consecutive cards";
      break;
    case HandRanking.THREE_OF_A_KIND:
      baseStrength = 55;
      strengthDescription = "Three of a Kind - Three cards of the same rank";
      break;
    case HandRanking.TWO_PAIR:
      baseStrength = 35;
      strengthDescription = "Two Pair - Two different pairs";
      break;
    case HandRanking.PAIR:
      baseStrength = 20;
      strengthDescription = "One Pair - Two cards of the same rank";
      break;
    case HandRanking.HIGH_CARD:
      baseStrength = 5;
      strengthDescription = "High Card - No pairs or better";
      break;
  }
  
  // Add kicker strength for more precise calculation
  if (handCards && handCards.length >= 1) {
    const highCard = handCards.reduce((highest, card) => 
      getRankValue(card.rank) > getRankValue(highest.rank) ? card : highest
    );
    const kickerBonus = (getRankValue(highCard.rank) - 2) / 12 * 5; // 0-5 bonus based on high card
    baseStrength = Math.min(100, baseStrength + kickerBonus);
  }
  
  const explanation = `${strengthDescription}. Hand strength is calculated based on poker hand rankings with kicker adjustments. ${evaluation.description} with ${handCards?.map(c => `${c.rank}${c.suit}`).join(', ') || 'cards shown'}.`;
  
  return { 
    strength: Math.round(baseStrength * 10) / 10, // Round to 1 decimal place
    explanation 
  };
}
