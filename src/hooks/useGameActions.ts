import { useCallback } from 'react';
import type { PlayerAction, Player } from '../types/poker';
import { PlayerAction as Action } from '../types/poker';
import { useGameContext } from './useGameContext';
import { 
  getNextActivePlayer, 
  isBettingRoundComplete,
  makeAIDecision
} from '../utils/bettingUtils';
import { collectBets } from '../utils/potUtils';
import { getNextGamePhase, getCardsForPhase } from '../services/gameService';

/**
 * Hook for handling player actions (betting, folding, etc.)
 */
export function usePlayerActions() {
  const { gameState, dispatch } = useGameContext();

  const getAvailableActions = useCallback((player: Player): PlayerAction[] => {
    const actions: PlayerAction[] = [];
    const maxBet = Math.max(...gameState.players.map(p => p.currentBet));
    
    if (player.currentBet < maxBet) {
      actions.push(Action.FOLD);
      if (player.chips >= maxBet - player.currentBet) {
        actions.push(Action.CALL);
      }
      if (player.chips >= gameState.bettingRound.minRaise) {
        actions.push(Action.RAISE);
      }
    } else {
      actions.push(Action.CHECK);
      if (player.chips >= gameState.bettingRound.minRaise) {
        actions.push(Action.BET);
      }
    }
    
    if (player.chips > 0) {
      actions.push(Action.ALL_IN);
    }
    
    return actions;
  }, [gameState.players, gameState.bettingRound.minRaise]);

  const handlePlayerAction = useCallback((action: PlayerAction, amount?: number) => {
    const newState = { ...gameState };
    const currentPlayer = newState.players[newState.currentPlayer];
    const maxBet = Math.max(...newState.players.map(p => p.currentBet));
    
    // Process the action
    switch (action) {
      case Action.FOLD: {
        currentPlayer.hasFolded = true;
        currentPlayer.lastAction = action;
        break;
      }
        
      case Action.CHECK: {
        currentPlayer.lastAction = action;
        break;
      }
        
      case Action.CALL: {
        const callAmount = Math.min(maxBet - currentPlayer.currentBet, currentPlayer.chips);
        currentPlayer.chips -= callAmount;
        currentPlayer.currentBet += callAmount;
        currentPlayer.lastAction = action;
        if (currentPlayer.chips === 0) currentPlayer.isAllIn = true;
        break;
      }
        
      case Action.BET:
      case Action.RAISE: {
        const betAmount = amount || gameState.blinds.bigBlind;
        const totalBet = action === Action.RAISE ? maxBet + betAmount : betAmount;
        const actualBet = Math.min(totalBet - currentPlayer.currentBet, currentPlayer.chips);
        
        currentPlayer.chips -= actualBet;
        currentPlayer.currentBet += actualBet;
        currentPlayer.lastAction = action;
        if (currentPlayer.chips === 0) currentPlayer.isAllIn = true;
        
        newState.bettingRound.lastRaisePlayer = newState.currentPlayer;
        newState.bettingRound.minRaise = Math.max(actualBet, newState.blinds.bigBlind);
        break;
      }
        
      case Action.ALL_IN: {
        currentPlayer.currentBet += currentPlayer.chips;
        currentPlayer.chips = 0;
        currentPlayer.isAllIn = true;
        currentPlayer.lastAction = action;
        break;
      }
    }
    
    // Check if betting round is complete
    if (isBettingRoundComplete(newState.players, newState.bettingRound)) {
      // Collect bets and move to next phase
      const { players: updatedPlayers, collectedAmount } = collectBets(newState.players);
      newState.players = updatedPlayers;
      newState.pot += collectedAmount;
      
      // Move to next phase or showdown
      const nextPhase = getNextGamePhase(newState.gamePhase);
      newState.gamePhase = nextPhase;
      
      if (nextPhase === 'showdown') {
        // Update waiting state for showdown
        newState.waitingForPlayerAction = false;
        
        // Use the combined action to update game state and set showdown atomically
        dispatch({ 
          type: 'UPDATE_GAME_STATE_AND_SHOWDOWN', 
          payload: { 
            gameState: newState,
            showdown: true
          } 
        });
        
        return; // Early return to avoid duplicate dispatch
      } else {
        // Set up next betting round
        dispatch({ type: 'REVEAL_COMMUNITY_CARDS', payload: { count: getCardsForPhase(nextPhase) } });
        newState.bettingRound = {
          phase: nextPhase,
          currentPlayer: getNextActivePlayer(newState.players, newState.dealerPosition),
          lastRaisePlayer: null,
          minRaise: newState.blinds.bigBlind,
          completed: false
        };
        newState.currentPlayer = newState.bettingRound.currentPlayer;
      }
    } else {
      // Move to next player
      newState.currentPlayer = getNextActivePlayer(newState.players, newState.currentPlayer);
    }
    
    // Update waiting state
    newState.waitingForPlayerAction = newState.currentPlayer === 0 && !newState.players[0].hasFolded && !newState.players[0].isAllIn;
    
    dispatch({ type: 'UPDATE_GAME_STATE', payload: newState });
  }, [gameState, dispatch]);

  return {
    getAvailableActions,
    handlePlayerAction
  };
}

/**
 * Hook for AI-related functionality
 */
export function useAIActions() {
  const { gameState } = useGameContext();
  const { handlePlayerAction, getAvailableActions } = usePlayerActions();

  const processAIAction = useCallback(() => {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const availableActions = getAvailableActions(currentPlayer);
    const maxBet = Math.max(...gameState.players.map(p => p.currentBet));
    
    // Get visible community cards for AI decision
    const getVisibleCommunityCards = () => {
      // This would be determined by game phase
      switch (gameState.gamePhase) {
        case 'preflop': return [];
        case 'flop': return gameState.communityCards.slice(0, 3);
        case 'turn': return gameState.communityCards.slice(0, 4);
        case 'river': return gameState.communityCards.slice(0, 5);
        default: return gameState.communityCards;
      }
    };
    
    const decision = makeAIDecision(
      currentPlayer,
      { pot: gameState.pot, blinds: gameState.blinds, communityCards: getVisibleCommunityCards() },
      availableActions,
      maxBet,
      currentPlayer.chips
    );
    
    handlePlayerAction(decision.action, decision.amount);
  }, [gameState, getAvailableActions, handlePlayerAction]);

  return {
    processAIAction
  };
}

/**
 * Hook for game control actions (start new hand, change player count, etc.)
 */
export function useGameControls() {
  const { dispatch } = useGameContext();

  const initializeNewGame = useCallback((playerCount: number) => {
    dispatch({ type: 'INITIALIZE_GAME', payload: { playerCount } });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  const revealCommunityCards = useCallback((count: number) => {
    dispatch({ type: 'REVEAL_COMMUNITY_CARDS', payload: { count } });
  }, [dispatch]);

  const setShowdown = useCallback((showdown: boolean) => {
    dispatch({ type: 'SET_SHOWDOWN', payload: { showdown } });
  }, [dispatch]);

  return {
    initializeNewGame,
    resetGame,
    revealCommunityCards,
    setShowdown
  };
}
