import { useEffect, useMemo } from 'react';
import { useGameContext } from './useGameContext';
import { useAIActions } from './useGameActions';

/**
 * Hook that automatically handles AI player actions
 */
export function useAIAutomation() {
  const { gameState } = useGameContext();
  const { processAIAction } = useAIActions();

  // Extract current player to avoid complex dependencies
  const currentPlayer = useMemo(() => {
    return gameState.currentPlayer >= 0 ? gameState.players[gameState.currentPlayer] : null;
  }, [gameState.currentPlayer, gameState.players]);

  useEffect(() => {
    // Don't process AI actions if game is in showdown
    if (!gameState.waitingForPlayerAction && 
        gameState.currentPlayer >= 0 && 
        gameState.gamePhase !== 'showdown' &&
        currentPlayer) {
      
      if (!currentPlayer.isHuman && !currentPlayer.hasFolded && !currentPlayer.isAllIn) {
        console.log('AI will act in 1 second for player:', currentPlayer.name);
        const timer = setTimeout(() => {
          console.log('Processing AI action for player:', currentPlayer.name);
          processAIAction();
        }, 1000); // 1 second delay for AI action
        
        return () => {
          console.log('Clearing AI timer for player:', currentPlayer.name);
          clearTimeout(timer);
        };
      }
    }
  }, [
    gameState.currentPlayer, 
    gameState.waitingForPlayerAction, 
    gameState.gamePhase, 
    currentPlayer,
    processAIAction
  ]);

  // Return current AI player info for display
  return {
    currentAIPlayer: gameState.players[gameState.currentPlayer],
    isAITurn: !gameState.waitingForPlayerAction && 
              gameState.currentPlayer >= 0 && 
              !gameState.players[gameState.currentPlayer]?.isHuman
  };
}
