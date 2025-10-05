# AI Architecture - Before & After

## Before Consolidation

```
Components
    ├── GameSettings.tsx
    │   ├── import AI_PERSONALITIES from gameUtils
    │   └── import PREDEFINED_AI_RANGES from aiRangeUtils
    │
    ├── useAIAutomation.ts
    │   ├── import makeAIDecision from gameUtils
    │   └── Complex logic to determine AI turn
    │
    └── Other Components
        ├── Direct imports from utils
        └── Scattered AI logic

Utils
    ├── gameUtils.ts
    │   ├── AI_PERSONALITIES
    │   ├── makeAIDecision()
    │   └── checkHandAgainstRange()
    │
    └── aiRangeUtils.ts
        ├── PREDEFINED_AI_RANGES
        ├── shouldPlayHand()
        ├── getAIRangeForPosition()
        ├── saveCustomAIRange()
        └── loadCustomAIRanges()
```

**Problems:**
- ❌ Scattered imports across components
- ❌ Duplicated logic
- ❌ Hard to test
- ❌ Difficult to track AI state
- ❌ No centralized management
- ❌ Poor performance (recalculations)

---

## After Consolidation

```
Components
    ├── GameSettings.tsx
    │   └── const { personalities } = useAIPlayer()
    │
    ├── useAIAutomation.ts
    │   └── const { currentAIPlayer, isAITurn } = useAIPlayer()
    │
    └── Other Components
        └── const { ...everything } = useAIPlayer()

Hooks
    └── useAIPlayer.ts (NEW!)
        │
        ├── Range Management
        │   ├── predefinedRanges
        │   ├── customRanges
        │   ├── allRanges
        │   ├── saveRange()
        │   ├── deleteRange()
        │   └── getRangeForPlayer()
        │
        ├── Decision Making
        │   ├── checkHandInRange()
        │   ├── getHandNotation()
        │   ├── makeDecision()
        │   └── processAIAction()
        │
        ├── Personality Management
        │   ├── personalities
        │   ├── getPersonality()
        │   └── updatePlayerPersonality()
        │
        └── Player Information
            ├── currentAIPlayer
            ├── isAITurn
            ├── aiPlayers
            └── getAIStats()

Utils (Still used internally)
    ├── gameUtils.ts
    │   ├── AI_PERSONALITIES (used by hook)
    │   ├── makeAIDecision() (used by hook)
    │   └── Other game utils
    │
    └── aiRangeUtils.ts
        ├── PREDEFINED_AI_RANGES (used by hook)
        ├── Range functions (used by hook)
        └── Other AI utils

GameContext
    └── Centralized game state
        └── useAIPlayer reads from here
```

**Benefits:**
- ✅ Single import for all AI functionality
- ✅ Centralized logic
- ✅ Easy to test (mock one hook)
- ✅ Better performance (memoization)
- ✅ Type-safe
- ✅ Easy to extend

---

## Data Flow

### AI Turn Processing

```
Game State Changes
    ↓
GameContext updates
    ↓
useAIPlayer reads state
    ↓
Provides: currentAIPlayer, isAITurn
    ↓
useAIAutomation detects AI turn
    ↓
Calls: processAIAction()
    ↓
useGameActions.handlePlayerAction()
    ↓
Updates GameContext
    ↓
Cycle repeats
```

### Decision Making Flow

```
AI Player's Turn
    ↓
useAIPlayer.makeDecision()
    │
    ├─→ Get player's range
    │   └─→ getRangeForPlayer()
    │
    ├─→ Check hand against range
    │   └─→ checkHandInRange()
    │
    ├─→ Consider game state
    │   ├─→ Pot size
    │   ├─→ Community cards
    │   ├─→ Position
    │   └─→ Personality
    │
    └─→ Make decision
        └─→ { action, amount }
```

### Range Management Flow

```
User Creates Custom Range
    ↓
useAIPlayer.saveRange()
    ↓
Saves to localStorage
    ↓
useAIPlayer.customRanges updates
    ↓
useAIPlayer.allRanges updates
    ↓
Available to all components
    ↓
Used in AI decisions
```

---

## Component Integration

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  (GameProvider wraps everything)                 │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌────────────┐
│PokerGame│  │GameTabs  │  │GameSettings│
└────┬────┘  └────┬─────┘  └─────┬──────┘
     │            │              │
     └────────────┼──────────────┘
                  │
                  ▼
          useAIPlayer() hook
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
predefinedRanges  makeDecision  currentAIPlayer
customRanges      processAction isAITurn
personalities     checkHand     aiPlayers
...etc            ...etc        ...etc
```

---

## Testing Architecture

### Before
```typescript
// Multiple mocks needed
jest.mock('../../utils/gameUtils');
jest.mock('../../utils/aiRangeUtils');

// Complex setup
mockGameUtils.makeAIDecision.mockReturnValue(...);
mockAIRangeUtils.shouldPlayHand.mockReturnValue(...);
// etc...
```

### After
```typescript
// Single mock
jest.mock('../../hooks/useAIPlayer');

// Simple setup
(useAIPlayer as jest.Mock).mockReturnValue({
  currentAIPlayer: mockPlayer,
  isAITurn: true,
  makeDecision: mockMakeDecision,
  // ... only what you need
});
```

---

## Performance Optimization

### Memoization Strategy
```typescript
useAIPlayer() {
  // Computed once, cached
  const predefinedRanges = useMemo(() => PREDEFINED_AI_RANGES, []);
  
  // Only recomputed when needed
  const allRanges = useMemo(
    () => ({ ...predefinedRanges, ...customRanges }),
    [predefinedRanges, customRanges]
  );
  
  // Stable callbacks
  const makeDecision = useCallback((...args) => {
    // Decision logic
  }, [/* minimal deps */]);
}
```

### Re-render Optimization
- Components only re-render when their specific values change
- Memoized values prevent cascading updates
- useCallback prevents function reference changes

---

## Extension Points

Easy to add new features:

```typescript
export function useAIPlayer() {
  // ... existing code ...
  
  // NEW: AI learning system
  const trackDecision = useCallback((decision, outcome) => {
    // Track and learn from decisions
  }, []);
  
  // NEW: Advanced stats
  const calculateVPIP = useCallback((playerId) => {
    // Calculate VPIP for player
  }, []);
  
  return {
    // ... existing API ...
    trackDecision,      // NEW
    calculateVPIP,      // NEW
  };
}
```

---

## File Structure

```
src/
├── hooks/
│   ├── index.ts                    ← Central exports
│   ├── useAIPlayer.ts             ← NEW: Main AI hook
│   ├── useAIAutomation.ts         ← Uses useAIPlayer
│   ├── useGameActions.ts
│   ├── useGameContext.ts
│   └── ...other hooks
│
├── utils/
│   ├── aiRangeUtils.ts            ← Used by hook
│   ├── gameUtils.ts               ← Used by hook
│   └── ...other utils
│
├── components/
│   ├── AIInfoPanel/               ← NEW: Example usage
│   │   ├── AIInfoPanel.tsx
│   │   ├── AIInfoPanel.scss
│   │   └── index.ts
│   ├── GameSettings/              ← Updated to use hook
│   │   └── GameSettings.tsx
│   └── ...other components
│
└── docs/
    ├── useAIPlayer-hook.md        ← Full documentation
    ├── useAIPlayer-quick-reference.md
    ├── ai-consolidation-summary.md
    └── ai-architecture.md         ← This file
```
