import { useReducer } from 'react';
import type { GameAction, GameContextState, GameContextType, GameProviderProps } from './GameTypes';
import { GameContext } from './gameContext';
import { initializeGame } from '../services/gameService';

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

    case 'UPDATE_GAME_STATE_AND_SHOWDOWN': {
      return {
        ...state,
        gameState: { ...state.gameState, ...action.payload.gameState },
        showdown: action.payload.showdown,
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

// Provider component
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
