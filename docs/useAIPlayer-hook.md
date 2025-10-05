# useAIPlayer Hook Documentation

## Overview

The `useAIPlayer` hook is a consolidated interface for managing all AI player functionality in the poker trainer application. It combines AI range management, decision-making, personality configuration, and player information into a single, easy-to-use hook.

## Features

- **AI Range Management**: Access predefined and custom ranges, save/delete custom ranges
- **Decision Making**: Check hands against ranges, get hand notation, make AI decisions
- **Personality Management**: Access and update AI personalities
- **Player Information**: Get current AI player info, stats, and game state

## Usage

```tsx
import { useAIPlayer } from '../hooks/useAIPlayer';

function MyComponent() {
  const {
    // Range management
    predefinedRanges,
    customRanges,
    allRanges,
    saveRange,
    deleteRange,
    getRangeForPlayer,
    
    // Decision making
    checkHandInRange,
    getHandNotation,
    makeDecision,
    processAIAction,
    
    // Personalities
    personalities,
    getPersonality,
    updatePlayerPersonality,
    
    // AI player info
    currentAIPlayer,
    isAITurn,
    aiPlayers,
    getAIStats
  } = useAIPlayer();
  
  // Use the hook's functionality...
}
```

## API Reference

### Range Management

#### `predefinedRanges`
- **Type**: `Record<string, AIRange>`
- **Description**: All predefined AI ranges (tight, loose, standard, etc.)

#### `customRanges`
- **Type**: `Record<string, AIRange>`
- **Description**: User-created custom ranges loaded from localStorage

#### `allRanges`
- **Type**: `Record<string, AIRange>`
- **Description**: Combined predefined and custom ranges

#### `saveRange(name: string, range: AIRange): void`
- **Description**: Save a custom range to localStorage
- **Example**:
```tsx
const newRange: AIRange = {
  name: "My Custom Range",
  hands: [
    { hand: "AA", frequency: 1.0, action: "raise" },
    { hand: "KK", frequency: 1.0, action: "raise" },
    // ...more hands
  ]
};
saveRange("myCustomRange", newRange);
```

#### `deleteRange(name: string): void`
- **Description**: Delete a custom range from localStorage

#### `getRangeForPlayer(player: Player): AIRange | undefined`
- **Description**: Get the appropriate range for a given player based on their personality and position

### Decision Making

#### `checkHandInRange(hand: Card[], personality: AIPersonality)`
- **Returns**: `{ shouldPlay: boolean; action: 'fold' | 'call' | 'raise'; frequency: number }`
- **Description**: Check if a hand should be played according to the AI's personality and range
- **Example**:
```tsx
const result = checkHandInRange(playerHand, aiPersonality);
if (result.shouldPlay) {
  console.log(`AI should ${result.action} with frequency ${result.frequency}`);
}
```

#### `getHandNotation(hand: Card[]): string`
- **Description**: Convert a hand to standard poker notation (e.g., "AKs", "QQ", "T9o")
- **Example**:
```tsx
const notation = getHandNotation(playerCards); // "AKs"
```

#### `makeDecision(player: Player, availableActions: PlayerAction[], maxBet: number)`
- **Returns**: `{ action: PlayerAction; amount?: number }`
- **Description**: Make an AI decision for a player given available actions
- **Example**:
```tsx
const decision = makeDecision(
  currentPlayer, 
  [Action.FOLD, Action.CALL, Action.RAISE],
  player.chips
);
console.log(`AI decided to ${decision.action}`, decision.amount);
```

#### `processAIAction(player: Player, availableActions: PlayerAction[])`
- **Returns**: `{ action: PlayerAction; amount?: number }`
- **Description**: Process an AI action (simplified version of makeDecision)

### Personality Management

#### `personalities`
- **Type**: `Record<string, AIPersonality>`
- **Description**: All available AI personalities (TIGHT_PASSIVE, LOOSE_AGGRESSIVE, etc.)

#### `getPersonality(key: string): AIPersonality | undefined`
- **Description**: Get a specific personality by key
- **Example**:
```tsx
const aggressive = getPersonality("LOOSE_AGGRESSIVE");
```

#### `updatePlayerPersonality(playerIndex: number, personality: AIPersonality): void`
- **Description**: Update a player's AI personality
- **Example**:
```tsx
updatePlayerPersonality(2, personalities.TIGHT_PASSIVE);
```

### AI Player Information

#### `currentAIPlayer`
- **Type**: `Player | null`
- **Description**: The current AI player whose turn it is (null if human player or no current AI)

#### `isAITurn`
- **Type**: `boolean`
- **Description**: Whether it's currently an AI player's turn

