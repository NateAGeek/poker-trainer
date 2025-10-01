import { createContext } from 'react';
import type { GameContextType } from './GameTypes';

// Create the context
export const GameContext = createContext<GameContextType | undefined>(undefined);