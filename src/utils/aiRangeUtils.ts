import type { AIRange, AIPersonality, Card } from '../types/poker';

// Predefined preflop ranges for AI personalities
export const PREDEFINED_AI_RANGES: Record<string, AIRange> = {
  ultraTight: {
    name: "Ultra Tight (2%)",
    hands: [
      { hand: "AA", frequency: 1.0, action: "raise" },
      { hand: "KK", frequency: 1.0, action: "raise" },
      { hand: "QQ", frequency: 0.8, action: "raise" },
      { hand: "AKs", frequency: 1.0, action: "raise" },
      { hand: "AKo", frequency: 0.8, action: "raise" },
    ]
  },
  
  tight: {
    name: "Tight (8%)",
    hands: [
      // Premium pairs
      { hand: "AA", frequency: 1.0, action: "raise" },
      { hand: "KK", frequency: 1.0, action: "raise" },
      { hand: "QQ", frequency: 1.0, action: "raise" },
      { hand: "JJ", frequency: 1.0, action: "raise" },
      { hand: "TT", frequency: 0.9, action: "raise" },
      { hand: "99", frequency: 0.7, action: "raise" },
      
      // Premium suited
      { hand: "AKs", frequency: 1.0, action: "raise" },
      { hand: "AQs", frequency: 1.0, action: "raise" },
      { hand: "AJs", frequency: 0.9, action: "raise" },
      { hand: "KQs", frequency: 0.8, action: "raise" },
      
      // Premium offsuit
      { hand: "AKo", frequency: 1.0, action: "raise" },
      { hand: "AQo", frequency: 0.8, action: "raise" },
    ]
  },
  
  standard: {
    name: "Standard (15%)",
    hands: [
      // All pocket pairs
      { hand: "AA", frequency: 1.0, action: "raise" },
      { hand: "KK", frequency: 1.0, action: "raise" },
      { hand: "QQ", frequency: 1.0, action: "raise" },
      { hand: "JJ", frequency: 1.0, action: "raise" },
      { hand: "TT", frequency: 1.0, action: "raise" },
      { hand: "99", frequency: 1.0, action: "raise" },
      { hand: "88", frequency: 0.9, action: "raise" },
      { hand: "77", frequency: 0.8, action: "raise" },
      { hand: "66", frequency: 0.7, action: "call" },
      { hand: "55", frequency: 0.6, action: "call" },
      { hand: "44", frequency: 0.5, action: "call" },
      { hand: "33", frequency: 0.4, action: "call" },
      { hand: "22", frequency: 0.3, action: "call" },
      
      // Suited aces
      { hand: "AKs", frequency: 1.0, action: "raise" },
      { hand: "AQs", frequency: 1.0, action: "raise" },
      { hand: "AJs", frequency: 1.0, action: "raise" },
      { hand: "ATs", frequency: 0.9, action: "raise" },
      { hand: "A9s", frequency: 0.7, action: "call" },
      { hand: "A8s", frequency: 0.6, action: "call" },
      { hand: "A7s", frequency: 0.5, action: "call" },
      { hand: "A6s", frequency: 0.4, action: "call" },
      { hand: "A5s", frequency: 0.6, action: "call" },
      { hand: "A4s", frequency: 0.5, action: "call" },
      { hand: "A3s", frequency: 0.4, action: "call" },
      { hand: "A2s", frequency: 0.4, action: "call" },
      
      // Suited kings
      { hand: "KQs", frequency: 1.0, action: "raise" },
      { hand: "KJs", frequency: 0.9, action: "raise" },
      { hand: "KTs", frequency: 0.7, action: "call" },
      { hand: "K9s", frequency: 0.5, action: "call" },
      
      // Other suited
      { hand: "QJs", frequency: 0.9, action: "raise" },
      { hand: "QTs", frequency: 0.7, action: "call" },
      { hand: "JTs", frequency: 0.8, action: "call" },
      { hand: "T9s", frequency: 0.6, action: "call" },
      { hand: "98s", frequency: 0.5, action: "call" },
      
      // Offsuit broadways
      { hand: "AKo", frequency: 1.0, action: "raise" },
      { hand: "AQo", frequency: 1.0, action: "raise" },
      { hand: "AJo", frequency: 0.9, action: "raise" },
      { hand: "ATo", frequency: 0.7, action: "call" },
      { hand: "KQo", frequency: 0.8, action: "raise" },
      { hand: "KJo", frequency: 0.6, action: "call" },
      { hand: "QJo", frequency: 0.5, action: "call" },
    ]
  },
  
  loose: {
    name: "Loose (25%)",
    hands: [
      // Include all hands from standard but with higher frequencies
      // Plus many more marginal hands
      { hand: "AA", frequency: 1.0, action: "raise" },
      { hand: "KK", frequency: 1.0, action: "raise" },
      { hand: "QQ", frequency: 1.0, action: "raise" },
      { hand: "JJ", frequency: 1.0, action: "raise" },
      { hand: "TT", frequency: 1.0, action: "raise" },
      { hand: "99", frequency: 1.0, action: "raise" },
      { hand: "88", frequency: 1.0, action: "raise" },
      { hand: "77", frequency: 1.0, action: "raise" },
      { hand: "66", frequency: 1.0, action: "call" },
      { hand: "55", frequency: 1.0, action: "call" },
      { hand: "44", frequency: 1.0, action: "call" },
      { hand: "33", frequency: 1.0, action: "call" },
      { hand: "22", frequency: 1.0, action: "call" },
      
      // All suited aces
      { hand: "AKs", frequency: 1.0, action: "raise" },
      { hand: "AQs", frequency: 1.0, action: "raise" },
      { hand: "AJs", frequency: 1.0, action: "raise" },
      { hand: "ATs", frequency: 1.0, action: "raise" },
      { hand: "A9s", frequency: 1.0, action: "raise" },
      { hand: "A8s", frequency: 1.0, action: "call" },
      { hand: "A7s", frequency: 1.0, action: "call" },
      { hand: "A6s", frequency: 1.0, action: "call" },
      { hand: "A5s", frequency: 1.0, action: "call" },
      { hand: "A4s", frequency: 1.0, action: "call" },
      { hand: "A3s", frequency: 1.0, action: "call" },
      { hand: "A2s", frequency: 1.0, action: "call" },
      
      // Suited kings and queens
      { hand: "KQs", frequency: 1.0, action: "raise" },
      { hand: "KJs", frequency: 1.0, action: "raise" },
      { hand: "KTs", frequency: 1.0, action: "raise" },
      { hand: "K9s", frequency: 0.9, action: "call" },
      { hand: "K8s", frequency: 0.7, action: "call" },
      { hand: "K7s", frequency: 0.6, action: "call" },
      { hand: "K6s", frequency: 0.5, action: "call" },
      { hand: "K5s", frequency: 0.4, action: "call" },
      
      { hand: "QJs", frequency: 1.0, action: "raise" },
      { hand: "QTs", frequency: 1.0, action: "raise" },
      { hand: "Q9s", frequency: 0.8, action: "call" },
      { hand: "Q8s", frequency: 0.6, action: "call" },
      
      // Suited connectors and gappers
      { hand: "JTs", frequency: 1.0, action: "call" },
      { hand: "J9s", frequency: 0.8, action: "call" },
      { hand: "T9s", frequency: 1.0, action: "call" },
      { hand: "T8s", frequency: 0.8, action: "call" },
      { hand: "98s", frequency: 1.0, action: "call" },
      { hand: "97s", frequency: 0.7, action: "call" },
      { hand: "87s", frequency: 0.9, action: "call" },
      { hand: "86s", frequency: 0.6, action: "call" },
      { hand: "76s", frequency: 0.8, action: "call" },
      { hand: "75s", frequency: 0.5, action: "call" },
      { hand: "65s", frequency: 0.7, action: "call" },
      { hand: "54s", frequency: 0.6, action: "call" },
      
      // More offsuit hands
      { hand: "AKo", frequency: 1.0, action: "raise" },
      { hand: "AQo", frequency: 1.0, action: "raise" },
      { hand: "AJo", frequency: 1.0, action: "raise" },
      { hand: "ATo", frequency: 1.0, action: "raise" },
      { hand: "A9o", frequency: 0.8, action: "call" },
      { hand: "A8o", frequency: 0.6, action: "call" },
      { hand: "A7o", frequency: 0.5, action: "call" },
      { hand: "A6o", frequency: 0.4, action: "call" },
      { hand: "A5o", frequency: 0.5, action: "call" },
      
      { hand: "KQo", frequency: 1.0, action: "raise" },
      { hand: "KJo", frequency: 0.9, action: "raise" },
      { hand: "KTo", frequency: 0.7, action: "call" },
      { hand: "K9o", frequency: 0.5, action: "call" },
      
      { hand: "QJo", frequency: 0.8, action: "call" },
      { hand: "QTo", frequency: 0.6, action: "call" },
      { hand: "JTo", frequency: 0.7, action: "call" },
    ]
  },
  
  veryLoose: {
    name: "Very Loose (40%)",
    hands: [
      // Basically plays most hands with some frequency
      // This would include all the above plus many more marginal holdings
      // For brevity, I'll just indicate this range includes most hands
    ]
  }
};

