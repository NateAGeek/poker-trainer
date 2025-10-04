# Multi-Round Game Implementation

## Overview
The poker game has been upgraded to support multiple rounds with persistent session data that survives browser restarts.

## New Features

### 1. Multiple Rounds Support
- **Continuous Play**: After each hand completion, players can click "Deal New Hand" to start the next round
- **Dealer Button Rotation**: The dealer position properly advances after each hand
- **Hand Numbering**: Each hand is tracked with an incrementing hand number
- **Persistent State**: Game state and session data are automatically saved to localStorage

### 2. Session Management
- **Session Statistics**: Track wins, losses, win rate, total winnings, and biggest pot
- **Hand History**: Complete history of all hands played in the current session
- **Persistent Data**: Session data survives browser restarts and page refreshes
- **Session Duration**: Track how long you've been playing

### 3. Enhanced Game Settings
- **Reset Session**: New option in settings to completely reset session data
- **Confirmation Dialog**: Safety confirmation before resetting session data
- **Settings Persistence**: Game settings are saved and restored automatically

### 4. New Session Statistics Tab
- **Real-time Stats**: Live updating statistics as you play
- **Visual Indicators**: Color-coded positive/negative performance indicators
- **Recent Hands**: Quick view of the last 5 hands played
- **Comprehensive Metrics**: Win rate, total winnings, average pot size, etc.

## Technical Implementation

### Session Storage
- **localStorage**: Used to persist session data and game settings
- **Automatic Saving**: Data is saved automatically on state changes
- **Error Handling**: Graceful fallback if localStorage is unavailable

### State Management
- **New Actions**: Added `NEW_HAND`, `COMPLETE_HAND`, and `RESET_SESSION` actions
- **Session Context**: Extended game context to include session data
- **Hand History Creation**: Automatic creation of hand records for statistics

### Data Structures
```typescript
interface GameSession {
  sessionId: string;
  startTime: number;
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  biggestPot: number;
  history: HandHistory[];
}

interface HandHistory {
  handNumber: number;
  winner: { /* winner details */ } | null;
  communityCards: Card[];
  finalPot: number;
  playerHands: Array<{ /* player hand data */ }>;
  timestamp: number;
}
```

## Usage Guide

### Starting a New Hand
1. Play a hand until completion (showdown)
2. Click "Deal New Hand" in the Actions tab
3. The dealer button advances and a new hand begins

### Viewing Statistics
1. Navigate to the "Session" tab in the game interface
2. View real-time statistics including:
   - Hands played and won
   - Win rate percentage
   - Total winnings/losses
   - Biggest pot achieved
   - Recent hand history

### Resetting Session
1. Click the Settings button (⚙️) in the game header
2. Go to the "Advanced" tab
3. Click "Reset Session" button
4. Confirm the action to clear all session data

### Game Persistence
- Your game automatically saves progress
- Refresh the page or restart the browser - your session continues
- Settings are remembered between sessions
- Only manual reset clears session data

## File Structure
```
src/
├── utils/
│   ├── sessionUtils.ts          # Session management utilities
│   └── handHistoryUtils.ts      # Hand completion and history tracking
├── components/
│   ├── GameTabs/
│   │   └── SessionStatsTab/     # New session statistics display
│   └── GameSettings/            # Enhanced with reset session option
└── contexts/
    ├── GameTypes.ts             # Extended with session types
    └── GameProvider.tsx         # Updated with session management
```

## Future Enhancements
- Tournament mode with blind level progression
- Detailed action tracking for each hand
- Export session data functionality
- Advanced statistics and charts
- Multi-session comparison