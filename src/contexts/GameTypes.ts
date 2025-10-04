import type { ReactNode } from 'react';
import type { GameState, PlayerAction, GameSettings, HandHistory, GameSession } from '../types/poker';

// Action types for the game state reducer
export type GameAction = 
  | { type: 'INITIALIZE_GAME'; payload: { playerCount: number; gameSettings?: GameSettings } }
  | { type: 'PLAYER_ACTION'; payload: { action: PlayerAction; amount?: number } }
  | { type: 'ADVANCE_BETTING_ROUND' }
  | { type: 'ADVANCE_GAME_PHASE' }
  | { type: 'REVEAL_COMMUNITY_CARDS'; payload: { count: number } }
  | { type: 'SET_SHOWDOWN'; payload: { showdown: boolean } }
  | { type: 'UPDATE_GAME_STATE_AND_SHOWDOWN'; payload: { gameState: Partial<GameState>; showdown: boolean } }
  | { type: 'UPDATE_GAME_SETTINGS'; payload: { gameSettings: GameSettings } }
  | { type: 'RESET_GAME' }
  | { type: 'NEW_HAND' }
  | { type: 'COMPLETE_HAND'; payload: { handHistory: HandHistory } }
  | { type: 'RESET_SESSION' }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> };

// Game context state interface
export interface GameContextState {
  gameState: GameState;
  gameSettings: GameSettings;
  playerCount: number;
  revealedCommunityCards: number;
  showdown: boolean;
  gameSession: GameSession;
}

// Game context interface
export interface GameContextType extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
}

// Provider component props
export interface GameProviderProps {
  children: ReactNode;
}