import { describe, it, expect } from 'vitest';
import { postBlinds, calculatePositions, getBlindPositions } from './bettingUtils';
import type { Player } from '../types/poker';
import { PlayerPosition as Pos } from '../types/poker';

// Helper to create a test player
function createTestPlayer(id: string, chips: number = 1000): Player {
  return {
    id,
    name: `Player ${id}`,
    hand: [],
    chips,
    currentBet: 0,
    totalBetThisRound: 0,
    hasFolded: false,
    isAllIn: false,
    isDealer: false,
    position: Pos.EARLY,
    isHuman: false
  };
}

describe('Betting Utils', () => {
  describe('postBlinds', () => {
    it('should correctly post blinds and calculate pot', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 1000),
        createTestPlayer('3', 1000)
      ];
      
      const { players: updatedPlayers, pot } = postBlinds(players, 1, 2, 25, 50);
      
      // Check small blind player (index 1)
      expect(updatedPlayers[1].chips).toBe(975); // 1000 - 25
      expect(updatedPlayers[1].currentBet).toBe(25);
      expect(updatedPlayers[1].totalBetThisRound).toBe(25);
      expect(updatedPlayers[1].isAllIn).toBe(false);
      
      // Check big blind player (index 2)
      expect(updatedPlayers[2].chips).toBe(950); // 1000 - 50
      expect(updatedPlayers[2].currentBet).toBe(50);
      expect(updatedPlayers[2].totalBetThisRound).toBe(50);
      expect(updatedPlayers[2].isAllIn).toBe(false);
      
      // Check other player (index 0)
      expect(updatedPlayers[0].chips).toBe(1000); // unchanged
      expect(updatedPlayers[0].currentBet).toBe(0);
      expect(updatedPlayers[0].totalBetThisRound).toBe(0);
      expect(updatedPlayers[0].isAllIn).toBe(false);
      
      // Check pot calculation
      expect(pot).toBe(75); // 25 + 50
    });

    it('should handle short stack all-in scenarios correctly', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 10), // short stack
        createTestPlayer('3', 30)  // short stack
      ];
      
      const { players: updatedPlayers, pot } = postBlinds(players, 1, 2, 25, 50);
      
      // Small blind player with only 10 chips - should go all-in
      expect(updatedPlayers[1].chips).toBe(0);
      expect(updatedPlayers[1].currentBet).toBe(10);
      expect(updatedPlayers[1].totalBetThisRound).toBe(10);
      expect(updatedPlayers[1].isAllIn).toBe(true);
      
      // Big blind player with only 30 chips - should go all-in
      expect(updatedPlayers[2].chips).toBe(0);
      expect(updatedPlayers[2].currentBet).toBe(30);
      expect(updatedPlayers[2].totalBetThisRound).toBe(30);
      expect(updatedPlayers[2].isAllIn).toBe(true);
      
      // Pot should be sum of actual bets, not blind amounts
      expect(pot).toBe(40); // 10 + 30
    });

    it('should handle edge case where blind equals chip stack', () => {
      const players = [
        createTestPlayer('1', 1000),
        createTestPlayer('2', 25), // exactly small blind
        createTestPlayer('3', 50)  // exactly big blind
      ];
      
      const { players: updatedPlayers, pot } = postBlinds(players, 1, 2, 25, 50);
      
      // Both players should go all-in
      expect(updatedPlayers[1].chips).toBe(0);
      expect(updatedPlayers[1].currentBet).toBe(25);
      expect(updatedPlayers[1].isAllIn).toBe(true);
      
      expect(updatedPlayers[2].chips).toBe(0);
      expect(updatedPlayers[2].currentBet).toBe(50);
      expect(updatedPlayers[2].isAllIn).toBe(true);
      
      expect(pot).toBe(75); // 25 + 50
    });
  });

  describe('Position calculations', () => {
    it('should calculate positions correctly for 6 players', () => {
      const players = Array.from({ length: 6 }, (_, i) => createTestPlayer(String(i)));
      const dealerIndex = 5; // Last player is dealer
      
      const updatedPlayers = calculatePositions(players, dealerIndex);
      
      expect(updatedPlayers[5].position).toBe(Pos.DEALER);
      expect(updatedPlayers[5].isDealer).toBe(true);
      expect(updatedPlayers[0].position).toBe(Pos.SMALL_BLIND);
      expect(updatedPlayers[1].position).toBe(Pos.BIG_BLIND);
      expect(updatedPlayers[2].position).toBe(Pos.EARLY);
      expect(updatedPlayers[3].position).toBe(Pos.EARLY);
      expect(updatedPlayers[4].position).toBe(Pos.MIDDLE);
    });

    it('should get blind positions correctly', () => {
      const players = Array.from({ length: 6 }, (_, i) => createTestPlayer(String(i)));
      const dealerIndex = 2;
      
      const { smallBlind, bigBlind } = getBlindPositions(players, dealerIndex);
      
      expect(smallBlind).toBe(3); // (2 + 1) % 6
      expect(bigBlind).toBe(4);   // (2 + 2) % 6
    });

    it('should handle heads-up blind positions', () => {
      const players = Array.from({ length: 2 }, (_, i) => createTestPlayer(String(i)));
      const dealerIndex = 0;
      
      const { smallBlind, bigBlind } = getBlindPositions(players, dealerIndex);
      
      expect(smallBlind).toBe(0); // Dealer is small blind in heads-up
      expect(bigBlind).toBe(1);
    });
  });
});

describe('Pot Logic Integration Tests', () => {
  it('should handle complete betting round with all-in', () => {
    // This test simulates a complete scenario
    const players = [
      createTestPlayer('1', 1000),
      createTestPlayer('2', 100),  // will go all-in
      createTestPlayer('3', 1000)
    ];
    
    // Post blinds
    const { players: afterBlinds, pot: initialPot } = postBlinds(players, 1, 2, 25, 50);
    
    expect(initialPot).toBe(75);
    expect(afterBlinds[1].chips).toBe(75); // 100 - 25
    expect(afterBlinds[2].chips).toBe(950); // 1000 - 50
    
    // Simulate Player 2 going all-in with remaining chips
    const player2AllIn = {
      ...afterBlinds[1],
      chips: 0,
      currentBet: afterBlinds[1].currentBet + afterBlinds[1].chips, // 25 + 75 = 100
      isAllIn: true
    };
    
    expect(player2AllIn.currentBet).toBe(100);
    expect(player2AllIn.chips).toBe(0);
    expect(player2AllIn.isAllIn).toBe(true);
  });
});