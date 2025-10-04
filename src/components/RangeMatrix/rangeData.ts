import type { PredefinedRange } from './RangeMatrix';

// Generate all possible starting hands in poker
const generatePokerHands = (): string[] => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const hands: string[] = [];

  // Generate pocket pairs (diagonal)
  for (const rank of ranks) {
    hands.push(`${rank}${rank}`);
  }

  // Generate suited hands (upper triangle)
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      hands.push(`${ranks[i]}${ranks[j]}s`);
    }
  }

  // Generate offsuit hands (lower triangle)
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      hands.push(`${ranks[i]}${ranks[j]}o`);
    }
  }

  return hands;
};

// Saved custom ranges management
const SAVED_RANGES_KEY = 'poker-gto-trainer-saved-ranges';

export const getSavedRanges = (): Record<string, PredefinedRange> => {
  try {
    const saved = localStorage.getItem(SAVED_RANGES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveCustomRange = (name: string, range: PredefinedRange): void => {
  try {
    const savedRanges = getSavedRanges();
    const key = `saved_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    savedRanges[key] = {
      ...range,
      name: `${name} (Custom)`,
      description: `Custom saved range: ${name}`
    };
    localStorage.setItem(SAVED_RANGES_KEY, JSON.stringify(savedRanges));
  } catch (error) {
    console.error('Failed to save custom range:', error);
  }
};

export const deleteCustomRange = (key: string): void => {
  try {
    const savedRanges = getSavedRanges();
    delete savedRanges[key];
    localStorage.setItem(SAVED_RANGES_KEY, JSON.stringify(savedRanges));
  } catch (error) {
    console.error('Failed to delete custom range:', error);
  }
};

// Predefined common ranges with dynamic saved ranges
export const getPredefinedRanges = (): Record<string, PredefinedRange> => {
  const savedRanges = getSavedRanges();
  
  return {
    ...savedRanges, // Insert saved ranges here
    
    tightRange: {
      name: "Tight Range (22+, A2s+, K9s+, QTs+, JTs, A9o+, KQo)",
      description: "A conservative opening range suitable for early position",
      color: "#22c55e",
      hands: [
        // Pocket pairs
        { hand: "AA", frequency: 1.0, action: "raise" },
        { hand: "KK", frequency: 1.0, action: "raise" },
        { hand: "QQ", frequency: 1.0, action: "raise" },
        { hand: "JJ", frequency: 1.0, action: "raise" },
        { hand: "TT", frequency: 1.0, action: "raise" },
        { hand: "99", frequency: 1.0, action: "raise" },
        { hand: "88", frequency: 1.0, action: "raise" },
        { hand: "77", frequency: 1.0, action: "raise" },
        { hand: "66", frequency: 1.0, action: "raise" },
        { hand: "55", frequency: 1.0, action: "raise" },
        { hand: "44", frequency: 1.0, action: "raise" },
        { hand: "33", frequency: 1.0, action: "raise" },
        { hand: "22", frequency: 1.0, action: "raise" },
        
        // Suited aces
        { hand: "AKs", frequency: 1.0, action: "raise" },
        { hand: "AQs", frequency: 1.0, action: "raise" },
        { hand: "AJs", frequency: 1.0, action: "raise" },
        { hand: "ATs", frequency: 1.0, action: "raise" },
        { hand: "A9s", frequency: 1.0, action: "raise" },
        { hand: "A8s", frequency: 1.0, action: "raise" },
        { hand: "A7s", frequency: 1.0, action: "raise" },
        { hand: "A6s", frequency: 1.0, action: "raise" },
        { hand: "A5s", frequency: 1.0, action: "raise" },
        { hand: "A4s", frequency: 1.0, action: "raise" },
        { hand: "A3s", frequency: 1.0, action: "raise" },
        { hand: "A2s", frequency: 1.0, action: "raise" },
        
        // Suited kings
        { hand: "KQs", frequency: 1.0, action: "raise" },
        { hand: "KJs", frequency: 1.0, action: "raise" },
        { hand: "KTs", frequency: 1.0, action: "raise" },
        { hand: "K9s", frequency: 1.0, action: "raise" },
        
        // Other suited
        { hand: "QJs", frequency: 1.0, action: "raise" },
        { hand: "QTs", frequency: 1.0, action: "raise" },
        { hand: "JTs", frequency: 1.0, action: "raise" },
        
        // Offsuit broadways
        { hand: "AKo", frequency: 1.0, action: "raise" },
        { hand: "AQo", frequency: 1.0, action: "raise" },
        { hand: "AJo", frequency: 1.0, action: "raise" },
        { hand: "ATo", frequency: 1.0, action: "raise" },
        { hand: "A9o", frequency: 1.0, action: "raise" },
        { hand: "KQo", frequency: 1.0, action: "raise" },
      ]
    },
    
    looseRange: {
      name: "Loose Range (Any two cards)",
      description: "A very wide range that includes all hands",
      color: "#ef4444",
      hands: generatePokerHands().map(hand => ({
        hand,
        frequency: 1.0,
        action: "call" as const
      }))
    },
    
    premiumRange: {
      name: "Premium Range (AA, KK, QQ, JJ, AKs, AKo)",
      description: "Only the strongest starting hands",
      color: "#f59e0b",
      hands: [
        { hand: "AA", frequency: 1.0, action: "raise" },
        { hand: "KK", frequency: 1.0, action: "raise" },
        { hand: "QQ", frequency: 1.0, action: "raise" },
        { hand: "JJ", frequency: 1.0, action: "raise" },
        { hand: "AKs", frequency: 1.0, action: "raise" },
        { hand: "AKo", frequency: 1.0, action: "raise" },
      ]
    },
    
    callingRange: {
      name: "Calling Range vs 3-bet",
      description: "Hands that can profitably call a 3-bet",
      color: "#8b5cf6",
      hands: [
        { hand: "AA", frequency: 1.0, action: "call" },
        { hand: "KK", frequency: 1.0, action: "call" },
        { hand: "QQ", frequency: 0.8, action: "call" },
        { hand: "JJ", frequency: 0.6, action: "call" },
        { hand: "TT", frequency: 0.4, action: "call" },
        { hand: "99", frequency: 0.3, action: "call" },
        { hand: "88", frequency: 0.2, action: "call" },
        { hand: "AKs", frequency: 1.0, action: "call" },
        { hand: "AKo", frequency: 0.8, action: "call" },
        { hand: "AQs", frequency: 0.6, action: "call" },
        { hand: "AJs", frequency: 0.4, action: "call" },
      ]
    }
  };
};