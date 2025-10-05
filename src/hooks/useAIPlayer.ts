import { useCallback, useMemo } from 'react';
import { useGameContext } from './useGameContext';
import type { 
  AIPersonality, 
  AIRange, 
  Player, 
  PlayerAction, 
  Card 
} from '../types/poker';
import { 
  makeAIDecision, 
  AI_PERSONALITIES 
} from '../utils/gameUtils';
import { 
  PREDEFINED_AI_RANGES,
  handToRangeNotation,
  shouldPlayHand,
  getAIRangeForPosition,
  saveCustomAIRange,
  loadCustomAIRanges,
  deleteCustomAIRange
} from '../utils/aiRangeUtils';

/**
 * Consolidated hook for all AI player functionality
 * Manages AI ranges, decision-making, and actions
 */
export function useAIPlayer() {
  const { gameState, dispatch } = useGameContext();

  // ===========================================
  // AI Range Management
  // ===========================================

  const predefinedRanges = useMemo(() => PREDEFINED_AI_RANGES, []);
  
  const customRanges = useMemo(() => loadCustomAIRanges(), []);

  const allRanges = useMemo(() => ({
    ...predefinedRanges,
    ...customRanges
  }), [predefinedRanges, customRanges]);

  const saveRange = useCallback((name: string, range: AIRange) => {
    saveCustomAIRange(name, range);
  }, []);

  const deleteRange = useCallback((name: string) => {
    deleteCustomAIRange(name);
  }, []);

  const getRangeForPlayer = useCallback((player: Player): AIRange | undefined => {
    if (!player.aiPersonality) return undefined;
    
    return getAIRangeForPosition(
      player.aiPersonality,
      player.position,
      gameState.players.length
    );
  }, [gameState.players.length]);

  // ===========================================
  // AI Decision Making
  // ===========================================

  const checkHandInRange = useCallback((
    hand: Card[],
    personality: AIPersonality
  ): { shouldPlay: boolean; action: 'fold' | 'call' | 'raise'; frequency: number } => {
    const aiRange = personality.customRanges?.preflop || 
                    (personality.preflopRange ? allRanges[personality.preflopRange] : undefined);
    
    return shouldPlayHand(hand, aiRange, personality);
  }, [allRanges]);

  const getHandNotation = useCallback((hand: Card[]): string => {
    return handToRangeNotation(hand);
  }, []);

  const makeDecision = useCallback((
    player: Player,
    availableActions: PlayerAction[],
    maxBet: number
  ): { action: PlayerAction; amount?: number } => {
    const minBet = Math.max(...gameState.players.map(p => p.currentBet));
    
    // Get visible community cards based on game phase
    const getVisibleCommunityCards = () => {
      switch (gameState.gamePhase) {
        case 'preflop': return [];
        case 'flop': return gameState.communityCards.slice(0, 3);
        case 'turn': return gameState.communityCards.slice(0, 4);
        case 'river': return gameState.communityCards.slice(0, 5);
        default: return gameState.communityCards;
      }
    };

    return makeAIDecision(
      player,
      {
        pot: gameState.pot,
        blinds: gameState.blinds,
        communityCards: getVisibleCommunityCards()
      },
      availableActions,
      minBet,
      maxBet
    );
  }, [gameState.players, gameState.gamePhase, gameState.communityCards, gameState.pot, gameState.blinds]);

  // ===========================================
  // AI Action Processing
  // ===========================================

  const processAIAction = useCallback((
    player: Player,
    availableActions: PlayerAction[]
  ): { action: PlayerAction; amount?: number } => {
    return makeDecision(player, availableActions, player.chips);
  }, [makeDecision]);

  // ===========================================
  // AI Personalities
  // ===========================================

  const personalities = useMemo(() => AI_PERSONALITIES, []);

  const getPersonality = useCallback((key: string): AIPersonality | undefined => {
    return AI_PERSONALITIES[key];
  }, []);

  const updatePlayerPersonality = useCallback((
    playerIndex: number,
    personality: AIPersonality
  ) => {
    const updatedPlayers = [...gameState.players];
    if (updatedPlayers[playerIndex]) {
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        aiPersonality: personality
      };
      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: { ...gameState, players: updatedPlayers }
      });
    }
  }, [gameState, dispatch]);

  // ===========================================
  // AI Player Info
  // ===========================================

  const currentAIPlayer = useMemo(() => {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    return currentPlayer && !currentPlayer.isHuman ? currentPlayer : null;
  }, [gameState.currentPlayer, gameState.players]);

  const isAITurn = useMemo(() => {
    return !gameState.waitingForPlayerAction && 
           gameState.currentPlayer >= 0 && 
           gameState.gamePhase !== 'showdown' &&
           currentAIPlayer !== null;
  }, [gameState.waitingForPlayerAction, gameState.currentPlayer, gameState.gamePhase, currentAIPlayer]);

  const aiPlayers = useMemo(() => {
    return gameState.players.filter(p => !p.isHuman);
  }, [gameState.players]);

  // ===========================================
  // AI Statistics
  // ===========================================

  const getAIStats = useCallback((playerId: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || player.isHuman) return null;

    return {
      name: player.name,
      chips: player.chips,
      personality: player.aiPersonality,
      range: getRangeForPlayer(player),
      isActive: !player.hasFolded && !player.isEliminated,
      isAllIn: player.isAllIn,
      position: player.position,
      lastAction: player.lastAction
    };
  }, [gameState.players, getRangeForPlayer]);

  // ===========================================
  // Return API
  // ===========================================

  return {
    // Range management
    predefinedRanges,
    customRanges,
    allRanges,
    saveRange,
    deleteRange,
    getRangeForPlayer,
    
    // Decision making
    checkHandInRange,
    getHandNotation,
    makeDecision,
    processAIAction,
    
    // Personalities
    personalities,
    getPersonality,
    updatePlayerPersonality,
    
    // AI player info
    currentAIPlayer,
    isAITurn,
    aiPlayers,
    getAIStats
  };
}

/**
 * Type for the return value of useAIPlayer hook
 */
export type UseAIPlayerReturn = ReturnType<typeof useAIPlayer>;
