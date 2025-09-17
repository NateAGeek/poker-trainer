import type { Player, PlayerPosition, PlayerAction, AIPersonality, BettingRound, Card } from '../types/poker';
import { PlayerPosition as Pos, PlayerAction as Action } from '../types/poker';

// Calculate player positions based on dealer position
export function calculatePositions(players: Player[], dealerIndex: number): Player[] {
  const numPlayers = players.length;
  
  return players.map((player, index) => {
    const seatOffset = (index - dealerIndex + numPlayers) % numPlayers;
    let position: PlayerPosition;
    
    if (numPlayers === 2) {
      // Heads-up: dealer is small blind, other player is big blind
      position = index === dealerIndex ? Pos.SMALL_BLIND : Pos.BIG_BLIND;
    } else {
      // Multi-player
      if (seatOffset === 0) position = Pos.DEALER;
      else if (seatOffset === 1) position = Pos.SMALL_BLIND;
      else if (seatOffset === 2) position = Pos.BIG_BLIND;
      else if (seatOffset <= 4) position = Pos.EARLY;
      else if (seatOffset <= 6) position = Pos.MIDDLE;
      else position = Pos.LATE;
    }
    
    return {
      ...player,
      position,
      isDealer: index === dealerIndex
    };
  });
}

// Get small blind and big blind positions
export function getBlindPositions(players: Player[], dealerIndex: number): { smallBlind: number; bigBlind: number } {
  const numPlayers = players.length;
  
  if (numPlayers === 2) {
    return {
      smallBlind: dealerIndex,
      bigBlind: (dealerIndex + 1) % numPlayers
    };
  }
  
  return {
    smallBlind: (dealerIndex + 1) % numPlayers,
    bigBlind: (dealerIndex + 2) % numPlayers
  };
}

// Post blinds and return updated players and pot
export function postBlinds(players: Player[], smallBlindPos: number, bigBlindPos: number, smallBlind: number, bigBlind: number): { players: Player[]; pot: number } {
  const updatedPlayers = players.map((player, index) => {
    if (index === smallBlindPos) {
      const betAmount = Math.min(smallBlind, player.chips);
      return {
        ...player,
        chips: player.chips - betAmount,
        currentBet: betAmount,
        totalBetThisRound: betAmount,
        isAllIn: player.chips - betAmount === 0,
        lastAction: Action.SMALL_BLIND
      };
    } else if (index === bigBlindPos) {
      const betAmount = Math.min(bigBlind, player.chips);
      return {
        ...player,
        chips: player.chips - betAmount,
        currentBet: betAmount,
        totalBetThisRound: betAmount,
        isAllIn: player.chips - betAmount === 0,
        lastAction: Action.BIG_BLIND
      };
    }
    return {
      ...player,
      currentBet: 0,
      totalBetThisRound: 0
    };
  });
  
  const pot = updatedPlayers[smallBlindPos].currentBet + updatedPlayers[bigBlindPos].currentBet;
  return { players: updatedPlayers, pot };
}

// Get next active player (not folded, not all-in)
export function getNextActivePlayer(players: Player[], currentPlayer: number): number {
  const numPlayers = players.length;
  let nextPlayer = (currentPlayer + 1) % numPlayers;
  let attempts = 0;
  
  while (attempts < numPlayers) {
    const player = players[nextPlayer];
    if (!player.hasFolded && !player.isAllIn) {
      return nextPlayer;
    }
    nextPlayer = (nextPlayer + 1) % numPlayers;
    attempts++;
  }
  
  return -1; // No active players
}

// Check if betting round is complete
export function isBettingRoundComplete(players: Player[], bettingRound: BettingRound): boolean {
  const activePlayers = players.filter(p => !p.hasFolded && !p.isAllIn);
  
  if (activePlayers.length <= 1) return true;
  
  // Check if all active players have acted and have equal bets
  const maxBet = Math.max(...players.map(p => p.currentBet));
  
  return activePlayers.every(player => {
    const hasActed = player.lastAction !== undefined;
    const hasMatchingBet = player.currentBet === maxBet || player.isAllIn;
    return hasActed && hasMatchingBet;
  });
}

