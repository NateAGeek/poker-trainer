import React, { useState } from 'react';
import { RangeMatrix, getPredefinedRanges, getSavedRanges, saveCustomRange, deleteCustomRange } from '../../../RangeMatrix';
import { RangeSelector } from '../RangeSelector';
import type { PredefinedRange } from '../../../RangeMatrix';
import './RangeAnalysis.scss';

export interface RangeAnalysisProps {
  className?: string;
}

export const RangeAnalysis: React.FC<RangeAnalysisProps> = ({ className = '' }) => {
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('customRange');
  const [showFrequencies, setShowFrequencies] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [customRange, setCustomRange] = useState<PredefinedRange | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when ranges change

  const predefinedRanges = React.useMemo(() => getPredefinedRanges(), []);
  const savedRanges = React.useMemo(() => getSavedRanges(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRangeChange = (rangeKey: string) => {
    setSelectedRangeKey(rangeKey);
    // Clear custom range when switching away from custom range
    if (rangeKey !== 'customRange') {
      setCustomRange(undefined);
    }
  };

  const handleClearCustomRange = () => {
    setCustomRange(undefined);
  };

  const handleSaveCustomRange = (name: string) => {
    if (customRange && customRange.hands.length > 0) {
      const rangeToSave: PredefinedRange = {
        ...customRange,
        name,
        description: `Custom saved range with ${customRange.hands.length} hands`
      };
      
      try {
        saveCustomRange(name, rangeToSave);
        setRefreshKey(prev => prev + 1); // Force re-render to show new saved range
        alert(`Range "${name}" saved successfully!`);
      } catch (error) {
        alert(`Error saving range: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleDeleteRange = (key: string) => {
    if (key.startsWith('saved_')) {
      try {
        deleteCustomRange(key);
        setRefreshKey(prev => prev + 1); // Force re-render to remove deleted range
        if (selectedRangeKey === key) {
          setSelectedRangeKey('customRange'); // Switch to custom range if deleted range was selected
        }
        alert('Range deleted successfully!');
      } catch (error) {
        alert(`Error deleting range: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const selectedRange: PredefinedRange | undefined = React.useMemo(() => {
    if (selectedRangeKey === 'customRange') {
      // Use customRange state or return placeholder
      return customRange || {
        name: "Custom Range (Click hands to select)",
        description: "Build your own custom range by clicking on hands in the matrix",
        color: "#6b7280",
        hands: []
      };
    }
    
    // Check predefined ranges first
    if (predefinedRanges[selectedRangeKey]) {
      return predefinedRanges[selectedRangeKey];
    }
    
    // Check saved ranges
    if (savedRanges[selectedRangeKey]) {
      return savedRanges[selectedRangeKey];
    }
    
    return undefined;
  }, [selectedRangeKey, customRange, predefinedRanges, savedRanges]);

  return (
    <div className={`range-analysis ${className}`}>
      <RangeSelector
        selectedRangeKey={selectedRangeKey}
        onRangeChange={handleRangeChange}
        showFrequencies={showFrequencies}
        onShowFrequenciesChange={setShowFrequencies}
        showActions={showActions}
        onShowActionsChange={setShowActions}
        customRangeCount={customRange?.hands.length || 0}
        onClearCustomRange={handleClearCustomRange}
        onSaveCustomRange={handleSaveCustomRange}
        onDeleteRange={handleDeleteRange}
      />

      <div className="range-matrix-container">
        <RangeMatrix
          selectedRange={selectedRangeKey !== 'customRange' ? selectedRange : customRange}
          showFrequencies={showFrequencies}
          showActions={showActions}
          isEditable={selectedRangeKey === 'customRange'}
          editMode="select"
          onRangeChange={selectedRangeKey === 'customRange' ? setCustomRange : undefined}
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