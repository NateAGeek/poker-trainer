// =========================================
// Pot Odds & Break-Even Calculations Tests
// Phase 2 Implementation - Unit Tests
// =========================================

import { describe, it, expect } from 'vitest';
import {
  calculatePotOdds,
  calculateBreakEvenFoldPercent,
  calculateGameStatePotOdds,
  formatPercent,
  formatCurrency,
  validateAccuracy
} from './potOddsUtils';
import type { GameState, Player } from '../types/poker';

describe('Pot Odds Calculations', () => {
  describe('calculatePotOdds', () => {
    it('should calculate basic pot odds correctly', () => {
      // Test case: Pot = 100, Call = 50
      // Expected: 50 / (100 + 50) = 33.33%
      const result = calculatePotOdds(100, 50);
      
      expect(result.pot).toBe(100);
      expect(result.amountToCall).toBe(50);
      expect(result.potAfterCall).toBe(150);
      expect(result.potOddsPercent).toBe(33.33);
      expect(result.breakEvenEquity).toBe(33.33);
      expect(result.potOddsRatio).toBe('2:1');
    });

    it('should handle exact fractions precisely', () => {
      // Test case: Pot = 300, Call = 100
      // Expected: 100 / (300 + 100) = 25%
      const result = calculatePotOdds(300, 100);
      
      expect(result.potOddsPercent).toBe(25.00);
      expect(result.potOddsRatio).toBe('3:1');
    });

    it('should handle small pots accurately', () => {
      // Test case: Pot = 10, Call = 5
      // Expected: 5 / (10 + 5) = 33.33%
      const result = calculatePotOdds(10, 5);
      
      expect(result.potOddsPercent).toBe(33.33);
      expect(validateAccuracy(33.333333, result.potOddsPercent)).toBe(true);
    });

    it('should handle edge case with no call amount', () => {
      const result = calculatePotOdds(100, 0);
      
      expect(result.potOddsPercent).toBe(0);
      expect(result.potOddsRatio).toBe('--');
      expect(result.breakEvenEquity).toBe(0);
    });

    it('should handle reverse odds (call > pot)', () => {
      // Test case: Pot = 50, Call = 100
      // Expected: 100 / (50 + 100) = 66.67%
      const result = calculatePotOdds(50, 100);
      
      expect(result.potOddsPercent).toBe(66.67);
      expect(result.potOddsRatio).toBe('1:2');
    });

    it('should throw error for negative inputs', () => {
      expect(() => calculatePotOdds(-10, 50)).toThrow();
      expect(() => calculatePotOdds(100, -25)).toThrow();
    });
  });

  describe('calculateBreakEvenFoldPercent', () => {
    it('should calculate break-even fold percentage correctly', () => {
      // Test case from requirements: P=60, b=30
      // Expected: 30 / (60 + 30) = 33.33%
      const result = calculateBreakEvenFoldPercent(60, 30);
      
      expect(result).toBe(33.33);
      expect(validateAccuracy(33.333333, result)).toBe(true);
    });

    it('should handle various pot and bet combinations', () => {
      // Test cases with known exact solutions
      expect(calculateBreakEvenFoldPercent(100, 50)).toBe(33.33); // 1/3
      expect(calculateBreakEvenFoldPercent(200, 100)).toBe(33.33); // 1/3
      expect(calculateBreakEvenFoldPercent(100, 100)).toBe(50.00); // 1/2
      expect(calculateBreakEvenFoldPercent(300, 100)).toBe(25.00); // 1/4
    });

    it('should handle edge cases', () => {
      expect(calculateBreakEvenFoldPercent(100, 0)).toBe(0);
      expect(calculateBreakEvenFoldPercent(0, 50)).toBe(100);
    });

    it('should throw error for negative inputs', () => {
      expect(() => calculateBreakEvenFoldPercent(-60, 30)).toThrow();
      expect(() => calculateBreakEvenFoldPercent(60, -30)).toThrow();
    });

    it('should meet accuracy requirements', () => {
      // Test multiple scenarios to ensure ≤0.1% absolute error
      const testCases = [
        { pot: 60, bet: 30, expected: 33.333333 },
        { pot: 150, bet: 75, expected: 33.333333 },
        { pot: 80, bet: 40, expected: 33.333333 },
        { pot: 200, bet: 150, expected: 42.857143 },
        { pot: 45, bet: 15, expected: 25.000000 }
      ];

      testCases.forEach(({ pot, bet, expected }) => {
        const result = calculateBreakEvenFoldPercent(pot, bet);
        expect(validateAccuracy(expected, result)).toBe(true);
      });
    });
  });

  // Helper function for creating test players
  const createPlayer = (id: string, chips: number, currentBet: number = 0, isHuman: boolean = false): Player => ({
    id,
    name: `Player ${id}`,
    chips,
    hand: [],
    currentBet,
    totalBetThisRound: currentBet,
    isHuman,
    hasFolded: false,
    isAllIn: false,
    isDealer: false,
    position: 'early',
    lastAction: undefined
  });

  describe('calculateGameStatePotOdds', () => {

    it('should calculate pot odds from game state correctly', () => {
      const gameState: GameState = {
        players: [
          createPlayer('1', 500, 50, true), // Human player
          createPlayer('2', 500, 100),      // Opponent with higher bet
          createPlayer('3', 400, 0)         // Folded or no bet
        ],
        communityCards: [],
        pot: 100,
        sidePots: [],
        currentPlayer: 0,
        dealerPosition: 0,
        smallBlindPosition: 1,
        bigBlindPosition: 2,
        gamePhase: 'flop',
        bettingRound: {
          phase: 'flop',
          currentPlayer: 0,
          lastRaisePlayer: null,
          minRaise: 10,
          completed: false
        },
        deck: [],
        blinds: { smallBlind: 5, bigBlind: 10 },
        handNumber: 1,
        waitingForPlayerAction: true,
        maxPlayers: 6
      };

      const result = calculateGameStatePotOdds(gameState);
      
      // Pot before highest bet: 100 + 50 + 0 = 150 (pot + non-highest bets)
      // Amount to call: 100 - 50 = 50
      // Pot odds: 50 / (150 + 50) = 25%
      expect(result.amountToCall).toBe(50);
      expect(result.potOddsPercent).toBe(25.00);
      expect(result.breakEvenFoldPercent).toBe(40.00); // 100 / (150 + 100)
    });

    it('should handle no betting scenario', () => {
      const gameState: GameState = {
        players: [
          createPlayer('1', 500, 0, true),
          createPlayer('2', 500, 0)
        ],
        communityCards: [],
        pot: 15,
        sidePots: [],
        currentPlayer: 0,
        dealerPosition: 0,
        smallBlindPosition: 1,
        bigBlindPosition: 2,
        gamePhase: 'preflop',
        bettingRound: {
          phase: 'preflop',
          currentPlayer: 0,
          lastRaisePlayer: null,
          minRaise: 10,
          completed: false
        },
        deck: [],
        blinds: { smallBlind: 5, bigBlind: 10 },
        handNumber: 1,
        waitingForPlayerAction: true,
        maxPlayers: 6
      };

      const result = calculateGameStatePotOdds(gameState);
      
      expect(result.amountToCall).toBe(0);
      expect(result.potOddsPercent).toBe(0);
    });

    it('should handle all-in scenarios', () => {
      const gameState: GameState = {
        players: [
          createPlayer('1', 0, 300, true), // Human all-in
          createPlayer('2', 100, 300)      // Opponent matching
        ],
        communityCards: [],
        pot: 200,
        sidePots: [],
        currentPlayer: 0,
        dealerPosition: 0,
        smallBlindPosition: 1,
        bigBlindPosition: 2,
        gamePhase: 'turn',
        bettingRound: {
          phase: 'turn',
          currentPlayer: 0,
          lastRaisePlayer: null,
          minRaise: 10,
          completed: false
        },
        deck: [],
        blinds: { smallBlind: 5, bigBlind: 10 },
        handNumber: 1,
        waitingForPlayerAction: true,
        maxPlayers: 6
      };

      const result = calculateGameStatePotOdds(gameState);
      
      expect(result.amountToCall).toBe(0); // Already all-in
      expect(result.potOddsPercent).toBe(0);
    });
  });

  describe('Formatting Functions', () => {
    describe('formatPercent', () => {
      it('should format percentages with correct decimal places', () => {
        expect(formatPercent(33.333333, 1)).toBe('33.3%');
        expect(formatPercent(33.333333, 2)).toBe('33.33%');
        expect(formatPercent(25.0, 1)).toBe('25%');
        expect(formatPercent(0, 1)).toBe('--');
      });

      it('should handle edge cases', () => {
        expect(formatPercent(Infinity)).toBe('--');
        expect(formatPercent(NaN)).toBe('--');
      });
    });

    describe('formatCurrency', () => {
      it('should format currency amounts correctly', () => {
        expect(formatCurrency(1000)).toBe('1,000');
        expect(formatCurrency(1234567)).toBe('1,234,567');
        expect(formatCurrency(50)).toBe('50');
      });

      it('should handle edge cases', () => {
        expect(formatCurrency(Infinity)).toBe('--');
        expect(formatCurrency(NaN)).toBe('--');
      });
    });
  });

  describe('Accuracy Validation', () => {
    it('should validate accuracy within tolerance', () => {
      expect(validateAccuracy(33.333333, 33.33)).toBe(true);  // Within 0.1%
      expect(validateAccuracy(33.333333, 33.44)).toBe(false); // Outside 0.1% (diff = 0.106667)
      expect(validateAccuracy(25.0, 25.05)).toBe(true);       // Within 0.1%
      expect(validateAccuracy(25.0, 25.15)).toBe(false);      // Outside 0.1%
    });
  });

  describe('Integration Tests - Known Scenarios', () => {
    it('should match exact fractions for common scenarios', () => {
      // Common poker scenarios with known exact answers
      const scenarios = [
        { pot: 300, call: 100, expectedPercent: 25.00, description: '3:1 pot odds' },
        { pot: 200, call: 100, expectedPercent: 33.33, description: '2:1 pot odds' },
        { pot: 100, call: 100, expectedPercent: 50.00, description: '1:1 pot odds' },
        { pot: 150, call: 50, expectedPercent: 25.00, description: '3:1 pot odds variant' },
        { pot: 400, call: 200, expectedPercent: 33.33, description: '2:1 pot odds scaled' }
      ];

      scenarios.forEach(({ pot, call, expectedPercent }) => {
        const result = calculatePotOdds(pot, call);
        expect(result.potOddsPercent).toBe(expectedPercent);
        expect(validateAccuracy(expectedPercent, result.potOddsPercent)).toBe(true);
      });
    });

    it('should handle bluff scenarios accurately', () => {
      // Common bluff scenarios
      const bluffScenarios = [
        { pot: 60, bet: 30, expectedFold: 33.33, description: 'Half pot bluff' },
        { pot: 100, bet: 75, expectedFold: 42.86, description: '3/4 pot bluff' },
        { pot: 100, bet: 100, expectedFold: 50.00, description: 'Full pot bluff' },
        { pot: 50, bet: 100, expectedFold: 66.67, description: 'Overbet bluff' }
      ];

      bluffScenarios.forEach(({ pot, bet, expectedFold }) => {
        const result = calculateBreakEvenFoldPercent(pot, bet);
        expect(validateAccuracy(expectedFold, result)).toBe(true);
      });
    });
  });

  describe('Phase 3 - Equity Needed to Call', () => {
    it('should have equity needed equal to pot odds percentage', () => {
      // Test various scenarios to ensure numeric identity
      const testCases = [
        { pot: 100, call: 50 },   // 33.33%
        { pot: 300, call: 100 },  // 25.00%
        { pot: 200, call: 100 },  // 33.33%
        { pot: 150, call: 50 },   // 25.00%
        { pot: 80, call: 40 },    // 33.33%
        { pot: 500, call: 250 },  // 33.33%
        { pot: 60, call: 20 },    // 25.00%
      ];

      testCases.forEach(({ pot, call }) => {
        const result = calculatePotOdds(pot, call);
        
        // Equity needed should be numerically identical to pot odds percentage
        expect(result.potOddsPercent).toBe(result.breakEvenEquity);
        
        // Verify the calculation is correct
        const expectedPercent = (call / (pot + call)) * 100;
        expect(result.potOddsPercent).toBe(Math.round(expectedPercent * 100) / 100);
        expect(result.breakEvenEquity).toBe(Math.round(expectedPercent * 100) / 100);
      });
    });

    it('should handle edge cases with numeric identity maintained', () => {
      // Edge case: no call amount
      const noCallResult = calculatePotOdds(100, 0);
      expect(noCallResult.potOddsPercent).toBe(noCallResult.breakEvenEquity);
      expect(noCallResult.potOddsPercent).toBe(0);

      // Edge case: call equals pot
      const equalResult = calculatePotOdds(100, 100);
      expect(equalResult.potOddsPercent).toBe(equalResult.breakEvenEquity);
      expect(equalResult.potOddsPercent).toBe(50.00);

      // Edge case: call greater than pot
      const greaterResult = calculatePotOdds(50, 100);
      expect(greaterResult.potOddsPercent).toBe(greaterResult.breakEvenEquity);
      expect(greaterResult.potOddsPercent).toBe(66.67);
    });

    it('should maintain numeric identity in game state calculations', () => {
      const gameState: GameState = {
        players: [
          createPlayer('1', 500, 25, true), // Human player
          createPlayer('2', 500, 75),       // Opponent with higher bet
        ],
        communityCards: [],
        pot: 50,
        sidePots: [],
        currentPlayer: 0,
        dealerPosition: 0,
        smallBlindPosition: 1,
        bigBlindPosition: 2,
        gamePhase: 'flop',
        bettingRound: {
          phase: 'flop',
          currentPlayer: 0,
          lastRaisePlayer: null,
          minRaise: 10,
          completed: false
        },
        deck: [],
        blinds: { smallBlind: 5, bigBlind: 10 },
        handNumber: 1,
        waitingForPlayerAction: true,
        maxPlayers: 6
      };

      const result = calculateGameStatePotOdds(gameState);
      
      // Verify numeric identity between pot odds and equity needed
      expect(result.potOddsPercent).toBe(result.breakEvenEquity);
      
      // Pot calculation:
      // Current pot: 50 + 25 + 75 = 150 (pot + current bets)
      // Amount to call: 75 - 25 = 50 (opponent's bet - human's bet)
      // Pot before highest bet: 150 - 75 = 75
      // Pot odds: 50 / (75 + 50) = 50 / 125 = 40%
      expect(result.potOddsPercent).toBe(40.00);
      expect(result.breakEvenEquity).toBe(40.00);
    });

    it('should verify definition consistency across diverse cases', () => {
      // Generate diverse test cases
      const diverseCases = [
        { pot: 37, call: 18 },    // Non-round numbers
        { pot: 1000, call: 1 },   // Very small call
        { pot: 1, call: 1000 },   // Very large call
        { pot: 789, call: 234 },  // Random numbers
        { pot: 33, call: 66 },    // Double call
      ];

      diverseCases.forEach(({ pot, call }) => {
        const result = calculatePotOdds(pot, call);
        
        // The definition: Equity Needed = Pot Odds Percentage
        expect(result.potOddsPercent).toBe(result.breakEvenEquity);
        
        // Verify both represent the same mathematical concept
        const mathematicalResult = (call / (pot + call)) * 100;
        const roundedResult = Math.round(mathematicalResult * 100) / 100;
        
        expect(result.potOddsPercent).toBe(roundedResult);
        expect(result.breakEvenEquity).toBe(roundedResult);
      });
    });
  });
});