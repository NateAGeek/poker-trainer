import type { GameState, Player } from '../types/poker';
import { PlayerPosition as Pos } from '../types/poker';
import { createDeck, shuffleDeck, dealCards } from '../utils/pokerUtils';
import { 
  calculatePositions, 
  getBlindPositions, 
  postBlinds, 
  getNextActivePlayer,
  AI_PERSONALITIES
} from '../utils/bettingUtils';
import { getNextDealerPosition } from '../utils/positionUtils';

/**
 * Initialize a new poker game with the specified number of players
 */
export function initializeGame(numPlayers: number, previousDealerPosition?: number): GameState {
  const shuffledDeck = shuffleDeck(createDeck());
  let remainingDeck = shuffledDeck;
  
  // Create players with full properties
  const players: Player[] = [];
  const aiPersonalities = Object.values(AI_PERSONALITIES);
  
  for (let i = 0; i < numPlayers; i++) {
    const { dealtCards, remainingDeck: newDeck } = dealCards(remainingDeck, 2);
    remainingDeck = newDeck;
    
    players.push({
      id: `player${i + 1}`,
      name: i === 0 ? 'You' : `Player ${i + 1}`,
      hand: dealtCards,
      chips: 1000,
      currentBet: 0,
      totalBetThisRound: 0,
      hasFolded: false,
      isAllIn: false,
      isDealer: false,
      position: Pos.EARLY, // Will be set properly below
      isHuman: i === 0,
      aiPersonality: i === 0 ? undefined : aiPersonalities[i % aiPersonalities.length]
    });
  }

  // Set dealer position - advance from previous if provided, otherwise start at last player
  const dealerPosition = previousDealerPosition !== undefined 
    ? getNextDealerPosition(previousDealerPosition, numPlayers)
    : numPlayers - 1;
    
  const playersWithPositions = calculatePositions(players, dealerPosition);
  const { smallBlind: sbPos, bigBlind: bbPos } = getBlindPositions(playersWithPositions, dealerPosition);
  
  // Post blinds
  const { players: playersAfterBlinds, pot } = postBlinds(
    playersWithPositions, 
    sbPos, 
    bbPos, 
    25, // Small blind
    50  // Big blind
  );

  // Deal community cards
  const { dealtCards: communityCards, remainingDeck: finalDeck } = dealCards(remainingDeck, 5);

  // Set up betting round
  const bettingRound = {
    phase: 'preflop' as const,
    currentPlayer: getNextActivePlayer(playersAfterBlinds, bbPos),
    lastRaisePlayer: bbPos,
    minRaise: 50,
    completed: false
  };

  return {
    players: playersAfterBlinds,
    communityCards,
    pot,
    sidePots: [],
    currentPlayer: bettingRound.currentPlayer,
    dealerPosition,
    smallBlindPosition: sbPos,
    bigBlindPosition: bbPos,
    gamePhase: 'preflop' as const,
    bettingRound,
    deck: finalDeck,
    blinds: {
      smallBlind: 25,
      bigBlind: 50
    },
    handNumber: 1,
    waitingForPlayerAction: bettingRound.currentPlayer === 0,
    maxPlayers: numPlayers
  };
}

/**
 * Get the next game phase
 */
export function getNextGamePhase(currentPhase: string) {
  switch (currentPhase) {
    case 'preflop': return 'flop';
    case 'flop': return 'turn';
    case 'turn': return 'river';
    case 'river': return 'showdown';
    default: return 'showdown';
  }
}

/**
 * Get the number of community cards for a given phase
 */
export function getCardsForPhase(phase: string) {
  switch (phase) {
    case 'flop': return 3;
    case 'turn': return 4;
    case 'river': return 5;
    default: return 5;
  }
}
