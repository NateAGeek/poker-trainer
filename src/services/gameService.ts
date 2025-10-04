import type { GameState, Player, GameSettings, Card } from '../types/poker';
import { PlayerPosition as Pos } from '../types/poker';
import { createDeck, shuffleDeck, dealCards } from '../utils/pokerUtils';
import { 
  calculatePositions, 
  getBlindPositions, 
  postBlinds, 
  getNextActivePlayer,
  AI_PERSONALITIES
} from '../utils/gameUtils';
import { getNextDealerPosition } from '../utils/positionUtils';

/**
 * Initialize a new poker game with the specified number of players and settings
 */
export function initializeGame(
  numPlayers: number, 
  previousDealerPosition?: number, 
  gameSettings?: GameSettings,
  handNumber?: number
): GameState {
  const shuffledDeck = shuffleDeck(createDeck());
  let remainingDeck = shuffledDeck;
  
  // Use provided settings or defaults
  const settings = gameSettings || {
    gameType: 'cash' as const,
    playerCount: numPlayers,
    startingStack: 1000,
    smallBlind: 25,
    bigBlind: 50,
    bettingDisplayMode: 'base_amount' as const,
  };
  
  // Create players with full properties
  const players: Player[] = [];
  const aiPersonalities = gameSettings?.aiPersonalities || Object.values(AI_PERSONALITIES);
  
  for (let i = 0; i < numPlayers; i++) {
    const { dealtCards, remainingDeck: newDeck } = dealCards(remainingDeck, 2);
    remainingDeck = newDeck;
    
    players.push({
      id: `player${i + 1}`,
      name: i === 0 ? 'You' : `Player ${i + 1}`,
      hand: dealtCards,
      chips: settings.startingStack,
      currentBet: 0,
      totalBetThisRound: 0,
      hasFolded: false,
      isAllIn: false,
      isEliminated: false,
      isDealer: false,
      position: Pos.EARLY, // Will be set properly below
      isHuman: i === 0,
      aiPersonality: i === 0 ? undefined : aiPersonalities[Math.min(i - 1, aiPersonalities.length - 1)]
    });
  }

  // Set dealer position - advance from previous if provided, otherwise start at last player
  const dealerPosition = previousDealerPosition !== undefined 
    ? getNextDealerPosition(previousDealerPosition, numPlayers)
    : numPlayers - 1;
    
  const playersWithPositions = calculatePositions(players, dealerPosition);
  const { smallBlind: sbPos, bigBlind: bbPos } = getBlindPositions(playersWithPositions, dealerPosition);
  
  // Post blinds using settings values
  const { players: playersAfterBlinds, pot } = postBlinds(
    playersWithPositions, 
    sbPos, 
    bbPos, 
    settings.smallBlind,
    settings.bigBlind
  );

  // Deal community cards
  const { dealtCards: communityCards, remainingDeck: finalDeck } = dealCards(remainingDeck, 5);

  // Set up betting round
  const bettingRound = {
    phase: 'preflop' as const,
    currentPlayer: getNextActivePlayer(playersAfterBlinds, bbPos),
    lastRaisePlayer: bbPos,
    minRaise: settings.bigBlind,
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
      smallBlind: settings.smallBlind,
      bigBlind: settings.bigBlind,
      ante: settings.ante
    },
    handNumber: handNumber || 1,
    waitingForPlayerAction: bettingRound.currentPlayer === 0,
    maxPlayers: numPlayers,
    gameSettings: settings
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

/**
 * Start a new hand with existing players
 */
export function startNewHand(
  currentGameState: GameState,
  gameSettings: GameSettings
): GameState {
  const shuffledDeck = shuffleDeck(createDeck());
  let remainingDeck = shuffledDeck;
  
  // Mark players with 0 chips as eliminated
  const playersWithEliminationCheck = currentGameState.players.map(player => ({
    ...player,
    isEliminated: player.chips <= 0 || player.isEliminated
  }));
  
  // Only keep non-eliminated players for the new hand
  const activePlayers = playersWithEliminationCheck.filter(player => !player.isEliminated);
  
  // Check if game should end (only 1 or fewer active players)
  if (activePlayers.length <= 1) {
    // Game over - return current state but mark as such
    return {
      ...currentGameState,
      players: playersWithEliminationCheck,
      gamePhase: 'hand_complete' as const
    };
  }
  
  // Reset hand-specific properties for active players only
  const resetPlayers = activePlayers.map(player => ({
    ...player,
    hand: [] as Card[],
    currentBet: 0,
    totalBetThisRound: 0,
    hasFolded: false,
    isAllIn: false,
    lastAction: undefined
  }));

  // Deal new cards only to active players
  for (let i = 0; i < resetPlayers.length; i++) {
    const { dealtCards, remainingDeck: newDeck } = dealCards(remainingDeck, 2);
    resetPlayers[i].hand = dealtCards;
    remainingDeck = newDeck;
  }

  // Use active players for position calculation
  const newDealerPosition = getNextDealerPosition(currentGameState.dealerPosition, resetPlayers.length);
  const playersWithPositions = calculatePositions(resetPlayers, newDealerPosition);
  const { smallBlind: sbPos, bigBlind: bbPos } = getBlindPositions(playersWithPositions, newDealerPosition);
  
  // Post blinds using settings values
  const { players: playersAfterBlinds, pot } = postBlinds(
    playersWithPositions, 
    sbPos, 
    bbPos, 
    gameSettings.smallBlind,
    gameSettings.bigBlind
  );

  // Deal community cards
  const { dealtCards: communityCards, remainingDeck: finalDeck } = dealCards(remainingDeck, 5);

  // Set up betting round
  const bettingRound = {
    phase: 'preflop' as const,
    currentPlayer: getNextActivePlayer(playersAfterBlinds, bbPos),
    lastRaisePlayer: bbPos,
    minRaise: gameSettings.bigBlind,
    completed: false
  };

  // Combine active players (who got new cards) with eliminated players (who stay eliminated)
  const eliminatedPlayers = playersWithEliminationCheck.filter(player => player.isEliminated);
  const allPlayers = [...playersAfterBlinds, ...eliminatedPlayers];

  return {
    ...currentGameState,
    players: allPlayers,
    communityCards,
    pot,
    sidePots: [],
    currentPlayer: bettingRound.currentPlayer,
    dealerPosition: newDealerPosition,
    smallBlindPosition: sbPos,
    bigBlindPosition: bbPos,
    gamePhase: 'preflop' as const,
    bettingRound,
    deck: finalDeck,
    blinds: {
      smallBlind: gameSettings.smallBlind,
      bigBlind: gameSettings.bigBlind,
      ante: gameSettings.ante
    },
    handNumber: currentGameState.handNumber + 1,
    waitingForPlayerAction: bettingRound.currentPlayer === 0,
    gameSettings: gameSettings
  };
}
