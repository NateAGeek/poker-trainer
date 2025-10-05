import { useEffect } from 'react';
import { useGameContext } from './useGameContext';
import { useAIActions } from './useGameActions';
import { useAIPlayer } from './useAIPlayer';

/**
 * Hook that automatically handles AI player actions
 */
export function useAIAutomation() {
  const { gameState } = useGameContext();
  const { processAIAction } = useAIActions();
  const { currentAIPlayer, isAITurn } = useAIPlayer();

  useEffect(() => {
    // Don't process AI actions if not AI's turn or game is in showdown
    if (isAITurn && currentAIPlayer) {
      console.log('AI will act in 1 second for player:', currentAIPlayer.name);
      const timer = setTimeout(() => {
        console.log('Processing AI action for player:', currentAIPlayer.name);
        processAIAction();
      }, 1000); // 1 second delay for AI action
      
      return () => {
        console.log('Clearing AI timer for player:', currentAIPlayer.name);
        clearTimeout(timer);
      };
    }
  }, [
    gameState.currentPlayer, 
    isAITurn,
    currentAIPlayer,
    processAIAction
  ]);

  // Return current AI player info for display
  return {
    currentAIPlayer,
    isAITurn
  };
}
