import { describe, it, expect } from 'vitest';
import type { GameState, Player } from '../types/poker';
import {
  calculateCurrentPotSize,
  calculateEffectiveStack,
  calculateSPR,
  calculateCurrentBetSizePercent,
  calculatePotGeometry,
  calculatePotSizeAfterAction,
  calculateSPRAfterAction,
  calculateBetSizePercent,
  getStandardBetSizes,
  validatePotGeometry
} from './potGeometryUtils';

// Helper function to create test players
function createTestPlayer(id: string, chips: number, currentBet: number = 0, totalBetThisRound: number = 0, hasFolded: boolean = false): Player {
  return {
    id,
    name: `Player ${id}`,
    hand: [],
    chips,
    currentBet,
    totalBetThisRound,
    hasFolded,
    isAllIn: false,
    isDealer: false,
    position: 'middle',
    isHuman: false
  };
}

// Helper function to create basic game state
function createTestGameState(players: Player[], pot: number = 0): GameState {
  return {
    players,
    communityCards: [],
    pot,
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
      minRaise: 20,
      completed: false
    },
    deck: [],
    blinds: { smallBlind: 10, bigBlind: 20 },
    handNumber: 1,
    waitingForPlayerAction: false,
    maxPlayers: 6
  };
}

describe('Pot Geometry Utils', () => {
  describe('calculateCurrentPotSize', () => {
    it('should calculate pot size including current bets', () => {
      const players = [
        createTestPlayer('1', 1000, 50, 100),
        createTestPlayer('2', 1000, 100, 150),
        createTestPlayer('3', 1000, 0, 75)
      ];
      const gameState = createTestGameState(players, 500);

      const result = calculateCurrentPotSize(gameState);
      expect(result).toBe(650); // 500 pot + 50 + 100 + 0 current bets
    });

    it('should handle empty pot and no current bets', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 1000)
      ];
      const gameState = createTestGameState(players, 0);

      const result = calculateCurrentPotSize(gameState);
      expect(result).toBe(0);
    });
  });

  describe('calculateEffectiveStack', () => {
    it('should return smallest stack among active players', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 500),
        createTestPlayer('3', 2000),
        createTestPlayer('4', 100, 0, 0, true) // folded player
      ];

      const result = calculateEffectiveStack(players);
      expect(result).toBe(500); // Player 2 has smallest stack among active players
    });

    it('should return 0 when all players are folded', () => {
      const players = [
        createTestPlayer('1', 1000, 0, 0, true),
        createTestPlayer('2', 500, 0, 0, true)
      ];

      const result = calculateEffectiveStack(players);
      expect(result).toBe(0);
    });

    it('should handle single active player', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 500, 0, 0, true)
      ];

      const result = calculateEffectiveStack(players);
      expect(result).toBe(1000);
    });
  });

  describe('calculateSPR', () => {
    it('should calculate SPR correctly', () => {
      const result = calculateSPR(1000, 200);
      expect(result).toBe(5);
    });

    it('should return Infinity when pot is 0', () => {
      const result = calculateSPR(1000, 0);
      expect(result).toBe(Infinity);
    });

    it('should return 0 when both stack and pot are 0', () => {
      const result = calculateSPR(0, 0);
      expect(result).toBe(0);
    });

    it('should handle very small pot sizes', () => {
      const result = calculateSPR(100, 1);
      expect(result).toBe(100);
    });
  });

  describe('calculateCurrentBetSizePercent', () => {
    it('should calculate bet size percentage correctly', () => {
      const players = [
        createTestPlayer('1', 1000, 100), // highest bet
        createTestPlayer('2', 1000, 50),
        createTestPlayer('3', 1000, 0)
      ];
      const gameState = createTestGameState(players, 200);

      const result = calculateCurrentBetSizePercent(gameState);
      // Pot before highest bet: (200 + 100 + 50 + 0) - 100 = 250
      // Bet size: 100 / 250 = 40%
      expect(result.percent).toBe(40);
      expect(result.amount).toBe(100);
    });

    it('should return 0 when no current bets', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 1000)
      ];
      const gameState = createTestGameState(players, 100);

      const result = calculateCurrentBetSizePercent(gameState);
      expect(result.percent).toBe(0);
      expect(result.amount).toBe(0);
    });

    it('should handle all players folded', () => {
      const players = [
        createTestPlayer('1', 1000, 0, 0, true),
        createTestPlayer('2', 1000, 0, 0, true)
      ];
      const gameState = createTestGameState(players, 100);

      const result = calculateCurrentBetSizePercent(gameState);
      expect(result.percent).toBe(0);
      expect(result.amount).toBe(0);
    });
  });

  describe('calculatePotGeometry', () => {
    it('should calculate complete pot geometry', () => {
      const players = [
        createTestPlayer('1', 1000, 100, 150),
        createTestPlayer('2', 500, 100, 120),
        createTestPlayer('3', 2000, 0, 80)
      ];
      const gameState = createTestGameState(players, 300);

      const result = calculatePotGeometry(gameState);
      
      expect(result.potSize).toBe(500); // 300 + 100 + 100 + 0
      expect(result.effectiveStack).toBe(500); // smallest stack
      expect(result.spr).toBe(1); // 500 / 500
      expect(result.currentBetAmount).toBe(100);
      expect(result.currentBetSizePercent).toBe(25); // 100 / (500 - 100) = 25%
    });
  });

  describe('calculatePotSizeAfterAction', () => {
    it('should calculate pot size after betting action', () => {
      const players = [
        createTestPlayer('1', 1000, 50),
        createTestPlayer('2', 1000, 0)
      ];
      const gameState = createTestGameState(players, 200);

      const result = calculatePotSizeAfterAction(gameState, 100);
      expect(result).toBe(350); // 200 pot + 50 current + 0 current + 100 action
    });
  });

  describe('calculateSPRAfterAction', () => {
    it('should calculate SPR after betting action', () => {
      const players = [
        createTestPlayer('1', 1000, 50),
        createTestPlayer('2', 500, 0)
      ];
      const gameState = createTestGameState(players, 200);

      const result = calculateSPRAfterAction(gameState, 100, 0);
      // New pot: 200 + 50 + 0 + 100 = 350
      // Player 1 chips after action: 1000 - 100 = 900
      // New effective stack: min(900, 500) = 500
      // SPR: 500 / 350 ≈ 1.43
      expect(result).toBeCloseTo(1.43, 2);
    });
  });

  describe('calculateBetSizePercent', () => {
    it('should calculate bet size as percentage of pot', () => {
      expect(calculateBetSizePercent(50, 100)).toBe(50);
      expect(calculateBetSizePercent(33, 100)).toBe(33);
      expect(calculateBetSizePercent(75, 150)).toBe(50);
    });

    it('should return 0 when pot is 0', () => {
      expect(calculateBetSizePercent(50, 0)).toBe(0);
    });
  });

  describe('getStandardBetSizes', () => {
    it('should return standard bet sizing options', () => {
      const result = getStandardBetSizes(100);
      
      expect(result).toEqual([
        { percent: 33, amount: 33 },
        { percent: 50, amount: 50 },
        { percent: 66, amount: 66 },
        { percent: 75, amount: 75 },
        { percent: 100, amount: 100 }
      ]);
    });

    it('should handle non-round pot sizes', () => {
      const result = getStandardBetSizes(123);
      
      expect(result[0]).toEqual({ percent: 33, amount: 41 }); // 33% of 123 = 40.59, rounded to 41
      expect(result[1]).toEqual({ percent: 50, amount: 62 }); // 50% of 123 = 61.5, rounded to 62
    });
  });

  describe('validatePotGeometry', () => {
    it('should validate correct pot geometry', () => {
      const geometry = {
        potSize: 100,
        effectiveStack: 500,
        spr: 5,
        currentBetSizePercent: 50,
        currentBetAmount: 50
      };

      const result = validatePotGeometry(geometry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect invalid pot geometry', () => {
      const geometry = {
        potSize: -100,
        effectiveStack: -500,
        spr: -5,
        currentBetSizePercent: -50,
        currentBetAmount: 50
      };

      const result = validatePotGeometry(geometry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pot size cannot be negative');
      expect(result.errors).toContain('Effective stack cannot be negative');
      expect(result.errors).toContain('SPR cannot be negative');
      expect(result.errors).toContain('Bet size percentage cannot be negative');
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle all-in preflop scenario', () => {
      const players = [
        createTestPlayer('1', 0, 1000, 1000), // all-in with 0 remaining chips
        createTestPlayer('2', 500, 1000, 1000), // called the all-in, has 500 remaining
        createTestPlayer('3', 2000, 0, 0, true) // folded
      ];
      const gameState = createTestGameState(players, 30); // blinds in pot

      const result = calculatePotGeometry(gameState);
      
      expect(result.potSize).toBe(2030); // 30 + 1000 + 1000
      // Since player 1 has 0 chips and player 2 has 500 chips, 
      // the effective stack is 0 (minimum among active players)
      expect(result.effectiveStack).toBe(0); 
      expect(result.spr).toBe(0); // 0 / 2030 = 0
    });

    it('should handle multiway then heads-up (effective stack changes)', () => {
      // Start multiway
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 500),
        createTestPlayer('3', 2000),
        createTestPlayer('4', 800)
      ];
      
      const multiway = calculateEffectiveStack(players);
      expect(multiway).toBe(500);

      // Player 2 folds, now heads-up
      players[1].hasFolded = true;
      const headsUp = calculateEffectiveStack(players);
      expect(headsUp).toBe(800); // New effective stack between remaining players
    });

    it('should handle very high SPR (tournament late stages)', () => {
      const players = [
        createTestPlayer('1', 50000),
        createTestPlayer('2', 60000)
      ];
      const gameState = createTestGameState(players, 100);

      const result = calculatePotGeometry(gameState);
      expect(result.spr).toBe(500); // 50000 / 100
    });

    it('should handle very low SPR (commitment threshold)', () => {
      const players = [
        createTestPlayer('1', 100),
        createTestPlayer('2', 150)
      ];
      const gameState = createTestGameState(players, 200);

      const result = calculatePotGeometry(gameState);
      expect(result.spr).toBe(0.5); // 100 / 200
    });

    it('should handle zero chips scenario', () => {
      const players = [
        createTestPlayer('1', 0),
        createTestPlayer('2', 0, 0, 0, true)
      ];
      const gameState = createTestGameState(players, 100);

      const result = calculatePotGeometry(gameState);
      expect(result.effectiveStack).toBe(0);
      expect(result.spr).toBe(0);
    });
  });
});