// Default AI personalities
export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  TIGHT_PASSIVE: {
    aggressiveness: 0.2,
    bluffFrequency: 0.1,
    foldThreshold: 0.7,
    raiseBias: 0.2,
    name: 'Tight Player'
  },
  LOOSE_AGGRESSIVE: {
    aggressiveness: 0.8,
    bluffFrequency: 0.4,
    foldThreshold: 0.3,
    raiseBias: 0.7,
    name: 'Aggressive Player'
  },
  BALANCED: {
    aggressiveness: 0.5,
    bluffFrequency: 0.2,
    foldThreshold: 0.5,
    raiseBias: 0.4,
    name: 'Balanced Player'
  },
  CALLING_STATION: {
    aggressiveness: 0.3,
    bluffFrequency: 0.05,
    foldThreshold: 0.2,
    raiseBias: 0.1,
    name: 'Calling Station'
  }
};

// Simple AI decision making (will be enhanced with GTO analysis later)
export function makeAIDecision(
  player: Player,
  gameState: { pot: number; blinds: { bigBlind: number }; communityCards: Card[] },
  availableActions: PlayerAction[],
  minBet: number,
  maxBet: number
): { action: PlayerAction; amount?: number } {
  const personality = player.aiPersonality || AI_PERSONALITIES.BALANCED;
  
  // Simple hand strength calculation (placeholder for now)
  const handStrength = calculateSimpleHandStrength(player.hand, gameState.communityCards);
  const potOdds = gameState.pot > 0 ? minBet / (gameState.pot + minBet) : 0;
  
  // Decision logic based on personality and hand strength
  const random = Math.random();
  
  // Very weak hand - likely fold
  if (handStrength < 0.3 && random > (1 - personality.foldThreshold)) {
    if (availableActions.includes(Action.CHECK)) return { action: Action.CHECK };
    if (availableActions.includes(Action.FOLD)) return { action: Action.FOLD };
  }
  
  // Strong hand - likely bet/raise
  if (handStrength > 0.7 && random < personality.aggressiveness) {
    if (availableActions.includes(Action.RAISE)) {
      const raiseAmount = Math.min(
        minBet * (1 + personality.raiseBias),
        Math.min(maxBet, player.chips)
      );
      return { action: Action.RAISE, amount: Math.floor(raiseAmount) };
    }
    if (availableActions.includes(Action.BET)) {
      const betAmount = Math.min(
        gameState.blinds.bigBlind * (1 + personality.aggressiveness),
        Math.min(maxBet, player.chips)
      );
      return { action: Action.BET, amount: Math.floor(betAmount) };
    }
  }
  
  // Medium hand or bluff opportunity
  if (random < personality.bluffFrequency && handStrength < 0.4) {
    if (availableActions.includes(Action.BET)) {
      const betAmount = Math.min(gameState.blinds.bigBlind * 2, player.chips);
      return { action: Action.BET, amount: betAmount };
    }
  }
  
  // Default actions
  if (availableActions.includes(Action.CHECK)) return { action: Action.CHECK };
  if (availableActions.includes(Action.CALL)) return { action: Action.CALL };
  if (availableActions.includes(Action.FOLD)) return { action: Action.FOLD };
  
  return { action: Action.FOLD };
}

// Simple hand strength calculation (placeholder)
function calculateSimpleHandStrength(hand: Card[], communityCards: Card[]): number {
  // This is a very basic implementation
  // In a real GTO trainer, this would use proper hand evaluation
  const allCards = [...hand, ...communityCards];
  
  // Basic scoring based on high cards and pairs
  let strength = 0;
  const ranks = allCards.map(card => {
    switch (card.rank) {
      case 'A': return 14;
      case 'K': return 13;
      case 'Q': return 12;
      case 'J': return 11;
      default: return parseInt(card.rank) || 10;
    }
  });
  
  const maxRank = Math.max(...ranks);
  strength += maxRank / 14 * 0.3;
  
  // Check for pairs
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const hasPair = Object.values(rankCounts).some(count => count >= 2);
  if (hasPair) strength += 0.4;
  
  return Math.min(strength, 1);
}