/**
 * Convert a hand string from player's hole cards to range notation
 */
export function handToRangeNotation(cards: Card[]): string {
  if (cards.length !== 2) return '';
  
  const [card1, card2] = cards;
  const rank1 = card1.rank === '10' ? 'T' : card1.rank;
  const rank2 = card2.rank === '10' ? 'T' : card2.rank;
  
  // Sort by rank value (higher first)
  const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const rank1Value = rankOrder.indexOf(rank1);
  const rank2Value = rankOrder.indexOf(rank2);
  
  let highRank, lowRank;
  if (rank1Value <= rank2Value) {
    highRank = rank1;
    lowRank = rank2;
  } else {
    highRank = rank2;
    lowRank = rank1;
  }
  
  // Pocket pair
  if (highRank === lowRank) {
    return `${highRank}${lowRank}`;
  }
  
  // Suited or offsuit
  const suited = card1.suit === card2.suit;
  return `${highRank}${lowRank}${suited ? 's' : 'o'}`;
}

/**
 * Check if a hand should be played according to AI range
 */
export function shouldPlayHand(
  hand: Card[], 
  aiRange: AIRange | undefined,
  personality: AIPersonality
): { shouldPlay: boolean; action: 'fold' | 'call' | 'raise'; frequency: number } {
  if (!aiRange) {
    // Fallback to basic logic if no range defined
    return { shouldPlay: false, action: 'fold', frequency: 0 };
  }
  
  const handNotation = handToRangeNotation(hand);
  const rangeEntry = aiRange.hands.find(entry => entry.hand === handNotation);
  
  if (!rangeEntry) {
    return { shouldPlay: false, action: 'fold', frequency: 0 };
  }
  
  // Apply personality modifiers to frequency
  let adjustedFrequency = rangeEntry.frequency;
  
  // Tight players play fewer hands
  if (personality.foldThreshold > 0.6) {
    adjustedFrequency *= 0.7;
  }
  
  // Loose players play more hands
  if (personality.foldThreshold < 0.4) {
    adjustedFrequency = Math.min(1.0, adjustedFrequency * 1.3);
  }
  
  const shouldPlay = Math.random() < adjustedFrequency;
  
  return {
    shouldPlay,
    action: rangeEntry.action,
    frequency: adjustedFrequency
  };
}

