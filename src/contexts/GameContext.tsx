import React, { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState, PlayerAction } from '../types/poker';
import { initializeGame } from '../services/gameService';

// Action types for the game state reducer
export type GameAction = 
  | { type: 'INITIALIZE_GAME'; payload: { playerCount: number } }
  | { type: 'PLAYER_ACTION'; payload: { action: PlayerAction; amount?: number } }
  | { type: 'ADVANCE_BETTING_ROUND' }
  | { type: 'ADVANCE_GAME_PHASE' }
  | { type: 'REVEAL_COMMUNITY_CARDS'; payload: { count: number } }
  | { type: 'SET_SHOWDOWN'; payload: { showdown: boolean } }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> };

// Game context state interface
interface GameContextState {
  gameState: GameState;
  playerCount: number;
  revealedCommunityCards: number;
  showdown: boolean;
}

// Game context interface
export interface GameContextType extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
}

// Initial state
const initialGameState: GameContextState = {
  gameState: initializeGame(6),
  playerCount: 6,
  revealedCommunityCards: 0,
  showdown: false,
};

// Game state reducer
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const { playerCount } = action.payload;
      return {
        ...state,
        gameState: initializeGame(playerCount),
        playerCount,
        revealedCommunityCards: 0,
        showdown: false,
      };
    }

    case 'UPDATE_GAME_STATE': {
      return {
        ...state,
        gameState: { ...state.gameState, ...action.payload },
      };
    }

    case 'REVEAL_COMMUNITY_CARDS': {
      return {
        ...state,
        revealedCommunityCards: action.payload.count,
      };
    }

    case 'SET_SHOWDOWN': {
      return {
        ...state,
        showdown: action.payload.showdown,
      };
    }

    case 'RESET_GAME': {
      return {
        ...state,
        gameState: initializeGame(state.playerCount, state.gameState.dealerPosition),
        revealedCommunityCards: 0,
        showdown: false,
      };
    }

    default:
      return state;
  }
}

// Create the context
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const contextValue: GameContextType = {
    ...state,
    dispatch,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}
