/**
 * Utility functions for managing poker table positions and dealer rotation
 */

export type PokerPosition = 
  | 'BTN'    // Button (Dealer)
  | 'SB'     // Small Blind
  | 'BB'     // Big Blind
  | 'UTG'    // Under the Gun
  | 'UTG+1'  // Under the Gun + 1
  | 'UTG+2'  // Under the Gun + 2
  | 'MP'     // Middle Position
  | 'MP+1'   // Middle Position + 1
  | 'HJ'     // Hijack
  | 'CO';    // Cutoff

/**
 * Maps poker positions based on table size and relative position to dealer
 */
const POSITION_MAPS: Record<number, PokerPosition[]> = {
  2: ['BTN', 'BB'], // Heads up: Button acts first preflop, BB acts first postflop
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'SB', 'BB', 'CO'],
  5: ['BTN', 'SB', 'BB', 'UTG', 'CO'],
  6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'],
  7: ['BTN', 'SB', 'BB', 'UTG', 'MP', 'HJ', 'CO'],
  8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO'],
  9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'HJ', 'CO']
};

/**
 * Get poker position name based on player count and dealer position
 * @param seatIndex - The seat index (0-based)
 * @param dealerSeatIndex - The dealer's seat index (0-based)
 * @param totalPlayers - Total number of players
 * @returns The poker position name
 */
export function getPokerPosition(
  seatIndex: number, 
  dealerSeatIndex: number, 
  totalPlayers: number
): PokerPosition {
  if (totalPlayers < 2 || totalPlayers > 9) {
    throw new Error('Invalid player count. Must be between 2 and 9.');
  }

  const positionMap = POSITION_MAPS[totalPlayers];
  
  // Calculate relative position from dealer (0 = dealer, 1 = next clockwise, etc.)
  const relativePosition = (seatIndex - dealerSeatIndex + totalPlayers) % totalPlayers;
  
  return positionMap[relativePosition];
}

/**
 * Get abbreviated position name for display
 * @param position - The poker position
 * @returns Abbreviated position name
 */
export function getPositionDisplay(position: PokerPosition): string {
  return position;
}

/**
 * Get full position name for tooltips or detailed display
 * @param position - The poker position
 * @returns Full position name
 */
export function getPositionFullName(position: PokerPosition): string {
  const fullNames: Record<PokerPosition, string> = {
    'BTN': 'Button (Dealer)',
    'SB': 'Small Blind',
    'BB': 'Big Blind',
    'UTG': 'Under the Gun',
    'UTG+1': 'Under the Gun + 1',
    'UTG+2': 'Under the Gun + 2',
    'MP': 'Middle Position',
    'MP+1': 'Middle Position + 1',
    'HJ': 'Hijack',
    'CO': 'Cutoff'
  };
  
  return fullNames[position];
}

/**
 * Determine if a position is early, middle, or late
 * @param position - The poker position
 * @returns Position category
 */
export function getPositionCategory(position: PokerPosition): 'early' | 'middle' | 'late' | 'blinds' {
  switch (position) {
    case 'SB':
    case 'BB':
      return 'blinds';
    case 'UTG':
    case 'UTG+1':
    case 'UTG+2':
      return 'early';
    case 'MP':
    case 'MP+1':
      return 'middle';
    case 'HJ':
    case 'CO':
    case 'BTN':
      return 'late';
  }
}

/**
 * Get the next dealer position (clockwise)
 * @param currentDealerIndex - Current dealer seat index
 * @param totalPlayers - Total number of players
 * @returns Next dealer seat index
 */
export function getNextDealerPosition(currentDealerIndex: number, totalPlayers: number): number {
  return (currentDealerIndex + 1) % totalPlayers;
}

/**
 * Get small blind position relative to dealer
 * @param dealerIndex - Dealer seat index
 * @param totalPlayers - Total number of players
 * @returns Small blind seat index
 */
export function getSmallBlindPosition(dealerIndex: number, totalPlayers: number): number {
  if (totalPlayers === 2) {
    // In heads-up, dealer is small blind
    return dealerIndex;
  }
  return (dealerIndex + 1) % totalPlayers;
}

/**
 * Get big blind position relative to dealer
 * @param dealerIndex - Dealer seat index
 * @param totalPlayers - Total number of players
 * @returns Big blind seat index
 */
export function getBigBlindPosition(dealerIndex: number, totalPlayers: number): number {
  if (totalPlayers === 2) {
    // In heads-up, non-dealer is big blind
    return (dealerIndex + 1) % totalPlayers;
  }
  return (dealerIndex + 2) % totalPlayers;
}

/**
 * Check if a position should show a dealer chip
 * @param position - The poker position
 * @returns Whether to show dealer chip
 */
export function shouldShowDealerChip(position: PokerPosition): boolean {
  return position === 'BTN';
}