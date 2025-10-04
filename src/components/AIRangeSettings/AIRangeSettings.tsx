import { useState, useCallback } from 'react';
import { RangeMatrix, type PredefinedRange } from '../RangeMatrix/RangeMatrix';
import { PREDEFINED_AI_RANGES, loadCustomAIRanges, saveCustomAIRange, deleteCustomAIRange } from '../../utils/aiRangeUtils';
import type { AIRange, AIPersonality } from '../../types/poker';
import './AIRangeSettings.scss';

interface AIRangeSettingsProps {
  personalities: AIPersonality[];
  onPersonalitiesChange: (personalities: AIPersonality[]) => void;
}

export function AIRangeSettings({ personalities, onPersonalitiesChange }: AIRangeSettingsProps) {
  // Start with AI player 1 (index 0 in personalities array, which corresponds to player 2 in game)
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'preflop' | 'postflop'>('preflop');
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [customRangeName, setCustomRangeName] = useState('');
  const [isCreatingCustomRange, setIsCreatingCustomRange] = useState(false);
  const [isEditingCustomRange, setIsEditingCustomRange] = useState(false);
  const [editingRange, setEditingRange] = useState<AIRange | null>(null);
  const [selectedHands, setSelectedHands] = useState<Set<string>>(new Set());
  const [defaultAction, setDefaultAction] = useState<'call' | 'raise'>('raise');
  const [defaultFrequency, setDefaultFrequency] = useState(1.0);

  const selectedPersonality = personalities[selectedPlayerIndex];
  const customAIRanges = loadCustomAIRanges();
  const allAIRanges = { ...PREDEFINED_AI_RANGES, ...customAIRanges };

  // Convert AI range to PredefinedRange for RangeMatrix
  const convertAIRangeToPredefinedRange = useCallback((aiRange: AIRange): PredefinedRange => {
    return {
      name: aiRange.name,
      description: `AI Range: ${aiRange.name}`,
      hands: aiRange.hands.map(hand => ({
        hand: hand.hand,
        frequency: hand.frequency,
        action: hand.action
      })),
      color: '#3b82f6'
    };
  }, []);

  const updatePersonality = useCallback((index: number, updates: Partial<AIPersonality>) => {
    const newPersonalities = [...personalities];
    newPersonalities[index] = { ...newPersonalities[index], ...updates };
    onPersonalitiesChange(newPersonalities);
  }, [personalities, onPersonalitiesChange]);

  const handlePredefinedRangeSelect = useCallback((rangeKey: string) => {
    updatePersonality(selectedPlayerIndex, {
      preflopRange: rangeKey,
      customRanges: {
        ...selectedPersonality?.customRanges,
        preflop: undefined // Clear custom range when selecting predefined
      }
    });
    setShowRangeSelector(false);
  }, [selectedPlayerIndex, selectedPersonality?.customRanges, updatePersonality]);

  const handleCustomRangeCreate = useCallback(() => {
    if (!customRangeName.trim()) return;

    // Start editing mode with empty range
    const newRange: AIRange = {
      name: customRangeName,
      hands: []
    };

    setEditingRange(newRange);
    setSelectedHands(new Set());
    setIsEditingCustomRange(true);
    setIsCreatingCustomRange(false);
    setShowRangeSelector(false);
  }, [customRangeName]);

  const handleSaveCustomRange = useCallback(() => {
    if (!editingRange) return;

    // Convert selected hands to range format
    const rangeHands = Array.from(selectedHands).map(hand => ({
      hand,
      frequency: defaultFrequency,
      action: defaultAction as 'fold' | 'call' | 'raise'
    }));

    const finalRange: AIRange = {
      ...editingRange,
      hands: rangeHands
    };

    // Save to storage
    saveCustomAIRange(editingRange.name, finalRange);

    // Apply to current personality
    updatePersonality(selectedPlayerIndex, {
      preflopRange: undefined,
      customRanges: {
        ...selectedPersonality?.customRanges,
        preflop: finalRange
      }
    });

    // Reset editing state
    setIsEditingCustomRange(false);
    setEditingRange(null);
    setSelectedHands(new Set());
    setCustomRangeName('');
  }, [editingRange, selectedHands, defaultFrequency, defaultAction, selectedPlayerIndex, selectedPersonality?.customRanges, updatePersonality]);

  const handleCancelCustomRange = useCallback(() => {
    setIsEditingCustomRange(false);
    setEditingRange(null);
    setSelectedHands(new Set());
    setCustomRangeName('');
    setIsCreatingCustomRange(false);
  }, []);

  const handleHandSelect = useCallback((hand: string) => {
    setSelectedHands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hand)) {
        newSet.delete(hand);
      } else {
        newSet.add(hand);
      }
      return newSet;
    });
  }, []);

  const handleHandsBulkSelect = useCallback((hands: string[]) => {
    setSelectedHands(prev => {
      const newSet = new Set(prev);
      hands.forEach(hand => {
        if (newSet.has(hand)) {
          newSet.delete(hand);
        } else {
          newSet.add(hand);
        }
      });
      return newSet;
    });
  }, []);

  const handleCustomRangeDelete = useCallback((rangeName: string) => {
    deleteCustomAIRange(rangeName);
    // If this range was being used by any AI player, clear it
    const updatedPersonalities = personalities.map(personality => {
      if (personality.customRanges?.preflop?.name === rangeName) {
        return {
          ...personality,
          customRanges: {
            ...personality.customRanges,
            preflop: undefined
          }
        };
      }
      return personality;
    });
    
    // Only update if there were changes
    if (updatedPersonalities.some((p, i) => p !== personalities[i])) {
      onPersonalitiesChange(updatedPersonalities);
    }
  }, [personalities, onPersonalitiesChange]);

  // Safety check - if no personalities or invalid index, don't render
  if (!personalities.length || !selectedPersonality) {
    return (
      <div className="ai-range-settings">
        <div className="no-ai-players">
          <p>No AI players available to configure.</p>
        </div>
      </div>
    );
  }

  // Get current range for display
  const getCurrentRange = (): PredefinedRange | undefined => {
    if (activeTab === 'preflop') {
      // If we're editing a custom range, show the current selection
      if (isEditingCustomRange && editingRange) {
        return convertSelectedHandsToRange(editingRange.name, selectedHands, defaultAction, defaultFrequency);
      }
      
      if (selectedPersonality.customRanges?.preflop) {
        return convertAIRangeToPredefinedRange(selectedPersonality.customRanges.preflop);
      }
      if (selectedPersonality.preflopRange && allAIRanges[selectedPersonality.preflopRange]) {
        return convertAIRangeToPredefinedRange(allAIRanges[selectedPersonality.preflopRange]);
      }
    }
    return undefined;
  };

  // Helper to convert selected hands to PredefinedRange for display
  const convertSelectedHandsToRange = (name: string, hands: Set<string>, action: 'call' | 'raise', frequency: number): PredefinedRange => {
    return {
      name: `${name} (${hands.size} hands)`,
      description: `Custom range in progress`,
      hands: Array.from(hands).map(hand => ({
        hand,
        frequency,
        action: action as 'fold' | 'call' | 'raise'
      })),
      color: '#10b981'
    };
  };

  const currentRange = getCurrentRange();

  return (
    <div className="ai-range-settings">
      <div className="ai-range-header">
        <h3>AI Player Ranges</h3>
        <p>Configure custom ranges for AI players to make them play more realistically</p>
      </div>

      <div className="player-selector">
        <label>Configure AI Player:</label>
        <select 
          value={selectedPlayerIndex} 
          onChange={(e) => setSelectedPlayerIndex(Number(e.target.value))}
          aria-label="Select AI player to configure"
        >
          {personalities.map((personality, index) => (
            <option key={index} value={index}>
              {personality.name || `AI Player ${index + 2}`} {/* +2 because player 1 is human */}
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
            <div className="range-selection">
              <div className="current-range-info">
                <h4>Current Range</h4>
                {currentRange ? (
                  <div className="range-info">
                    <span className="range-name">{currentRange.name}</span>
                    <span className="range-description">{currentRange.description}</span>
                  </div>
                ) : (
                  <span className="no-range">No range selected - using default AI logic</span>
                )}
              </div>

              <button 
                className="select-range-btn"
                onClick={() => setShowRangeSelector(!showRangeSelector)}
              >
                {showRangeSelector ? 'Cancel' : 'Select Range'}
              </button>
            </div>

            {showRangeSelector && (
              <div className="range-selector">
                <div className="predefined-ranges">
                  <h5>Predefined Ranges</h5>
                  <div className="range-options">
                    {Object.entries(allAIRanges).map(([key, range]) => (
                      <div key={key} className="range-option">
                        <button
                          className="range-option-btn"
                          onClick={() => handlePredefinedRangeSelect(key)}
                        >
                          <span className="range-name">{range.name}</span>
                          <span className="range-hands-count">
                            {range.hands.length} hands
                          </span>
                        </button>
                        {customAIRanges[key] && (
                          <button
                            className="delete-range-btn"
                            onClick={() => handleCustomRangeDelete(key)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="custom-range-creator">
                  <h5>Create Custom Range</h5>
                  {!isCreatingCustomRange ? (
                    <button
                      className="create-custom-btn"
                      onClick={() => setIsCreatingCustomRange(true)}
                    >
                      Create New Range
                    </button>
                  ) : (
                    <div className="custom-range-form">
                      <input
                        type="text"
                        placeholder="Range name"
                        value={customRangeName}
                        onChange={(e) => setCustomRangeName(e.target.value)}
                      />
                      <div className="form-actions">
                        <button onClick={handleCustomRangeCreate}>Start Editing</button>
                        <button onClick={() => {
                          setIsCreatingCustomRange(false);
                          setCustomRangeName('');
                        }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isEditingCustomRange && editingRange && (
              <div className="custom-range-editor">
                <div className="editor-header">
                  <h4>Creating Range: {editingRange.name}</h4>
                  <p>Click hands on the matrix below to add/remove them from your range</p>
                </div>
                
                <div className="editor-controls">
                  <div className="control-group">
                    <label htmlFor="default-action">Default Action:</label>
                    <select
                      id="default-action"
                      value={defaultAction}
                      onChange={(e) => setDefaultAction(e.target.value as 'call' | 'raise')}
                    >
                      <option value="raise">Raise</option>
                      <option value="call">Call</option>
                    </select>
                  </div>
                  
                  <div className="control-group">
                    <label htmlFor="default-frequency">Frequency:</label>
                    <input
                      id="default-frequency"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={defaultFrequency}
                      onChange={(e) => setDefaultFrequency(parseFloat(e.target.value))}
                    />
                    <span className="frequency-display">{(defaultFrequency * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div className="control-group">
                    <span className="hands-count">Selected: {selectedHands.size} hands</span>
                  </div>
                </div>
                
                <div className="editor-actions">
                  <button className="save-btn" onClick={handleSaveCustomRange} disabled={selectedHands.size === 0}>
                    Save Range
                  </button>
                  <button className="cancel-btn" onClick={handleCancelCustomRange}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {currentRange && (
              <div className="range-visualization">
                <h4>Range Visualization</h4>
                <RangeMatrix
                  selectedRange={currentRange}
                  showFrequencies={true}
                  showActions={true}
                  onHandSelect={isEditingCustomRange ? handleHandSelect : undefined}
                  onHandsBulkSelect={isEditingCustomRange ? handleHandsBulkSelect : undefined}
                  className="ai-range-matrix"
                />
                <div className="range-stats">
                  <div className="stat">
                    <span className="label">Total Hands:</span>
                    <span className="value">{currentRange.hands.length}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Avg Frequency:</span>
                    <span className="value">
                      {currentRange.hands.length > 0 
                        ? (currentRange.hands.reduce((sum, hand) => sum + hand.frequency, 0) / currentRange.hands.length * 100).toFixed(1)
                        : '0'
                      }%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!currentRange && !isEditingCustomRange && (
              <div className="no-range-message">
                <p>No range selected. Choose a predefined range or create a custom one.</p>
              </div>
            )}
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
}