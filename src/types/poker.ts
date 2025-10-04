export const Suit = {
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
  SPADES: '♠'
} as const;

export type Suit = typeof Suit[keyof typeof Suit];

export const Rank = {
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  TEN: '10',
  JACK: 'J',
  QUEEN: 'Q',
  KING: 'K',
  ACE: 'A'
} as const;

export type Rank = typeof Rank[keyof typeof Rank];

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export const PlayerAction = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
  ALL_IN: 'all_in',
  SMALL_BLIND: 'small_blind',
  BIG_BLIND: 'big_blind'
} as const;

export type PlayerAction = typeof PlayerAction[keyof typeof PlayerAction];

export const PlayerPosition = {
  DEALER: 'dealer',
  SMALL_BLIND: 'small_blind',
  BIG_BLIND: 'big_blind',
  EARLY: 'early',
  MIDDLE: 'middle',
  LATE: 'late'
} as const;

export type PlayerPosition = typeof PlayerPosition[keyof typeof PlayerPosition];

export interface AIPersonality {
  aggressiveness: number; // 0-1 (0 = very tight, 1 = very aggressive)
  bluffFrequency: number; // 0-1 (0 = never bluffs, 1 = bluffs often)
  foldThreshold: number; // 0-1 (0 = folds easily, 1 = never folds)
  raiseBias: number; // 0-1 (0 = prefers calling, 1 = prefers raising)
  name?: string; // Optional custom AI name
  preflopRange?: string; // Reference to predefined range key
  customRanges?: {
    preflop?: AIRange;
    postflop?: AIRange;
  };
}

export interface AIRange {
  name: string;
  hands: Array<{
    hand: string;
    frequency: number; // 0-1 probability of playing this hand
    action: 'fold' | 'call' | 'raise'; // Preferred action for this hand
  }>;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  chips: number;
  currentBet: number;
  totalBetThisRound: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isEliminated: boolean;
  isDealer: boolean;
  position: PlayerPosition;
  lastAction?: PlayerAction;
  isHuman: boolean;
  aiPersonality?: AIPersonality;
}

export interface BettingRound {
  phase: 'preflop' | 'flop' | 'turn' | 'river';
  currentPlayer: number;
  lastRaisePlayer: number | null;
  minRaise: number;
  completed: boolean;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: Array<{ amount: number; eligiblePlayers: string[] }>;
  currentPlayer: number;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'hand_complete';
  bettingRound: BettingRound;
  deck: Card[];
  blinds: {
    smallBlind: number;
    bigBlind: number;
    ante?: number;
  };
  handNumber: number;
  waitingForPlayerAction: boolean;
  maxPlayers: number;
  gameSettings?: GameSettings;
}

export const HandRanking = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
} as const;

export type HandRanking = typeof HandRanking[keyof typeof HandRanking];

export interface HandEvaluation {
  ranking: HandRanking;
  description: string;
  cards: Card[];
  winningCards?: Card[]; // The specific cards that create the winning hand
}

export interface HandHistory {
  handNumber: number;
  winner: {
    playerId: string;
    playerName: string;
    hand: Card[];
    evaluation: HandEvaluation;
    amountWon: number;
  } | null;
  communityCards: Card[];
  finalPot: number;
  playerHands: Array<{
    playerId: string;
    playerName: string;
    hand: Card[];
    evaluation?: HandEvaluation;
    finalChips: number;
    actions: Array<{
      action: PlayerAction;
      amount?: number;
      phase: 'preflop' | 'flop' | 'turn' | 'river';
    }>;
  }>;
  timestamp: number;
}

export interface GameSession {
  sessionId: string;
  startTime: number;
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  biggestPot: number;
  history: HandHistory[];
}

export const GameType = {
  CASH: 'cash',
  MTT: 'mtt'
} as const;

export type GameType = typeof GameType[keyof typeof GameType];

export const BettingDisplayMode = {
  BIG_BLINDS: 'big_blinds',
  BASE_AMOUNT: 'base_amount'
} as const;

export type BettingDisplayMode = typeof BettingDisplayMode[keyof typeof BettingDisplayMode];

export interface GameSettings {
  gameType: GameType;
  playerCount: number;
  startingStack: number;
  smallBlind: number;
  bigBlind: number;
  bettingDisplayMode: BettingDisplayMode;
  ante?: number; // For MTT
  blindLevels?: Array<{
    level: number;
    smallBlind: number;
    bigBlind: number;
    ante?: number;
    duration?: number; // in minutes
  }>; // For MTT
  aiPersonalities?: AIPersonality[]; // AI player configurations
}
