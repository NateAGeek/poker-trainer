import { describe, it, expect } from 'vitest';
import { evaluateHand, getRankValue } from './pokerUtils';
import type { Card } from '../types/poker';
import { HandRanking, Suit, Rank } from '../types/poker';

// Helper function to create a card
function createCard(rank: Rank, suit: Suit): Card {
  return {
    rank,
    suit,
    id: `${rank}_${suit}`
  };
}

describe('evaluateHand', () => {
  describe('Basic hand rankings with exactly 5 cards', () => {
    it('should identify a royal flush', () => {
      const cards: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.TEN, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.ROYAL_FLUSH);
      expect(result.description).toBe('Royal Flush');
    });

    it('should identify a straight flush', () => {
      const cards: Card[] = [
        createCard(Rank.NINE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.CLUBS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.STRAIGHT_FLUSH);
      expect(result.description).toBe('Straight Flush');
    });

    it('should identify four of a kind', () => {
      const cards: Card[] = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.SPADES),
        createCard(Rank.TWO, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.FOUR_OF_A_KIND);
      expect(result.description).toBe('Four of a Kind');
    });

    it('should identify a full house', () => {
      const cards: Card[] = [
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.KING, Suit.CLUBS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.FULL_HOUSE);
      expect(result.description).toBe('Full House');
    });

    it('should identify a flush', () => {
      const cards: Card[] = [
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.NINE, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.FIVE, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.FLUSH);
      expect(result.description).toBe('Flush');
    });

    it('should identify a straight', () => {
      const cards: Card[] = [
        createCard(Rank.FIVE, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.THREE, Suit.DIAMONDS),
        createCard(Rank.TWO, Suit.SPADES),
        createCard(Rank.ACE, Suit.HEARTS) // Ace-low straight
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.STRAIGHT);
      expect(result.description).toBe('Straight');
    });

    it('should identify three of a kind', () => {
      const cards: Card[] = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.TWO, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.THREE_OF_A_KIND);
      expect(result.description).toBe('Three of a Kind');
    });

    it('should identify two pair', () => {
      const cards: Card[] = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.TWO, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.TWO_PAIR);
      expect(result.description).toBe('Two Pair');
    });

    it('should identify a pair', () => {
      const cards: Card[] = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.NINE, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.TWO, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.PAIR);
      expect(result.description).toBe('Pair');
    });

    it('should identify high card', () => {
      const cards: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.NINE, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.TWO, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.HIGH_CARD);
      expect(result.description).toBe('High Card');
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle less than 5 cards', () => {
      const cards: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.CLUBS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.HIGH_CARD);
    });

    it('should identify ace-low straight (A-2-3-4-5)', () => {
      const cards: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.TWO, Suit.CLUBS),
        createCard(Rank.THREE, Suit.DIAMONDS),
        createCard(Rank.FOUR, Suit.SPADES),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.STRAIGHT);
    });

    it('should identify ace-high straight (10-J-Q-K-A)', () => {
      const cards: Card[] = [
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.QUEEN, Suit.DIAMONDS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.ACE, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.STRAIGHT);
    });
  });

  describe('7-card hand evaluation (the main issue)', () => {
    it('should find three of a kind with JS JC JH in 7 cards', () => {
      // Your specific scenario: JS JC in hole cards, JH on board
      const cards: Card[] = [
        // Hole cards
        createCard(Rank.JACK, Suit.SPADES),
        createCard(Rank.JACK, Suit.CLUBS),
        // Community cards
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.SPADES),
        createCard(Rank.TEN, Suit.CLUBS),
        createCard(Rank.FOUR, Suit.HEARTS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.THREE_OF_A_KIND);
      expect(result.description).toBe('Three of a Kind');
    });

    it('should find the best hand from 7 cards when multiple hands are possible', () => {
      const cards: Card[] = [
        // Could make flush (5 hearts) or pair
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.ACE, Suit.CLUBS), // Pair of aces
        createCard(Rank.TWO, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      // Should find royal flush, not just a pair of aces
      expect(result.ranking).toBe(HandRanking.ROYAL_FLUSH);
    });

    it('should find full house from 7 cards with multiple pairs and trips', () => {
      const cards: Card[] = [
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.KING, Suit.CLUBS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.JACK, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      // Should find best full house (KKK over QQ or JJ)
      expect(result.ranking).toBe(HandRanking.FULL_HOUSE);
    });

    it('should find best straight from 7 cards', () => {
      const cards: Card[] = [
        createCard(Rank.FIVE, Suit.HEARTS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.TEN, Suit.CLUBS),
        createCard(Rank.ACE, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      // Should find the highest straight (6-7-8-9-10), not lower ones
      expect(result.ranking).toBe(HandRanking.STRAIGHT);
    });

    it('should find four of a kind from 7 cards', () => {
      const cards: Card[] = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.FOUR_OF_A_KIND);
    });
  });

  describe('Real-world poker scenarios', () => {
    it('should handle board pair with pocket pair (two pair)', () => {
      const cards: Card[] = [
        // Pocket pair
        createCard(Rank.EIGHT, Suit.HEARTS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        // Board with pair
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.SEVEN, Suit.HEARTS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.TWO, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.TWO_PAIR);
    });

    it('should handle pocket pair that makes full house with board trips', () => {
      const cards: Card[] = [
        // Pocket pair
        createCard(Rank.EIGHT, Suit.HEARTS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        // Board with trips
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.TWO, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.FULL_HOUSE);
    });

    it('should handle trips on board with pocket pair (full house)', () => {
      const cards: Card[] = [
        // Pocket pair
        createCard(Rank.SEVEN, Suit.HEARTS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        // Board with trips
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.TWO, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      expect(result.ranking).toBe(HandRanking.FULL_HOUSE);
    });

    it('should handle multiple flush possibilities', () => {
      const cards: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.TWO, Suit.DIAMONDS)
      ];
      
      const result = evaluateHand(cards);
      // Should find flush, not just high card
      expect(result.ranking).toBe(HandRanking.FLUSH);
    });
  });

  describe('Hand comparison and winner determination', () => {
    it('should correctly identify flush beats pair', () => {
      const flushHand: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const pairHand: Card[] = [
        createCard(Rank.ACE, Suit.SPADES),
        createCard(Rank.ACE, Suit.CLUBS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.SPADES)
      ];
      
      const flushResult = evaluateHand(flushHand);
      const pairResult = evaluateHand(pairHand);
      
      expect(flushResult.ranking).toBe(HandRanking.FLUSH);
      expect(pairResult.ranking).toBe(HandRanking.PAIR);
      expect(flushResult.ranking > pairResult.ranking).toBe(true);
    });

    it('should correctly identify full house beats flush', () => {
      const fullHouseHand: Card[] = [
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.KING, Suit.CLUBS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.HEARTS)
      ];
      
      const flushHand: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const fullHouseResult = evaluateHand(fullHouseHand);
      const flushResult = evaluateHand(flushHand);
      
      expect(fullHouseResult.ranking).toBe(HandRanking.FULL_HOUSE);
      expect(flushResult.ranking).toBe(HandRanking.FLUSH);
      expect(fullHouseResult.ranking > flushResult.ranking).toBe(true);
    });

    it('should correctly identify straight flush beats four of a kind', () => {
      const straightFlushHand: Card[] = [
        createCard(Rank.NINE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.CLUBS)
      ];
      
      const fourOfAKindHand: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.ACE, Suit.CLUBS),
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.ACE, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const straightFlushResult = evaluateHand(straightFlushHand);
      const fourOfAKindResult = evaluateHand(fourOfAKindHand);
      
      expect(straightFlushResult.ranking).toBe(HandRanking.STRAIGHT_FLUSH);
      expect(fourOfAKindResult.ranking).toBe(HandRanking.FOUR_OF_A_KIND);
      expect(straightFlushResult.ranking > fourOfAKindResult.ranking).toBe(true);
    });

    it('should demonstrate current issue with winner calculation in 7-card scenario', () => {
      // Player 1: Flush (not straight flush)
      const player1Cards: Card[] = [
        createCard(Rank.TWO, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.HEARTS),
        createCard(Rank.SEVEN, Suit.HEARTS),
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.ACE, Suit.CLUBS)
      ];
      
      // Player 2: Pair of Kings
      const player2Cards: Card[] = [
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.ACE, Suit.CLUBS)
      ];
      
      const player1Result = evaluateHand(player1Cards);
      const player2Result = evaluateHand(player2Cards);
      
      expect(player1Result.ranking).toBe(HandRanking.FLUSH);
      expect(player2Result.ranking).toBe(HandRanking.PAIR);
      
      // Player 1 should win (flush > pair)
      expect(player1Result.ranking > player2Result.ranking).toBe(true);
    });

    it('should correctly determine winner between hands of same ranking', () => {
      // Pair of Aces vs Pair of Kings
      const acePairHand: Card[] = [
        createCard(Rank.ACE, Suit.SPADES),
        createCard(Rank.ACE, Suit.CLUBS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.SPADES)
      ];
      
      const kingPairHand: Card[] = [
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.KING, Suit.CLUBS),
        createCard(Rank.QUEEN, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.TEN, Suit.SPADES)
      ];
      
      const aceResult = evaluateHand(acePairHand);
      const kingResult = evaluateHand(kingPairHand);
      
      expect(aceResult.ranking).toBe(HandRanking.PAIR);
      expect(kingResult.ranking).toBe(HandRanking.PAIR);
      
      // Both are pairs, but Aces should have higher card values
      const aceValues = aceResult.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      const kingValues = kingResult.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      
      expect(aceValues[0]).toBe(14); // Ace
      expect(kingValues[0]).toBe(13); // King
      expect(aceValues[0] > kingValues[0]).toBe(true);
    });

    it('should correctly determine winner between different flushes', () => {
      // Ace-high flush vs King-high flush (non-straight)
      const aceFlushHand: Card[] = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.SEVEN, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const kingFlushHand: Card[] = [
        createCard(Rank.KING, Suit.CLUBS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.NINE, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.CLUBS)
      ];
      
      const aceFlushResult = evaluateHand(aceFlushHand);
      const kingFlushResult = evaluateHand(kingFlushHand);
      
      expect(aceFlushResult.ranking).toBe(HandRanking.FLUSH);
      expect(kingFlushResult.ranking).toBe(HandRanking.FLUSH);
      
      // Both are flushes, but Ace-high should win
      const aceValues = aceFlushResult.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      const kingValues = kingFlushResult.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      
      expect(aceValues[0]).toBe(14); // Ace
      expect(kingValues[0]).toBe(13); // King
      expect(aceValues[0] > kingValues[0]).toBe(true);
    });
  });
});