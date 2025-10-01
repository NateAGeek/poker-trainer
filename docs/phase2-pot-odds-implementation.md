# Phase 2 & 3 - Pot Odds & Equity Needed - Technical Documentation

## Implementation Summary

This implementation provides accurate pot odds, break-even calculations, and equity needed calculations for poker GTO training, meeting all specified technical requirements for Phases 2 and 3.

## Core Formulas Implemented

### 1. Pot Odds for a Call
```
Formula: AmountToCall / (Pot + AmountToCall) × 100
Display: Percentage format (e.g., "25.00%")
```

### 2. Break-Even Fold % for Bluff
```
Formula: BetSize / (Pot + BetSize) × 100  
Display: Percentage format (e.g., "33.33%")
```

### 3. Equity Needed to Call (Phase 3)
```
Formula: Same as Pot Odds (AmountToCall / (Pot + AmountToCall) × 100)
Display: Percentage format (e.g., "25.00%")
Relationship: Numerically identical to pot odds percentage
```

## Rounding & Format Rules

### Percentage Values
- **Decimal Places**: 2 decimal places for all percentage calculations
- **Rounding Method**: Standard mathematical rounding using `Math.round(value * 100) / 100`
- **Display Format**: `XX.XX%` (e.g., "33.33%", "25.00%")
- **Edge Cases**: 
  - Zero or invalid values display as `"--"`
  - Infinity or NaN values display as `"--"`

### Currency/Chip Values
- **Format**: Thousands separator using `toLocaleString()` 
- **Display**: `"1,000"`, `"50"`, `"1,234,567"`
- **Edge Cases**: Invalid values display as `"--"`

### Ratio Values
- **Format**: `"X.X:1"` or `"1:X.X"` depending on which side is larger
- **Decimal Places**: 1 decimal place for ratios
- **Examples**: `"3.5:1"`, `"1:2.0"`, `"∞"` for infinite ratios

## Accuracy Requirements

### Tolerance
- **Maximum Absolute Error**: ≤0.1% for all calculations
- **Validation**: Implemented via `validateAccuracy()` function
- **Testing**: Comprehensive test suite validates accuracy across edge cases

### Known Test Cases
All calculations verified against these exact scenarios:

#### Pot Odds Test Cases
- Pot=100, Call=50 → **33.33%** (exactly 1/3)
- Pot=300, Call=100 → **25.00%** (exactly 1/4)  
- Pot=200, Call=100 → **33.33%** (exactly 1/3)

#### Break-Even Fold Test Cases  
- P=60, b=30 → **33.33%** (from requirements)
- P=100, b=50 → **33.33%** (exactly 1/3)
- P=200, b=150 → **42.86%** (3/7)

## Component Integration

### UI Display Location
- **Section**: "Odds & Thresholds" 
- **Component**: `PotOddsBreakeven.tsx`
- **Layout**: 2x2 grid showing:
  1. Pot Odds for Call (percentage + ratio)
  2. Equity Needed to Call (percentage, orange highlighting)
  3. Your Hand Estimated Equity (placeholder: "—" + "(requires range)")
  4. Break-Even Fold % for Bluff (percentage)

### Visual Distinction (Phase 3)
- **Equity Needed**: Orange color with bold font weight (required threshold)
- **Actual Equity**: Blue color, currently shows placeholder (future implementation)
- **Clear Labeling**: "needed" vs "actual" distinction in UI

### Help Tooltips
Each value includes detailed calculation explanations:
- Formula breakdown with actual numbers
- Step-by-step calculation process
- Strategic interpretation of the values

## Error Handling

### Input Validation
- Negative values throw descriptive errors
- Zero values handled gracefully
- Infinite/NaN results display as "--"

### Edge Cases Covered
- No betting scenarios (0% pot odds)
- All-in scenarios  
- Empty pots
- Reverse odds (call > pot)

## Testing Coverage

### Unit Tests (25 tests)
- ✅ Basic calculations with known results
- ✅ Edge cases and error conditions  
- ✅ Accuracy validation within 0.1% tolerance
- ✅ Formatting functions
- ✅ Game state integration
- ✅ **Phase 3**: Numeric identity between pot odds and equity needed
- ✅ **Phase 3**: Edge cases with identity maintained
- ✅ **Phase 3**: Game state calculations verification
- ✅ **Phase 3**: Definition consistency across diverse cases

### Integration Tests
- ✅ Known poker scenarios with exact fractions
- ✅ Requirements test case (P=60, b=30 → 33.33%)
- ✅ Common betting patterns validation

## File Structure

```
src/utils/
├── potOddsUtils.ts          # Core calculations
├── potOddsUtils.test.ts     # Comprehensive test suite

src/components/GameTabs/GTOStatsTab/
├── PotOddsBreakeven/
│   ├── PotOddsBreakeven.tsx  # UI component
│   └── PotOddsBreakeven.scss # Shared styling
└── _shared-stats.scss        # Common GTO component styles
```

## Performance Considerations

- **Memoization**: All calculations memoized using React `useMemo`
- **Pure Functions**: All utility functions are pure with no side effects
- **Efficient Updates**: Only recalculates when game state changes

## Acceptance Criteria Status

### Phase 2 ✅
✅ **Pot Odds Formula**: `AmountToCall / (Pot + AmountToCall)` implemented  
✅ **Break-Even Fold Formula**: `b / (P + b)` implemented  
✅ **UI Display**: Under "Odds & Thresholds" section  
✅ **Unit Tests**: Known tuples validated (P=60, b=30 → 33.33%)  
✅ **Integration**: Facing bet scenarios match exact fractions  
✅ **Accuracy**: ≤0.1% absolute error verified  
✅ **Documentation**: Rounding/format rules documented (this file)

### Phase 3 ✅
✅ **Equity Needed**: Always equals pot odds (definition verified)  
✅ **Numeric Identity**: Unit tests confirm equality across diverse cases  
✅ **UI Distinction**: Clear "needed" vs "actual" labeling and visual styling  
✅ **Placeholder**: "Your Hand Estimated Equity" shows "—" + "(requires range)"  
✅ **Future Ready**: Component prepared for range analysis integration