#### `aiPlayers`
- **Type**: `Player[]`
- **Description**: Array of all AI players in the game

#### `getAIStats(playerId: string)`
- **Returns**: `{ name, chips, personality, range, isActive, isAllIn, position, lastAction } | null`
- **Description**: Get comprehensive stats for an AI player
- **Example**:
```tsx
const stats = getAIStats(player.id);
console.log(`${stats.name} has ${stats.chips} chips at position ${stats.position}`);
```

## Example: Building an AI Debug Panel

```tsx
import { useAIPlayer } from '../../hooks/useAIPlayer';

function AIDebugPanel() {
  const {
    currentAIPlayer,
    isAITurn,
    aiPlayers,
    getAIStats,
    getHandNotation,
    checkHandInRange,
    getRangeForPlayer
  } = useAIPlayer();

  if (!currentAIPlayer) {
    return <div>No AI player active</div>;
  }

  const stats = getAIStats(currentAIPlayer.id);
  const range = getRangeForPlayer(currentAIPlayer);
  const handNotation = getHandNotation(currentAIPlayer.hand);
  const rangeCheck = checkHandInRange(
    currentAIPlayer.hand, 
    currentAIPlayer.aiPersonality!
  );

  return (
    <div className="ai-debug-panel">
      <h3>Current AI: {stats?.name}</h3>
      <div>Position: {stats?.position}</div>
      <div>Chips: {stats?.chips}</div>
      <div>Hand: {handNotation}</div>
      <div>Range: {range?.name}</div>
      <div>Should Play: {rangeCheck.shouldPlay ? 'Yes' : 'No'}</div>
      <div>Recommended Action: {rangeCheck.action}</div>
      <div>Frequency: {(rangeCheck.frequency * 100).toFixed(1)}%</div>
      
      <h4>All AI Players</h4>
      <ul>
        {aiPlayers.map(player => {
          const playerStats = getAIStats(player.id);
          return (
            <li key={player.id}>
              {playerStats?.name}: {playerStats?.chips} chips
              {playerStats?.isAllIn && ' (ALL IN)'}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

## Example: Custom Range Editor

```tsx
import { useState } from 'react';
import { useAIPlayer } from '../../hooks/useAIPlayer';
import { RangeMatrix } from '../RangeMatrix';

function CustomRangeEditor() {
  const { allRanges, saveRange, deleteRange, predefinedRanges } = useAIPlayer();
  const [rangeName, setRangeName] = useState('');
  const [selectedHands, setSelectedHands] = useState<string[]>([]);

  const handleSave = () => {
    const newRange = {
      name: rangeName,
      hands: selectedHands.map(hand => ({
        hand,
        frequency: 1.0,
        action: 'raise' as const
      }))
    };
    saveRange(rangeName, newRange);
  };

  return (
    <div>
      <h3>Create Custom Range</h3>
      <input 
        value={rangeName}
        onChange={e => setRangeName(e.target.value)}
        placeholder="Range name"
      />
      
      <RangeMatrix 
        selectedHands={selectedHands}
        onHandSelect={setSelectedHands}
      />
      
      <button onClick={handleSave}>Save Range</button>
      
      <h4>Saved Ranges</h4>
      <ul>
        {Object.keys(allRanges).map(key => (
          <li key={key}>
            {allRanges[key].name}
            {!predefinedRanges[key] && (
              <button onClick={() => deleteRange(key)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Integration with Other Hooks

The `useAIPlayer` hook works seamlessly with other game hooks:

```tsx
import { useGameContext, useAIPlayer, usePlayerActions } from '../../hooks';

function GameComponent() {
  const { gameState } = useGameContext();
  const { currentAIPlayer, isAITurn, processAIAction } = useAIPlayer();
  const { getAvailableActions } = usePlayerActions();
  
  const handleAITurn = () => {
    if (isAITurn && currentAIPlayer) {
      const actions = getAvailableActions(currentAIPlayer);
      const decision = processAIAction(currentAIPlayer, actions);
      // Process decision...
    }
  };
  
  return (
    <div>
      {/* Game UI */}
    </div>
  );
}
```

## Benefits of Consolidation

1. **Single Source of Truth**: All AI logic in one place
2. **Easier Testing**: Mock one hook instead of multiple utilities
3. **Better Performance**: Memoized values prevent unnecessary recalculations
4. **Type Safety**: Full TypeScript support with exported types
5. **Simplified Components**: Components import one hook instead of many utilities
6. **Centralized State**: AI state managed through GameContext
7. **Extensibility**: Easy to add new AI features in one location
