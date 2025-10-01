import type { ReactNode } from 'react';
import type { GameState, PlayerAction } from '../types/poker';

// Action types for the game state reducer
export type GameAction = 
  | { type: 'INITIALIZE_GAME'; payload: { playerCount: number } }
  | { type: 'PLAYER_ACTION'; payload: { action: PlayerAction; amount?: number } }
  | { type: 'ADVANCE_BETTING_ROUND' }
  | { type: 'ADVANCE_GAME_PHASE' }
  | { type: 'REVEAL_COMMUNITY_CARDS'; payload: { count: number } }
  | { type: 'SET_SHOWDOWN'; payload: { showdown: boolean } }
  | { type: 'UPDATE_GAME_STATE_AND_SHOWDOWN'; payload: { gameState: Partial<GameState>; showdown: boolean } }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> };

// Game context state interface
export interface GameContextState {
  gameState: GameState;
  playerCount: number;
  revealedCommunityCards: number;
  showdown: boolean;
}

// Game context interface
export interface GameContextType extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
}

// Provider component props
export interface GameProviderProps {
  children: ReactNode;
}