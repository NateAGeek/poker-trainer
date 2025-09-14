import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import type { GameContextType } from '../contexts/GameContext';

/**
 * Custom hook to use the game context
 */
export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