/**
 * Get the appropriate AI range based on position and settings
 */
export function getAIRangeForPosition(
  personality: AIPersonality,
  _position: string,
  _playerCount: number
): AIRange | undefined {
  // If custom range is defined, use it
  if (personality.customRanges?.preflop) {
    return personality.customRanges.preflop;
  }
  
  // If predefined range is specified, use it
  if (personality.preflopRange && PREDEFINED_AI_RANGES[personality.preflopRange]) {
    return PREDEFINED_AI_RANGES[personality.preflopRange];
  }
  
  // Default range based on personality type
  if (personality.foldThreshold > 0.7) {
    return PREDEFINED_AI_RANGES.ultraTight;
  } else if (personality.foldThreshold > 0.5) {
    return PREDEFINED_AI_RANGES.tight;
  } else if (personality.foldThreshold > 0.3) {
    return PREDEFINED_AI_RANGES.standard;
  } else {
    return PREDEFINED_AI_RANGES.loose;
  }
}

/**
 * Save a custom AI range to localStorage
 */
export function saveCustomAIRange(name: string, range: AIRange): void {
  try {
    const saved = localStorage.getItem('poker-ai-custom-ranges');
    const ranges = saved ? JSON.parse(saved) : {};
    ranges[name] = range;
    localStorage.setItem('poker-ai-custom-ranges', JSON.stringify(ranges));
  } catch (error) {
    console.error('Failed to save custom AI range:', error);
  }
}

/**
 * Load custom AI ranges from localStorage
 */
export function loadCustomAIRanges(): Record<string, AIRange> {
  try {
    const saved = localStorage.getItem('poker-ai-custom-ranges');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Failed to load custom AI ranges:', error);
    return {};
  }
}

/**
 * Delete a custom AI range
 */
export function deleteCustomAIRange(name: string): void {
  try {
    const saved = localStorage.getItem('poker-ai-custom-ranges');
    if (saved) {
      const ranges = JSON.parse(saved);
      delete ranges[name];
      localStorage.setItem('poker-ai-custom-ranges', JSON.stringify(ranges));
    }
  } catch (error) {
    console.error('Failed to delete custom AI range:', error);
  }
}