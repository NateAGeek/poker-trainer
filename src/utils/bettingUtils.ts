import type { BettingDisplayMode } from '../types/poker';

/**
 * Format a betting amount based on the display mode
 */
export function formatBettingAmount(
  amount: number, 
  bigBlind: number, 
  displayMode: BettingDisplayMode
): string {
  if (displayMode === 'big_blinds') {
    const bbAmount = amount / bigBlind;
    if (bbAmount < 1) {
      return `${(bbAmount * 100).toFixed(0)}% BB`;
    } else if (bbAmount % 1 === 0) {
      return `${bbAmount} BB`;
    } else {
      return `${bbAmount.toFixed(1)} BB`;
    }
  } else {
    // Base amount formatting
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    } else {
      return amount.toString();
    }
  }
}

/**
 * Format chip stack display
 */
export function formatChipStack(
  chips: number, 
  bigBlind: number, 
  displayMode: BettingDisplayMode
): string {
  const baseAmount = formatBettingAmount(chips, bigBlind, 'base_amount');
  
  if (displayMode === 'big_blinds') {
    const bbAmount = Math.floor(chips / bigBlind);
    return `${baseAmount} (${bbAmount} BB)`;
  } else {
    return baseAmount;
  }
}

/**
 * Get appropriate input step for betting based on display mode
 */
export function getBettingStep(
  bigBlind: number, 
  displayMode: BettingDisplayMode
): number {
  return displayMode === 'big_blinds' ? bigBlind : 1;
}

/**
 * Parse betting input value based on display mode
 */
export function parseBettingInput(
  value: string, 
  bigBlind: number, 
  displayMode: BettingDisplayMode
): number {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;
  
  if (displayMode === 'big_blinds') {
    return Math.round(numValue * bigBlind);
  } else {
    return Math.round(numValue);
  }
}