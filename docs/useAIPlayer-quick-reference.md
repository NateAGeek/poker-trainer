# useAIPlayer Hook - Quick Reference

## Import
```typescript
import { useAIPlayer } from '../../hooks/useAIPlayer';
// or
import { useAIPlayer } from '../../hooks';
```

## Quick Start

```typescript
function MyComponent() {
  const {
    currentAIPlayer,    // Current AI player (if any)
    isAITurn,          // Is it an AI's turn?
    aiPlayers,         // All AI players
    personalities,     // Available AI personalities
    predefinedRanges,  // Predefined ranges
    makeDecision,      // Make AI decision
    getRangeForPlayer  // Get player's range
  } = useAIPlayer();
  
  // Use the AI functionality...
}
```

## Common Use Cases

### Check if AI is playing
```typescript
const { isAITurn, currentAIPlayer } = useAIPlayer();

if (isAITurn && currentAIPlayer) {
  console.log(`${currentAIPlayer.name} is thinking...`);
}
```

### Get AI stats
```typescript
const { getAIStats } = useAIPlayer();
const stats = getAIStats(playerId);
// Returns: { name, chips, personality, range, isActive, isAllIn, position, lastAction }
```

### Check hand against range
```typescript
const { checkHandInRange } = useAIPlayer();
const decision = checkHandInRange(hand, personality);
// Returns: { shouldPlay, action, frequency }
```

### Make AI decision
```typescript
const { makeDecision } = useAIPlayer();
const decision = makeDecision(player, availableActions, maxBet);
// Returns: { action, amount? }
```

### Manage custom ranges
```typescript
const { saveRange, deleteRange, customRanges } = useAIPlayer();

// Save a new range
saveRange('myRange', {
  name: 'My Custom Range',
  hands: [
    { hand: 'AA', frequency: 1.0, action: 'raise' }
  ]
});

// Delete a range
deleteRange('myRange');
```

## Full API

### Properties
- `predefinedRanges` - Built-in ranges (tight, loose, etc.)
- `customRanges` - User-created ranges
- `allRanges` - Combined predefined and custom
- `personalities` - Available AI personalities
- `currentAIPlayer` - Current AI player (if any)
- `isAITurn` - Is it an AI's turn?
- `aiPlayers` - Array of all AI players

### Methods
- `saveRange(name, range)` - Save custom range
- `deleteRange(name)` - Delete custom range
- `getRangeForPlayer(player)` - Get player's range
- `checkHandInRange(hand, personality)` - Check if hand should play
- `getHandNotation(hand)` - Convert hand to notation
- `makeDecision(player, actions, maxBet)` - Make AI decision
- `processAIAction(player, actions)` - Process AI action
- `getPersonality(key)` - Get personality by key
- `updatePlayerPersonality(index, personality)` - Update player personality
- `getAIStats(playerId)` - Get comprehensive AI stats

## Example Component

```typescript
import { useAIPlayer } from '../../hooks/useAIPlayer';

function AIPanel() {
  const {
    currentAIPlayer,
    isAITurn,
    getHandNotation,
    checkHandInRange,
    getRangeForPlayer
  } = useAIPlayer();

  if (!currentAIPlayer) return null;

  const hand = getHandNotation(currentAIPlayer.hand);
  const range = getRangeForPlayer(currentAIPlayer);
  const decision = checkHandInRange(
    currentAIPlayer.hand,
    currentAIPlayer.aiPersonality!
  );

  return (
    <div>
      <h3>{currentAIPlayer.name}</h3>
      <p>Hand: {hand}</p>
      <p>Range: {range?.name}</p>
      <p>Should Play: {decision.shouldPlay ? 'Yes' : 'No'}</p>
      {decision.shouldPlay && (
        <p>Action: {decision.action} ({decision.frequency * 100}%)</p>
      )}
    </div>
  );
}
```

## See Also
- [Full Documentation](./useAIPlayer-hook.md)
- [Implementation Summary](./ai-consolidation-summary.md)
- [Example Component](../src/components/AIInfoPanel/AIInfoPanel.tsx)
