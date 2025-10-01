import React, { useState } from 'react';
import { RangeMatrix, PREDEFINED_RANGES } from '../../../RangeMatrix';
import { RangeSelector } from '../RangeSelector';
import type { PredefinedRange, RangeSelection } from '../../../RangeMatrix';
import './RangeAnalysis.scss';

export interface RangeAnalysisProps {
  className?: string;
}

export const RangeAnalysis: React.FC<RangeAnalysisProps> = ({ className = '' }) => {
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('customRange');
  const [showFrequencies, setShowFrequencies] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [customRangeHands, setCustomRangeHands] = useState<Map<string, RangeSelection>>(new Map());

  const handleRangeChange = (rangeKey: string) => {
    setSelectedRangeKey(rangeKey);
    // Clear custom hands when switching to a predefined range
    if (rangeKey !== 'customRange') {
      setCustomRangeHands(new Map());
    }
  };

  const handleHandSelect = (hand: string) => {
    console.log('Selected hand:', hand);
    
    // Only allow custom selection when custom range is selected
    if (selectedRangeKey === 'customRange') {
      setCustomRangeHands(prev => {
        const newMap = new Map(prev);
        const currentSelection = newMap.get(hand);
        
        if (!currentSelection) {
          // First click: Add as raise
          newMap.set(hand, { hand, frequency: 1.0, action: 'raise' });
        } else {
          // Cycle through actions: raise → call → fold → remove
          switch (currentSelection.action) {
            case 'raise':
              newMap.set(hand, { hand, frequency: 1.0, action: 'call' });
              break;
            case 'call':
              newMap.set(hand, { hand, frequency: 1.0, action: 'fold' });
              break;
            case 'fold':
              // Remove from range (fourth click)
              newMap.delete(hand);
              break;
            default:
              newMap.set(hand, { hand, frequency: 1.0, action: 'raise' });
          }
        }
        
        return newMap;
      });
    }
  };

  const handleHandsBulkSelect = (hands: string[]) => {
    console.log('Bulk selected hands:', hands);
    
    // Only allow custom selection when custom range is selected
    if (selectedRangeKey === 'customRange') {
      setCustomRangeHands(prev => {
        const newMap = new Map(prev);
        
        // For bulk selection, determine the next action based on the most common state
        // If hands have mixed states, default to 'raise'
        // If all hands have the same state, advance to next state
        const handStates = hands.map(hand => newMap.get(hand)?.action || null);
        const uniqueStates = [...new Set(handStates)];
        
        let nextAction: 'raise' | 'call' | 'fold' | undefined = 'raise';
        
        if (uniqueStates.length === 1) {
          // All hands have the same state, advance to next
          const currentState = uniqueStates[0];
          switch (currentState) {
            case null:
              nextAction = 'raise';
              break;
            case 'raise':
              nextAction = 'call';
              break;
            case 'call':
              nextAction = 'fold';
              break;
            case 'fold':
              nextAction = undefined; // Remove
              break;
            default:
              nextAction = 'raise';
          }
        } else {
          // Mixed states or some unselected hands, set all to 'raise'
          nextAction = 'raise';
        }
        
        hands.forEach(hand => {
          if (nextAction) {
            newMap.set(hand, { hand, frequency: 1.0, action: nextAction });
          } else {
            newMap.delete(hand);
          }
        });
        
        return newMap;
      });
    }
  };

  const handleClearCustomRange = () => {
    setCustomRangeHands(new Map());
  };

  const selectedRange: PredefinedRange | undefined = React.useMemo(() => {
    if (selectedRangeKey === 'customRange') {
      // Create a custom range from selected hands
      return {
        name: "Custom Range (Click hands to select)",
        description: customRangeHands.size > 0 
          ? `Custom range with ${customRangeHands.size} selected hands`
          : "Build your own custom range by clicking on hands in the matrix",
        color: "#6b7280",
        hands: Array.from(customRangeHands.values())
      };
    }
    return PREDEFINED_RANGES[selectedRangeKey];
  }, [selectedRangeKey, customRangeHands]);

  return (
    <div className={`range-analysis ${className}`}>
      <RangeSelector
        selectedRangeKey={selectedRangeKey}
        onRangeChange={handleRangeChange}
        showFrequencies={showFrequencies}
        onShowFrequenciesChange={setShowFrequencies}
        showActions={showActions}
        onShowActionsChange={setShowActions}
        customRangeCount={customRangeHands.size}
        onClearCustomRange={handleClearCustomRange}
      />

      <div className="range-matrix-container">
        <RangeMatrix
          selectedRange={selectedRange}
          showFrequencies={showFrequencies}
          showActions={showActions}
          onHandSelect={handleHandSelect}
          onHandsBulkSelect={handleHandsBulkSelect}
        />
      </div>

      <div className="range-stats stats-card">
        <h4>Range Statistics</h4>
        {selectedRange && (
          <div className="stats-content">
            <div className="stat-row">
              <div className="stat-item">
                <label>Range Size:</label>
                <span className="stat-value">{selectedRange.hands.length} hands</span>
              </div>
              <div className="stat-item">
                <label>Total Combinations:</label>
                <span className="stat-value">
                  {selectedRange.hands.reduce((total: number, hand) => {
                    // Each hand has different number of combinations
                    // Pocket pairs: 6 combos, suited: 4 combos, offsuit: 12 combos
                    let combos = 0;
                    if (hand.hand.length === 2) {
                      combos = 6; // Pocket pair
                    } else if (hand.hand.endsWith('s')) {
                      combos = 4; // Suited
                    } else {
                      combos = 12; // Offsuit
                    }
                    return total + (combos * hand.frequency);
                  }, 0).toFixed(1)}
                </span>
              </div>
              <div className="stat-item">
                <label>Range %:</label>
                <span className="stat-value percentage-value">
                  {(
                    (selectedRange.hands.reduce((total: number, hand) => {
                      let combos = 0;
                      if (hand.hand.length === 2) combos = 6;
                      else if (hand.hand.endsWith('s')) combos = 4;
                      else combos = 12;
                      return total + (combos * hand.frequency);
                    }, 0) / 1326) * 100
                  ).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};