# AI Decision History Feature

## Overview

The AI Decision History feature has been added to the AIInfoPanel component to track and display a comprehensive log of all AI player decisions during gameplay. This allows you to verify AI logic and understand the reasoning behind each action.

## Features

### 1. **Automatic Decision Tracking**
- Records every AI player action automatically
- Tracks up to 50 most recent decisions (configurable)
- Persists across hands within the same session
- Clears when session is reset

### 2. **Comprehensive Decision Data**
Each decision entry includes:
- **Player Information**: Name and ID
- **Hand Details**: The cards the AI was holding (notation format)
- **Action Taken**: Fold, Check, Call, Bet, Raise, or All-In
- **Bet Amount**: Amount wagered (if applicable)
- **Game Context**: 
  - Hand number
  - Game phase (preflop, flop, turn, river)
  - Pot size
  - Player's remaining chips
- **AI Personality**: The personality type making the decision
- **Range Analysis** (for preflop only):
  - Whether the hand was in the AI's range
  - Recommended action based on range
  - Frequency percentage

### 3. **Visual History Display**
- Color-coded actions:
  - 🔴 **All-In**: Red (critical action)
  - 🟢 **Bet/Raise**: Green (aggressive)
  - 🟡 **Call**: Yellow (passive)
  - 🔵 **Check**: Blue (neutral)
  - ⚪ **Fold**: Gray (inactive)
- Range validation indicator (✓ In Range / ✗ Out of Range)
- Scrollable list with smooth animations
- Clear History button to reset the log

## Usage

### Viewing Decision History

1. Open Game Settings (⚙️)
2. Navigate to the **"AI Info"** tab
3. Scroll to the **"Decision History"** section
4. Review past decisions in chronological order (newest first)

### Decision Entry Example

```
┌─────────────────────────────────────┐
│ Aggressive Player 2  Hand #3 • FLOP │
├─────────────────────────────────────┤
│ Hand: AKs                            │
│ Action: RAISE (100)                  │
│                                      │
│ Pot: 50  Chips: 900  Personality: LAG│
│                                      │
│ ✓ In Range                           │
│ Recommended: RAISE (85%)             │
└─────────────────────────────────────┘
```

### Clearing History

Click the **"Clear History"** button to remove all logged decisions. This is useful for:
- Starting fresh analysis
- Reducing clutter
- Testing specific scenarios

## Technical Implementation

### Data Structure

```typescript
interface DecisionHistoryEntry {
  id: string;                  // Unique identifier
  timestamp: number;           // When decision was made
  playerName: string;          // AI player name
  playerId: string;            // Player ID
  hand: string;                // Hand notation (e.g., "AKs")
  action: string;              // Action taken
  amount?: number;             // Bet amount (optional)
  handNumber: number;          // Current hand number
  gamePhase: string;           // Game phase
  pot: number;                 // Pot size
  chips: number;               // Player's chips
  personality: string;         // AI personality name
  wasInRange: boolean;         // Was hand in range?
  recommendedAction?: string;  // Range recommendation
  frequency?: number;          // Play frequency
}
```

### State Management

- Uses React `useState` to maintain history array
- `useEffect` hook monitors game state for new decisions
- Prevents duplicate entries using unique identifiers
- Automatically limits to most recent 50 entries

### Decision Detection Logic

```typescript
// Tracks when:
1. Player is AI (not human)
2. Player has a lastAction
3. Decision hasn't been recorded yet
4. Game state has changed (phase, hand number, action)

// Records:
- Action details
- Game context
- Range analysis (preflop only)
```

## Benefits

### 1. **Verify AI Logic**
- Confirm AI is following configured ranges
- Check if aggressive/tight personalities behave correctly
- Validate decision-making algorithms

### 2. **Learning Tool**
- Understand why AI makes certain plays
- See how position affects decisions
- Learn optimal betting patterns

### 3. **Debugging**
- Identify unusual AI behavior
- Track down edge cases
- Verify range implementation

### 4. **Strategy Analysis**
- Compare different AI personalities
- Analyze decision patterns
- Study betting frequencies

## Example Use Cases

### Use Case 1: Verify Tight Player Behavior
```
Check if "Tight Passive" AI is folding marginal hands:
1. Look at decision history
2. Filter for Tight Passive players
3. Check fold frequency on weak hands
4. Verify against range specifications
```

### Use Case 2: Study Preflop Ranges
```
Analyze how different AIs play similar hands:
1. Find same hand (e.g., AKo) in history
2. Compare actions across personalities
3. Note frequency differences
4. Understand range variations
```

### Use Case 3: Debug Unexpected Behavior
```
If AI makes strange play:
1. Locate decision in history
2. Review game context (pot, chips, phase)
3. Check range validation
4. Verify against personality settings
```

## Best Practices

### For Analysis
1. **Clear Before Testing**: Start with empty history for focused analysis
2. **Track Patterns**: Look for repeated behaviors across hands
3. **Compare Personalities**: Play multiple hands to see personality differences
4. **Note Context**: Consider pot size and stack depth when evaluating decisions

### For Development
1. **Use for Testing**: Verify AI changes work as expected
2. **Check Edge Cases**: Look for unusual situations in history
3. **Validate Ranges**: Ensure range logic is correct
4. **Monitor Performance**: Watch for any lag with large histories

## Limitations

1. **History Size**: Limited to 50 most recent decisions
2. **Session-Based**: Clears when session resets
3. **Preflop Only**: Range analysis only available for preflop decisions
4. **Memory Usage**: Large histories consume more memory

## Future Enhancements

Potential improvements:
1. **Export History**: Download decision log as CSV/JSON
2. **Filter Options**: Filter by player, action, phase
3. **Statistics View**: Aggregate stats from history
4. **Search Functionality**: Find specific hands or situations
5. **Comparison Mode**: Compare multiple players side-by-side
6. **Replay Feature**: Replay decisions with context
7. **Advanced Filtering**: Complex queries on decision data
8. **Persistence**: Save history across sessions

## Related Documentation

- [useAIPlayer Hook](./useAIPlayer-hook.md)
- [AI Consolidation Summary](./ai-consolidation-summary.md)
- [AI Architecture](./ai-architecture.md)
- [Quick Reference](./useAIPlayer-quick-reference.md)

## Code Location

- Component: `src/components/AIInfoPanel/AIInfoPanel.tsx`
- Styles: `src/components/AIInfoPanel/AIInfoPanel.scss`
- Integration: Game Settings → AI Info Tab

---

**Status**: ✅ Implemented and Ready  
**Version**: 1.0.0  
**Last Updated**: October 5, 2025
