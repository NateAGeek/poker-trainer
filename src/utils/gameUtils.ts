// =========================================
// Consolidated Game Utilities
// Merged from bettingUtils, potUtils, and potGeometryUtils
// =========================================

import type { Player, PlayerPosition, PlayerAction, AIPersonality, Card, GameState } from '../types/poker';
import { PlayerPosition as Pos, PlayerAction as Action } from '../types/poker';

// =========================================
// POSITION AND BLINDS UTILITIES
// =========================================

export function calculatePositions(players: Player[], dealerIndex: number): Player[] {
  const numPlayers = players.length;
  
  return players.map((player, index) => {
    const seatOffset = (index - dealerIndex + numPlayers) % numPlayers;
    let position: PlayerPosition;
    
    if (numPlayers === 2) {
      position = index === dealerIndex ? Pos.SMALL_BLIND : Pos.BIG_BLIND;
    } else {
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

// =========================================
// BETTING ROUND UTILITIES
// =========================================

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
  
  return -1;
}

export function isBettingRoundComplete(players: Player[]): boolean {
  const activePlayers = players.filter(p => !p.hasFolded && !p.isAllIn);
  
  if (activePlayers.length <= 1) return true;
  
  const maxBet = Math.max(...players.map(p => p.currentBet));
  
  return activePlayers.every(player => {
    const hasActed = player.lastAction !== undefined;
    const hasMatchingBet = player.currentBet === maxBet || player.isAllIn;
    return hasActed && hasMatchingBet;
  });
}

export function resetBettingRound(players: Player[]): Player[] {
  return players.map(player => ({
    ...player,
    currentBet: 0,
    lastAction: undefined
  }));
}

export function collectBets(players: Player[]): { players: Player[]; collectedAmount: number } {
  const collectedAmount = players.reduce((total, player) => total + player.currentBet, 0);
  
  const updatedPlayers = players.map(player => ({
    ...player,
    totalBetThisRound: player.totalBetThisRound + player.currentBet,
    currentBet: 0,
    lastAction: undefined
  }));

  return { players: updatedPlayers, collectedAmount };
}

// =========================================
// POT CALCULATION UTILITIES
// =========================================

export function calculateCurrentPotSize(gameState: GameState): number {
  const totalCurrentBets = gameState.players.reduce((sum, player) => sum + player.currentBet, 0);
  return gameState.pot + totalCurrentBets;
}

export function calculateTotalPot(players: Player[]): number {
  return players.reduce((total, player) => total + player.totalBetThisRound, 0);
}

export function calculateEffectiveStack(players: Player[]): number {
  const activePlayers = players.filter(player => !player.hasFolded);
  
  if (activePlayers.length === 0) {
    return 0;
  }

  return Math.min(...activePlayers.map(player => player.chips));
}

export function calculateSPR(effectiveStack: number, potSize: number): number {
  if (potSize === 0) {
    return effectiveStack > 0 ? Infinity : 0;
  }
  return effectiveStack / potSize;
}

export function calculateBetSizePercent(betAmount: number, potSize: number): number {
  if (potSize === 0) return 0;
  return Math.round((betAmount / potSize) * 100 * 10) / 10;
}

export function getStandardBetSizes(potSize: number): Array<{ percent: number; amount: number }> {
  const percentages = [33, 50, 66, 75, 100];
  
  return percentages.map(percent => ({
    percent,
    amount: Math.round((potSize * percent) / 100)
  }));
}

// =========================================
// SIDE POTS AND WINNINGS
// =========================================

export interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

export function calculateSidePots(players: Player[]): { mainPot: number; sidePots: SidePot[] } {
  const activePlayers = players.filter(p => !p.hasFolded);
  
  if (activePlayers.length === 0) {
    return { mainPot: 0, sidePots: [] };
  }

  const sortedByBet = [...activePlayers].sort((a, b) => a.totalBetThisRound - b.totalBetThisRound);
  
  let remainingPlayers = [...activePlayers];
  const sidePots: SidePot[] = [];
  let previousBetLevel = 0;

  for (const player of sortedByBet) {
    const currentBetLevel = player.totalBetThisRound;
    
    if (currentBetLevel > previousBetLevel) {
      const potContribution = (currentBetLevel - previousBetLevel) * remainingPlayers.length;
      
      if (potContribution > 0) {
        sidePots.push({
          amount: potContribution,
          eligiblePlayers: remainingPlayers.map(p => p.id)
        });
      }
      
      previousBetLevel = currentBetLevel;
    }
    
    if (player.isAllIn) {
      remainingPlayers = remainingPlayers.filter(p => p.id !== player.id);
    }
  }

  const mainPot = sidePots.length > 0 ? sidePots[0].amount : 0;
  const actualSidePots = sidePots.slice(1);

  return { mainPot, sidePots: actualSidePots };
}

export function distributePots(
  mainPot: number,
  sidePots: SidePot[],
  players: Player[],
  winners: { playerId: string; handRank: number }[]
): { player: Player; winnings: number }[] {
  const winnings: { player: Player; winnings: number }[] = [];
  
  const distributePot = (amount: number, eligiblePlayerIds: string[]) => {
    const eligibleWinners = winners.filter(w => eligiblePlayerIds.includes(w.playerId));
    
    if (eligibleWinners.length === 0) return;
    
    const bestRank = Math.max(...eligibleWinners.map(w => w.handRank));
    const actualWinners = eligibleWinners.filter(w => w.handRank === bestRank);
    
    const winningsPerPlayer = Math.floor(amount / actualWinners.length);
    const remainder = amount % actualWinners.length;
    
    actualWinners.forEach((winner, index) => {
      const player = players.find(p => p.id === winner.playerId)!;
      const baseWinnings = winningsPerPlayer + (index < remainder ? 1 : 0);
      
      const existingEntry = winnings.find(w => w.player.id === player.id);
      if (existingEntry) {
        existingEntry.winnings += baseWinnings;
      } else {
        winnings.push({ player, winnings: baseWinnings });
      }
    });
  };

  if (mainPot > 0) {
    const mainPotEligible = players.filter(p => !p.hasFolded).map(p => p.id);
    distributePot(mainPot, mainPotEligible);
  }

  sidePots.forEach(sidePot => {
    distributePot(sidePot.amount, sidePot.eligiblePlayers);
  });

  return winnings;
}

// =========================================
// AI DECISION MAKING
// =========================================

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

export function makeAIDecision(
  player: Player,
  gameState: { pot: number; blinds: { bigBlind: number }; communityCards: Card[] },
  availableActions: PlayerAction[],
  minBet: number,
  maxBet: number
): { action: PlayerAction; amount?: number } {
  const personality = player.aiPersonality || AI_PERSONALITIES.BALANCED;
  
  const handStrength = calculateSimpleHandStrength(player.hand, gameState.communityCards);
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

function calculateSimpleHandStrength(hand: Card[], communityCards: Card[]): number {
  const allCards = [...hand, ...communityCards];
  
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
  
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const hasPair = Object.values(rankCounts).some(count => count >= 2);
  if (hasPair) strength += 0.4;
  
  return Math.min(strength, 1);
}

// =========================================
// POT GEOMETRY ANALYSIS
// =========================================

export interface PotGeometry {
  potSize: number;
  effectiveStack: number;
  spr: number;
  currentBetSizePercent: number;
  currentBetAmount: number;
}

export function calculatePotGeometry(gameState: GameState): PotGeometry {
  const potSize = calculateCurrentPotSize(gameState);
  const effectiveStack = calculateEffectiveStack(gameState.players);
  const spr = calculateSPR(effectiveStack, potSize);
  const { percent: currentBetSizePercent, amount: currentBetAmount } = calculateCurrentBetSizePercent(gameState);

  return {
    potSize,
    effectiveStack,
    spr: Math.round(spr * 100) / 100,
    currentBetSizePercent,
    currentBetAmount
  };
}

export function calculateCurrentBetSizePercent(gameState: GameState): { percent: number; amount: number } {
  const currentPotSize = calculateCurrentPotSize(gameState);
  const activePlayers = gameState.players.filter(player => !player.hasFolded);
  
  if (activePlayers.length === 0) {
    return { percent: 0, amount: 0 };
  }

  const highestBet = Math.max(...gameState.players.map(player => player.currentBet));
  
  if (highestBet === 0 || currentPotSize === 0) {
    return { percent: 0, amount: 0 };
  }

  const potBeforeBet = currentPotSize - highestBet;
  const percent = potBeforeBet > 0 ? (highestBet / potBeforeBet) * 100 : 0;
  
  return { 
    percent: Math.round(percent * 10) / 10,
    amount: highestBet 
  };
}