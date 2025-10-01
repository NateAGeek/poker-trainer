// =========================================
// Pot Odds & Break-Even Calculations
// Phase 2 Implementation - Technical Requirements
// =========================================

import type { GameState } from '../types/poker';

/**
 * Pot Odds Calculation Data
 */
export interface PotOddsData {
  // Core values
  pot: number;
  amountToCall: number;
  potAfterCall: number;
  
  // Pot odds for calling
  potOddsPercent: number;
  potOddsRatio: string;
  
  // Break-even calculations
  breakEvenEquity: number;
  
  // For betting/bluffing scenarios
  betSize?: number;
  breakEvenFoldPercent?: number;
}

/**
 * Calculate pot odds for a call scenario
 * Formula: AmountToCall / (Pot + AmountToCall) * 100
 * 
 * @param pot - Current pot size before the call
 * @param amountToCall - Amount needed to call
 * @returns Object with pot odds data
 */
export function calculatePotOdds(pot: number, amountToCall: number): PotOddsData {
  // Validate inputs
  if (pot < 0 || amountToCall < 0) {
    throw new Error('Pot and amount to call must be non-negative');
  }
  
  // Handle edge case where there's no bet to call
  if (amountToCall === 0) {
    return {
      pot,
      amountToCall: 0,
      potAfterCall: pot,
      potOddsPercent: 0,
      potOddsRatio: '--',
      breakEvenEquity: 0
    };
  }
  
  const potAfterCall = pot + amountToCall;
  
  // Core calculation: AmountToCall / (Pot + AmountToCall)
  const potOddsPercent = (amountToCall / potAfterCall) * 100;
  
  // Calculate ratio format (e.g., "3.5:1")
  const oddsRatio = pot / amountToCall;
  const potOddsRatio = oddsRatio >= 1 
    ? `${formatRatio(oddsRatio)}:1`
    : `1:${formatRatio(1 / oddsRatio)}`;
  
  // Break-even equity is the same as pot odds percentage
  const breakEvenEquity = potOddsPercent;
  
  return {
    pot,
    amountToCall,
    potAfterCall,
    potOddsPercent: roundToDecimal(potOddsPercent, 2),
    potOddsRatio,
    breakEvenEquity: roundToDecimal(breakEvenEquity, 2)
  };
}

/**
 * Calculate break-even fold percentage for a bluff
 * Formula: b / (P + b) * 100
 * 
 * @param pot - Pot size before the bet (P)
 * @param betSize - Size of the bluff bet (b)
 * @returns Break-even fold percentage
 */
export function calculateBreakEvenFoldPercent(pot: number, betSize: number): number {
  // Validate inputs
  if (pot < 0 || betSize < 0) {
    throw new Error('Pot and bet size must be non-negative');
  }
  
  // Handle edge case
  if (betSize === 0) {
    return 0;
  }
  
  // Core calculation: b / (P + b) * 100
  const breakEvenFoldPercent = (betSize / (pot + betSize)) * 100;
  
  return roundToDecimal(breakEvenFoldPercent, 2);
}

/**
 * Calculate comprehensive pot odds data from game state
 * 
 * @param gameState - Current game state
 * @returns Complete pot odds analysis
 */
export function calculateGameStatePotOdds(gameState: GameState): PotOddsData {
  const activePlayers = gameState.players.filter(p => !p.hasFolded);
  
  if (activePlayers.length === 0) {
    return {
      pot: gameState.pot,
      amountToCall: 0,
      potAfterCall: gameState.pot,
      potOddsPercent: 0,
      potOddsRatio: '--',
      breakEvenEquity: 0
    };
  }
  
  // Calculate current pot including all bets
  const totalCurrentBets = gameState.players.reduce((sum, player) => sum + player.currentBet, 0);
  const currentPot = gameState.pot + totalCurrentBets;
  
  // Find the amount to call (highest bet minus player's current bet)
  const highestBet = Math.max(...gameState.players.map(p => p.currentBet));
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const playerCurrentBet = humanPlayer?.currentBet || 0;
  const amountToCall = Math.max(0, highestBet - playerCurrentBet);
  
  // Calculate pot before the bet that needs to be called
  const potBeforeBet = currentPot - highestBet;
  
  // Calculate pot odds for the call
  const potOddsData = calculatePotOdds(potBeforeBet, amountToCall);
  
  // If there's a bet, calculate break-even fold percentage for that bet
  if (highestBet > 0) {
    const breakEvenFoldPercent = calculateBreakEvenFoldPercent(potBeforeBet, highestBet);
    
    return {
      ...potOddsData,
      betSize: highestBet,
      breakEvenFoldPercent: roundToDecimal(breakEvenFoldPercent, 2)
    };
  }
  
  return potOddsData;
}

/**
 * Format a decimal ratio to a clean string representation
 * 
 * @param ratio - Numerical ratio
 * @returns Formatted ratio string
 */
function formatRatio(ratio: number): string {
  if (ratio === Infinity || !isFinite(ratio)) {
    return '∞';
  }
  
  // Round to 1 decimal place for ratios
  return (Math.round(ratio * 10) / 10).toString();
}

/**
 * Round a number to specified decimal places
 * Ensures we meet the ≤0.1% absolute error requirement
 * 
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
function roundToDecimal(value: number, decimals: number): number {
  if (!isFinite(value)) {
    return 0;
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format percentage for display
 * 
 * @param percent - Percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercent(percent: number, decimals: number = 1): string {
  if (!isFinite(percent) || percent === 0) {
    return '--';
  }
  
  return `${roundToDecimal(percent, decimals)}%`;
}

/**
 * Format currency/chip amounts
 * 
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (!isFinite(amount)) {
    return '--';
  }
  
  return amount.toLocaleString();
}

/**
 * Validate pot odds calculation accuracy
 * Used for testing to ensure ≤0.1% absolute error
 * 
 * @param expected - Expected value
 * @param actual - Actual calculated value
 * @returns Whether the values are within acceptable error range
 */
export function validateAccuracy(expected: number, actual: number): boolean {
  const absoluteError = Math.abs(expected - actual);
  return absoluteError <= 0.1;
}