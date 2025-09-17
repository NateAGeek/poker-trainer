import type { Player, GameState } from '../types/poker';

export interface PotGeometry {
  potSize: number;
  effectiveStack: number;
  spr: number; // Stack-to-Pot Ratio
  currentBetSizePercent: number;
  currentBetAmount: number;
}

/**
 * Calculate the current pot size including all bets from current betting round
 */
export function calculateCurrentPotSize(gameState: GameState): number {
  const totalCurrentBets = gameState.players.reduce((sum, player) => sum + player.currentBet, 0);
  return gameState.pot + totalCurrentBets;
}

/**
 * Calculate the effective stack size between active players
 * Effective stack is the smallest stack among players still in the hand
 */
export function calculateEffectiveStack(players: Player[]): number {
  const activePlayers = players.filter(player => !player.hasFolded);
  
  if (activePlayers.length === 0) {
    return 0;
  }

  // Return the smallest stack among active players
  return Math.min(...activePlayers.map(player => player.chips));
}

/**
 * Calculate Stack-to-Pot Ratio (SPR)
 * SPR = Effective Stack / Current Pot Size
 */
export function calculateSPR(effectiveStack: number, potSize: number): number {
  if (potSize === 0) {
    return effectiveStack > 0 ? Infinity : 0;
  }
  return effectiveStack / potSize;
}

/**
 * Calculate the current bet size as a percentage of the pot
 * This represents the betting action that would need to be called
 */
export function calculateCurrentBetSizePercent(gameState: GameState): { percent: number; amount: number } {
  const currentPotSize = calculateCurrentPotSize(gameState);
  const activePlayers = gameState.players.filter(player => !player.hasFolded);
  
  if (activePlayers.length === 0) {
    return { percent: 0, amount: 0 };
  }

  // Find the highest current bet (what needs to be matched)
  const highestBet = Math.max(...gameState.players.map(player => player.currentBet));
  
  if (highestBet === 0 || currentPotSize === 0) {
    return { percent: 0, amount: 0 };
  }

  // Calculate percentage of the pot (before this bet was made)
  const potBeforeBet = currentPotSize - highestBet;
  const percent = potBeforeBet > 0 ? (highestBet / potBeforeBet) * 100 : 0;
  
  return { 
    percent: Math.round(percent * 10) / 10, // Round to 1 decimal place
    amount: highestBet 
  };
}

/**
 * Calculate complete pot geometry for the current game state
 */
export function calculatePotGeometry(gameState: GameState): PotGeometry {
  const potSize = calculateCurrentPotSize(gameState);
  const effectiveStack = calculateEffectiveStack(gameState.players);
  const spr = calculateSPR(effectiveStack, potSize);
  const { percent: currentBetSizePercent, amount: currentBetAmount } = calculateCurrentBetSizePercent(gameState);

  return {
    potSize,
    effectiveStack,
    spr: Math.round(spr * 100) / 100, // Round to 2 decimal places
    currentBetSizePercent,
    currentBetAmount
  };
}

/**
 * Calculate pot size after a specific betting action
 * Useful for scenario analysis and action evaluation
 */
export function calculatePotSizeAfterAction(
  gameState: GameState,
  actionAmount: number
): number {
  const currentPotSize = calculateCurrentPotSize(gameState);
  return currentPotSize + actionAmount;
}

/**
 * Calculate SPR after a specific betting action
 * Useful for determining how stack sizes change relative to pot
 */
export function calculateSPRAfterAction(
  gameState: GameState,
  actionAmount: number,
  playerIndex: number
): number {
  const newPotSize = calculatePotSizeAfterAction(gameState, actionAmount);
  
  // Calculate new effective stack after the action
  const updatedPlayers = gameState.players.map((player, index) => ({
    ...player,
    chips: index === playerIndex ? player.chips - actionAmount : player.chips
  }));
  
  const newEffectiveStack = calculateEffectiveStack(updatedPlayers);
  return calculateSPR(newEffectiveStack, newPotSize);
}

/**
 * Calculate bet size as percentage of pot for a given amount
 * Useful for evaluating different bet sizing options
 */
export function calculateBetSizePercent(betAmount: number, potSize: number): number {
  if (potSize === 0) return 0;
  return Math.round((betAmount / potSize) * 100 * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate common bet sizing options (33%, 50%, 66%, 75%, 100% pot)
 */
export function getStandardBetSizes(potSize: number): Array<{ percent: number; amount: number }> {
  const percentages = [33, 50, 66, 75, 100];
  
  return percentages.map(percent => ({
    percent,
    amount: Math.round((potSize * percent) / 100)
  }));
}

/**
 * Validate pot geometry calculations for edge cases
 */
export function validatePotGeometry(geometry: PotGeometry): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (geometry.potSize < 0) {
    errors.push('Pot size cannot be negative');
  }
  
  if (geometry.effectiveStack < 0) {
    errors.push('Effective stack cannot be negative');
  }
  
  if (geometry.spr < 0) {
    errors.push('SPR cannot be negative');
  }
  
  if (geometry.currentBetSizePercent < 0) {
    errors.push('Bet size percentage cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}