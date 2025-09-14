import { useEffect } from 'react';
import { useGameContext } from './useGameContext';
import { useAIActions } from './useGameActions';

/**
 * Hook that automatically handles AI player actions
 */
export function useAIAutomation() {
  const { gameState } = useGameContext();
  const { processAIAction } = useAIActions();

  useEffect(() => {
    if (!gameState.waitingForPlayerAction && gameState.currentPlayer >= 0) {
      const currentPlayer = gameState.players[gameState.currentPlayer];
      
      if (!currentPlayer.isHuman && !currentPlayer.hasFolded && !currentPlayer.isAllIn) {
        const timer = setTimeout(() => {
          processAIAction();
        }, 1000); // 1 second delay for AI action
        
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.currentPlayer, gameState.waitingForPlayerAction, gameState.players, processAIAction]);

  // Return current AI player info for display
  return {
    currentAIPlayer: gameState.players[gameState.currentPlayer],
    isAITurn: !gameState.waitingForPlayerAction && 
              gameState.currentPlayer >= 0 && 
              !gameState.players[gameState.currentPlayer]?.isHuman
  };
}
