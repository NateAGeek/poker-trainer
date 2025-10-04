import { useReducer, useEffect } from 'react';
import type { GameAction, GameContextState, GameContextType, GameProviderProps } from './GameTypes';
import { GameContext } from './gameContext';
import { initializeGame, startNewHand } from '../services/gameService';
import { GameType, BettingDisplayMode } from '../types/poker';
import type { GameSettings } from '../types/poker';
import { 
  createNewSession, 
  loadSession, 
  saveSession, 
  loadGameSettings, 
  saveGameSettings,
  updateSessionStats 
} from '../utils/sessionUtils';

// Default game settings
const defaultGameSettings: GameSettings = {
  gameType: GameType.CASH,
  playerCount: 6,
  startingStack: 1000,
  smallBlind: 25,
  bigBlind: 50,
  bettingDisplayMode: BettingDisplayMode.BASE_AMOUNT,
};

// Create initial session and settings (will be overridden by loaded data)
const createInitialState = (): GameContextState => {
  const savedSettings = loadGameSettings();
  const savedSession = loadSession();
  const settings = savedSettings || defaultGameSettings;
  const session = savedSession || createNewSession();

  return {
    gameState: initializeGame(settings.playerCount, undefined, settings),
    gameSettings: settings,
    playerCount: settings.playerCount,
    revealedCommunityCards: 0,
    showdown: false,
    gameSession: session,
  };
};

// Initial state
const initialGameState: GameContextState = createInitialState();

// Game state reducer
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const { playerCount, gameSettings } = action.payload;
      const newSettings = gameSettings || state.gameSettings;
      
      // Save settings when changed
      saveGameSettings(newSettings);
      
      return {
        ...state,
        gameState: initializeGame(playerCount, undefined, newSettings),
        gameSettings: newSettings,
        playerCount,
        revealedCommunityCards: 0,
        showdown: false,
      };
    }

    case 'UPDATE_GAME_SETTINGS': {
      const { gameSettings } = action.payload;
      
      // Save settings
      saveGameSettings(gameSettings);
      
      return {
        ...state,
        gameSettings,
        gameState: initializeGame(gameSettings.playerCount, undefined, gameSettings),
        playerCount: gameSettings.playerCount,
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

    case 'COMPLETE_HAND': {
      const { handHistory } = action.payload;
      const humanPlayerId = 'player1'; // Human is always player1
      const updatedSession = updateSessionStats(state.gameSession, handHistory, humanPlayerId);
      
      // Save updated session
      saveSession(updatedSession);
      
      return {
        ...state,
        gameSession: updatedSession,
      };
    }

    case 'NEW_HAND': {
      const newGameState = startNewHand(state.gameState, state.gameSettings);
      
      return {
        ...state,
        gameState: newGameState,
        revealedCommunityCards: 0,
        showdown: false,
      };
    }

    case 'RESET_GAME': {
      return {
        ...state,
        gameState: initializeGame(state.playerCount, state.gameState.dealerPosition, state.gameSettings),
        revealedCommunityCards: 0,
        showdown: false,
      };
    }

    case 'RESET_SESSION': {
      const newSession = createNewSession();
      
      // Save new session
      saveSession(newSession);
      
      return {
        ...state,
        gameState: initializeGame(state.playerCount, undefined, state.gameSettings),
        gameSession: newSession,
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

  // Auto-save session data on state changes
  useEffect(() => {
    saveSession(state.gameSession);
  }, [state.gameSession]);

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
