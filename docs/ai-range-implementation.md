# AI Range Functionality - Implementation Guide

## Overview

This implementation adds comprehensive AI range functionality to the poker GTO trainer, allowing users to configure custom preflop ranges for AI players. This makes the AI behavior more realistic and provides a better training experience.

## Features Added

### 1. AI Range Types and Management

**File: `src/utils/aiRangeUtils.ts`**
- **Predefined AI Ranges**: Five built-in ranges (Ultra Tight, Tight, Standard, Loose, Very Loose)
- **Custom Range Management**: Save, load, and delete custom ranges with localStorage persistence
- **Hand Notation Conversion**: Convert hole cards to standard range notation (AA, AKs, AKo, etc.)
- **Range-based Decision Making**: Determine whether to play hands based on frequency and action preferences

### 2. Extended Type System

**File: `src/types/poker.ts`**
- **AIRange Interface**: Defines structure for AI ranges with hands, frequencies, and actions
- **Extended AIPersonality**: Added support for predefined and custom ranges
- **GameSettings Enhancement**: Include AI personality configurations

### 3. AI Range Settings Component

**File: `src/components/AIRangeSettings/`**
- **Range Configuration UI**: User-friendly interface for selecting and customizing AI ranges
- **Visual Range Matrix**: Display ranges using the existing RangeMatrix component
- **Custom Range Creation**: Tools for creating and managing custom ranges
- **Per-Player Configuration**: Configure different ranges for each AI player

### 4. Enhanced AI Decision Making

**File: `src/utils/gameUtils.ts`**
- **Range-based Preflop Decisions**: Use configured ranges for preflop decision making
- **Fallback Logic**: Maintain existing hand strength logic for postflop play
- **Personality Integration**: Combine range settings with personality traits

### 5. Game Settings Integration

**File: `src/components/GameSettings/GameSettings.tsx`**
- **Advanced Settings Tab**: Added AI configuration to the advanced settings
- **Automatic Initialization**: Set up default AI personalities when creating games
- **Settings Persistence**: Save and restore AI configurations

## Usage Instructions

### For Users

1. **Accessing AI Range Settings**:
   - Open Game Settings (gear icon)
   - Navigate to the "Advanced" tab
   - Find the "AI Player Configuration" section

2. **Configuring AI Ranges**:
   - Select an AI player from the dropdown
   - Choose "Preflop Range" tab
   - Click "Select Range" to choose from predefined ranges or create custom ones

3. **Creating Custom Ranges**:
   - Click "Create New Range" in the range selector
   - Enter a name for your custom range
   - The range will be saved locally and available for future use

4. **Predefined Ranges Available**:
   - **Ultra Tight (2%)**: Only premium hands (AA, KK, QQ, AKs, AKo)
   - **Tight (8%)**: Conservative range suitable for early position
   - **Standard (15%)**: Balanced range for most situations
   - **Loose (25%)**: Aggressive range with many marginal hands
   - **Very Loose (40%)**: Plays most hands with some frequency

### For Developers

#### Adding New Predefined Ranges

```typescript
// In src/utils/aiRangeUtils.ts
export const PREDEFINED_AI_RANGES: Record<string, AIRange> = {
  // ... existing ranges
  newRange: {
    name: "Custom Range Name",
    hands: [
      { hand: "AA", frequency: 1.0, action: "raise" },
      { hand: "KK", frequency: 1.0, action: "raise" },
      // ... more hands
    ]
  }
};
```

#### Customizing AI Decision Logic

```typescript
// In src/utils/gameUtils.ts - makeRangeBasedDecision function
// Modify the decision logic based on range recommendations
if (recommendedAction === 'raise' && availableActions.includes(Action.RAISE)) {
  const raiseAmount = calculateRaiseAmount(personality, gameState);
  return { action: Action.RAISE, amount: raiseAmount };
}
```

#### Extending Range Types

```typescript
// In src/types/poker.ts
export interface AIRange {
  name: string;
  hands: Array<{
    hand: string;
    frequency: number; // 0-1 probability
    action: 'fold' | 'call' | 'raise';
    // Add new properties here for advanced features
    position?: 'early' | 'middle' | 'late'; // Position-specific ranges
    stackDepth?: 'short' | 'medium' | 'deep'; // Stack-dependent ranges
  }>;
}
```

## Technical Implementation Details

### Range Storage Format

Custom ranges are stored in localStorage with the key `poker-ai-custom-ranges`:

```json
{
  "customRangeName": {
    "name": "My Custom Range",
    "hands": [
      {"hand": "AA", "frequency": 1.0, "action": "raise"},
      {"hand": "KK", "frequency": 1.0, "action": "raise"}
    ]
  }
}
```

### Integration with Existing AI

The new range system integrates seamlessly with existing AI personalities:

1. **Preflop**: Uses range-based decisions when available
2. **Postflop**: Falls back to existing hand strength evaluation
3. **Personality Modifiers**: Range frequencies are adjusted based on personality traits

### Performance Considerations

- Range lookups use Map structures for O(1) hand checking
- Range data is cached in component state to avoid repeated calculations
- LocalStorage operations are wrapped in try-catch blocks for error handling

## Future Enhancements

### Planned Features

1. **Postflop Ranges**: Configure ranges for different board textures and betting actions
2. **Position-based Ranges**: Different ranges for early, middle, and late positions
3. **Stack Depth Awareness**: Adjust ranges based on effective stack sizes
4. **Range Import/Export**: Share ranges with other users
5. **Advanced Statistics**: Track how often AI players deviate from their ranges

### Potential Improvements

1. **Range Visualization Enhancements**:
   - Heat maps showing frequency distributions
   - Action-based color coding
   - Range comparison tools

2. **AI Sophistication**:
   - Dynamic range adjustments based on opponent tendencies
   - Multi-street range evolution
   - Exploitative adjustments

3. **User Experience**:
   - Range templates for different game types
   - Guided range creation wizard
   - Range validation and optimization tools

## Testing

The implementation includes:

- **Type Safety**: Full TypeScript coverage for all new interfaces
- **Error Handling**: Graceful fallbacks when ranges are unavailable
- **Backward Compatibility**: Existing games continue to work without modification
- **Local Storage**: Persistent custom range storage with error recovery

## Files Modified/Created

### New Files
- `src/utils/aiRangeUtils.ts` - Core range utilities and data
- `src/components/AIRangeSettings/` - Range configuration UI components

### Modified Files
- `src/types/poker.ts` - Extended types for AI ranges
- `src/utils/gameUtils.ts` - Enhanced AI decision making
- `src/components/GameSettings/GameSettings.tsx` - Added range settings
- `src/services/gameService.ts` - Integrated AI personalities
- `src/utils/potOddsUtils.test.ts` - Fixed test compatibility

This implementation provides a solid foundation for advanced AI behavior while maintaining the simplicity and usability of the existing poker trainer.