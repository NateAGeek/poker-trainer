import React, { useState, useEffect, useRef } from 'react';
import { RangeMatrix, getPredefinedRanges, getSavedRanges, saveCustomRange, deleteCustomRange } from '../RangeMatrix';
import { RangeSelector } from '../GameTabs/GTOStatsTab/RangeSelector';
import type { PredefinedRange } from '../RangeMatrix';
import type { AIPersonality } from '../../types/poker';
import './AIRangeSettings.scss';

interface AIRangeSettingsProps {
  personalities: AIPersonality[];
  onPersonalitiesChange: (personalities: AIPersonality[]) => void;
}

export function AIRangeSettings({ personalities, onPersonalitiesChange }: AIRangeSettingsProps) {
  const [selectedAIIndex, setSelectedAIIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preflop' | 'postflop'>('preflop');
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('customRange');
  const [showFrequencies, setShowFrequencies] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [customRange, setCustomRange] = useState<PredefinedRange | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when ranges change
  const isLoadingRef = useRef(false); // Prevent infinite loops when loading

  const predefinedRanges = React.useMemo(() => getPredefinedRanges(), []);
  const savedRanges = React.useMemo(() => getSavedRanges(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the selected AI player's range when selection changes
  useEffect(() => {
    if (isLoadingRef.current) return; // Skip if already loading
    isLoadingRef.current = true;
    const selectedAI = personalities[selectedAIIndex];
    if (selectedAI?.customRanges?.preflop) {
      // Convert AIRange to PredefinedRange format
      const aiRange = selectedAI.customRanges.preflop;
      setCustomRange({
        name: aiRange.name,
        description: `Custom range for ${selectedAI.name || `AI Player ${selectedAIIndex + 1}`}`,
        color: "#6b7280",
        hands: aiRange.hands
      });
      setSelectedRangeKey('customRange');
    } else if (selectedAI?.preflopRange) {
      // Load predefined range if set
      setSelectedRangeKey(selectedAI.preflopRange);
      setCustomRange(undefined);
    } else {
      // Reset to default
      setSelectedRangeKey('customRange');
      setCustomRange(undefined);
    }
    
    // Reset loading flag after a short delay
    setTimeout(() => {
      isLoadingRef.current = false;
    }, 100);
  }, [selectedAIIndex, personalities]);

  // Save the current range to the selected AI player
  const saveRangeToAI = (range: PredefinedRange) => {
    const updatedPersonalities = [...personalities];
    const aiRange = {
      name: range.name,
      hands: range.hands.map(h => ({
        hand: h.hand,
        frequency: h.frequency,
        action: (h.action === 'bet' ? 'raise' : h.action || 'fold') as 'fold' | 'call' | 'raise'
      }))
    };
    
    if (!updatedPersonalities[selectedAIIndex].customRanges) {
      updatedPersonalities[selectedAIIndex].customRanges = {};
    }
    updatedPersonalities[selectedAIIndex].customRanges!.preflop = aiRange;
    
    onPersonalitiesChange(updatedPersonalities);
  };

  const handleRangeChange = (rangeKey: string) => {
    setSelectedRangeKey(rangeKey);
    // Clear custom range when switching away from custom range
    if (rangeKey !== 'customRange') {
      setCustomRange(undefined);
    }
  };

  const handleClearCustomRange = () => {
    setCustomRange(undefined);
    // Clear from AI player as well
    const updatedPersonalities = [...personalities];
    if (updatedPersonalities[selectedAIIndex].customRanges) {
      delete updatedPersonalities[selectedAIIndex].customRanges!.preflop;
    }
    onPersonalitiesChange(updatedPersonalities);
  };

  // Handler that saves changes to both local state and the AI player
  const handleCustomRangeChange = (range: PredefinedRange | undefined) => {
    if (isLoadingRef.current) return; // Don't save while loading
    setCustomRange(range);
    if (range) {
      saveRangeToAI(range);
    }
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
    <div className="ai-range-settings">
      <div className="ai-range-header">
        <h3>Range Manager</h3>
        <p>Create and edit poker ranges for AI players</p>
      </div>

      <div className="ai-player-selector">
        <label htmlFor="ai-player-select">Select AI Player:</label>
        <select 
          id="ai-player-select"
          value={selectedAIIndex}
          onChange={(e) => setSelectedAIIndex(Number(e.target.value))}
          className="ai-player-dropdown"
        >
          {personalities.map((personality, index) => (
            <option key={index} value={index}>
              {personality.name || `AI Player ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      <div className="range-tabs">
        <button 
          className={`tab ${activeTab === 'preflop' ? 'active' : ''}`}
          onClick={() => setActiveTab('preflop')}
        >
          Preflop Range
        </button>
        <button 
          className={`tab ${activeTab === 'postflop' ? 'active' : ''}`}
          onClick={() => setActiveTab('postflop')}
          disabled
        >
          Postflop Range
          <span className="coming-soon">(Coming Soon)</span>
        </button>
      </div>

      <div className="range-content">
        {activeTab === 'preflop' && (
          <div className="preflop-range-settings">
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

            {selectedRangeKey !== 'customRange' && selectedRange && (
              <div className="apply-range-actions">
                <button 
                  className="apply-range-button"
                  onClick={() => {
                    if (selectedRange) {
                      saveRangeToAI(selectedRange);
                      alert(`Applied "${selectedRange.name}" to ${personalities[selectedAIIndex].name || `AI Player ${selectedAIIndex + 1}`}`);
                    }
                  }}
                >
                  Apply "{selectedRange.name}" to {personalities[selectedAIIndex].name || `AI Player ${selectedAIIndex + 1}`}
                </button>
              </div>
            )}

            <div className="range-matrix-container">
              <RangeMatrix
                selectedRange={selectedRangeKey !== 'customRange' ? selectedRange : customRange}
                showFrequencies={showFrequencies}
                showActions={showActions}
                isEditable={selectedRangeKey === 'customRange'}
                editMode="select"
                onRangeChange={selectedRangeKey === 'customRange' ? handleCustomRangeChange : undefined}
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
                          let combos = 0;
                          if (hand.hand.length === 2) {
                            combos = 6;
                          } else if (hand.hand.endsWith('s')) {
                            combos = 4;
                          } else {
                            combos = 12;
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
        )}

        {activeTab === 'postflop' && (
          <div className="postflop-range-settings">
            <div className="coming-soon-message">
              <h4>Postflop Ranges Coming Soon</h4>
              <p>
                Postflop range configuration will allow you to set different strategies
                for flop, turn, and river play based on board texture and betting action.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};