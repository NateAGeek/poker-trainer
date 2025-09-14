import { evaluateHand, getRankValue } from './src/utils/pokerUtils';
import type { Card } from './src/types/poker';
import { Suit, Rank } from './src/types/poker';

// Helper function to create a card
function createCard(rank: Rank, suit: Suit): Card {
  return {
    rank,
    suit,
    id: `${rank}_${suit}`
  };
}

console.log('=== Testing Hand Comparison ===');

// Player 1: Flush (high)
const player1Cards: Card[] = [
  createCard(Rank.ACE, Suit.HEARTS),
  createCard(Rank.KING, Suit.HEARTS),
  createCard(Rank.QUEEN, Suit.HEARTS),
  createCard(Rank.JACK, Suit.HEARTS),
  createCard(Rank.NINE, Suit.HEARTS),
  createCard(Rank.TWO, Suit.SPADES),
  createCard(Rank.THREE, Suit.CLUBS)
];

// Player 2: Pair of Aces
const player2Cards: Card[] = [
  createCard(Rank.ACE, Suit.SPADES),
  createCard(Rank.ACE, Suit.CLUBS),
  createCard(Rank.KING, Suit.DIAMONDS),
  createCard(Rank.QUEEN, Suit.HEARTS),
  createCard(Rank.JACK, Suit.SPADES),
  createCard(Rank.TWO, Suit.SPADES),
  createCard(Rank.THREE, Suit.CLUBS)
];

const player1Result = evaluateHand(player1Cards);
const player2Result = evaluateHand(player2Cards);

console.log('Player 1 (Flush):', player1Result.description, 'Ranking:', player1Result.ranking);
console.log('Player 1 cards:', player1Result.cards.map(c => `${c.rank}${c.suit}`));

console.log('Player 2 (Pair):', player2Result.description, 'Ranking:', player2Result.ranking);
console.log('Player 2 cards:', player2Result.cards.map(c => `${c.rank}${c.suit}`));

console.log('Player 1 ranking > Player 2 ranking:', player1Result.ranking > player2Result.ranking);
console.log('Player 1 should win:', player1Result.ranking > player2Result.ranking ? '✅' : '❌');

console.log('');
console.log('=== Testing Same Ranking Comparison ===');

// Two different pairs
const pair1Cards: Card[] = [
  createCard(Rank.ACE, Suit.SPADES),
  createCard(Rank.ACE, Suit.CLUBS),
  createCard(Rank.KING, Suit.DIAMONDS),
  createCard(Rank.QUEEN, Suit.HEARTS),
  createCard(Rank.JACK, Suit.SPADES)
];

const pair2Cards: Card[] = [
  createCard(Rank.KING, Suit.SPADES),
  createCard(Rank.KING, Suit.CLUBS),
  createCard(Rank.QUEEN, Suit.DIAMONDS),
  createCard(Rank.JACK, Suit.HEARTS),
  createCard(Rank.TEN, Suit.SPADES)
];

const pair1Result = evaluateHand(pair1Cards);
const pair2Result = evaluateHand(pair2Cards);

console.log('Pair 1 (Aces):', pair1Result.description);
console.log('Pair 1 cards:', pair1Result.cards.map(c => `${c.rank}${c.suit}`));

console.log('Pair 2 (Kings):', pair2Result.description);
console.log('Pair 2 cards:', pair2Result.cards.map(c => `${c.rank}${c.suit}`));

console.log('Both have same ranking:', pair1Result.ranking === pair2Result.ranking);

// Compare high cards
const pair1Values = pair1Result.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
const pair2Values = pair2Result.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);

console.log('Pair 1 values:', pair1Values);
console.log('Pair 2 values:', pair2Values);

let winner = null;
for (let i = 0; i < Math.min(pair1Values.length, pair2Values.length); i++) {
  if (pair1Values[i] !== pair2Values[i]) {
    winner = pair1Values[i] > pair2Values[i] ? 'Pair 1' : 'Pair 2';
    break;
  }
}

console.log('Winner should be Pair 1 (Aces):', winner === 'Pair 1' ? '✅' : '❌');