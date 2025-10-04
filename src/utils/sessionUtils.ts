import type { GameSession, HandHistory, GameSettings } from '../types/poker';

const STORAGE_KEY = 'poker-gto-session';
const SETTINGS_KEY = 'poker-gto-settings';

export function createNewSession(): GameSession {
  return {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    handsPlayed: 0,
    handsWon: 0,
    totalWinnings: 0,
    biggestPot: 0,
    history: []
  };
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveSession(session: GameSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to save session to localStorage:', error);
  }
}

export function loadSession(): GameSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const session = JSON.parse(stored) as GameSession;
      // Validate the session structure
      if (session.sessionId && session.startTime && typeof session.handsPlayed === 'number') {
        return session;
      }
    }
  } catch (error) {
    console.warn('Failed to load session from localStorage:', error);
  }
  return null;
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
}

export function loadGameSettings(): GameSettings | null {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored) as GameSettings;
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return null;
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear session from localStorage:', error);
  }
}

export function updateSessionStats(
  session: GameSession, 
  handHistory: HandHistory, 
  humanPlayerId: string
): GameSession {
  const updatedSession = {
    ...session,
    handsPlayed: session.handsPlayed + 1,
    history: [...session.history, handHistory]
  };

  // Update human player specific stats
  if (handHistory.winner?.playerId === humanPlayerId) {
    updatedSession.handsWon = session.handsWon + 1;
    updatedSession.totalWinnings = session.totalWinnings + handHistory.winner.amountWon;
  }

  // Update biggest pot
  if (handHistory.finalPot > session.biggestPot) {
    updatedSession.biggestPot = handHistory.finalPot;
  }

  return updatedSession;
}

export function calculateWinRate(session: GameSession): number {
  if (session.handsPlayed === 0) return 0;
  return (session.handsWon / session.handsPlayed) * 100;
}

export function calculateSessionDuration(session: GameSession): number {
  return Date.now() - session.startTime;
}

export function formatSessionDuration(duration: number): string {
  const minutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}