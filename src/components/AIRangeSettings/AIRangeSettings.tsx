import { useState, useCallback, useMemo } from 'react';
import { RangeMatrix, type PredefinedRange } from '../RangeMatrix/RangeMatrix';
import { PREDEFINED_AI_RANGES, loadCustomAIRanges, saveCustomAIRange, deleteCustomAIRange } from '../../utils/aiRangeUtils';
import type { AIRange, AIPersonality } from '../../types/poker';
import './AIRangeSettings.scss';

interface AIRangeSettingsProps {
  personalities: AIPersonality[];
  onPersonalitiesChange: (personalities: AIPersonality[]) => void;
}

export function AIRangeSettings({ personalities, onPersonalitiesChange }: AIRangeSettingsProps) {
  // Always use first AI player (index 0)
  const selectedPlayerIndex = 0;
  const [activeTab, setActiveTab] = useState<'preflop' | 'postflop'>('preflop');
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [customRangeName, setCustomRangeName] = useState('');
  const [isCreatingCustomRange, setIsCreatingCustomRange] = useState(false);
  const [isEditingRange, setIsEditingRange] = useState(false);
  const [editingRangeName, setEditingRangeName] = useState<string>('');
  const [editingRange, setEditingRange] = useState<PredefinedRange | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when custom ranges change

  const selectedPersonality = personalities[selectedPlayerIndex];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const customAIRanges = useMemo(() => loadCustomAIRanges(), [refreshKey]);
  const allAIRanges = useMemo(() => ({ ...PREDEFINED_AI_RANGES, ...customAIRanges }), [customAIRanges]);

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

  // Start creating a new custom range
  const handleCustomRangeCreate = useCallback(() => {
    if (!customRangeName.trim()) return;

    setEditingRangeName(customRangeName);
    setEditingRange(undefined); // Start with empty range
    setIsEditingRange(true);
    setIsCreatingCustomRange(false);
    setShowRangeSelector(false);
  }, [customRangeName]);

  // Start editing an existing range (predefined or custom)
  const handleEditRange = useCallback((rangeKey: string) => {
    const range = allAIRanges[rangeKey];
    if (!range) return;

    setEditingRangeName(range.name);
    setEditingRange(convertAIRangeToPredefinedRange(range));
    setIsEditingRange(true);
    setShowRangeSelector(false);
  }, [allAIRanges, convertAIRangeToPredefinedRange]);

  const handleSaveCustomRange = useCallback(() => {
    if (!editingRangeName.trim()) return;
    if (!editingRange || editingRange.hands.length === 0) return;

    const finalRange: AIRange = {
      name: editingRangeName,
      hands: editingRange.hands.map(h => ({
        hand: h.hand,
        frequency: h.frequency,
        action: (h.action || 'call') as 'fold' | 'call' | 'raise'
      }))
    };

    // Save to storage
    saveCustomAIRange(editingRangeName, finalRange);

    // Apply to current personality
    updatePersonality(selectedPlayerIndex, {
      preflopRange: undefined,
      customRanges: {
        ...selectedPersonality?.customRanges,
        preflop: finalRange
      }
    });

    // Reset editing state
    setIsEditingRange(false);
    setEditingRangeName('');
    setEditingRange(undefined);
    setCustomRangeName('');
    
    // Force refresh to reload custom ranges from localStorage
    setRefreshKey(prev => prev + 1);
  }, [editingRangeName, editingRange, selectedPlayerIndex, selectedPersonality?.customRanges, updatePersonality]);

  const handleCancelCustomRange = useCallback(() => {
    setIsEditingRange(false);
    setEditingRangeName('');
    setEditingRange(undefined);
    setCustomRangeName('');
    setIsCreatingCustomRange(false);
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
    
    // Force refresh to reload custom ranges from localStorage
    setRefreshKey(prev => prev + 1);
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
      // If we're editing a range, show the editing range
      if (isEditingRange && editingRange) {
        return editingRange;
      }
      
      // Show custom range if set
      if (selectedPersonality.customRanges?.preflop) {
        return convertAIRangeToPredefinedRange(selectedPersonality.customRanges.preflop);
      }
      
      // Show predefined range if set
      if (selectedPersonality.preflopRange && allAIRanges[selectedPersonality.preflopRange]) {
        return convertAIRangeToPredefinedRange(allAIRanges[selectedPersonality.preflopRange]);
      }
    }
    return undefined;
  };

  const currentRange = getCurrentRange();

  return (
    <div className="ai-range-settings">
      <div className="ai-range-header">
        <h3>Range Manager</h3>
        <p>Create and edit poker ranges for AI players</p>
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
                <h4>Available Ranges</h4>
                <p>Select a range to edit or create a new custom range</p>
              </div>

              <button 
                className="select-range-btn"
                onClick={() => setShowRangeSelector(!showRangeSelector)}
              >
                {showRangeSelector ? 'Hide Ranges' : 'Show Ranges'}
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
                        <button
                          className="edit-range-btn"
                          onClick={() => handleEditRange(key)}
                          title="Edit this range"
                        >
                          ✎
                        </button>
                        {customAIRanges[key] && (
                          <button
                            className="delete-range-btn"
                            onClick={() => handleCustomRangeDelete(key)}
                            title="Delete this range"
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

            {isEditingRange && editingRangeName && (
              <div className="custom-range-editor">
                <div className="editor-header">
                  <h4>Editing Range: {editingRangeName}</h4>
                  <p>Click hands to cycle: Add (Raise) → Call → Fold → Remove</p>
                </div>
                
                <div className="editor-controls">
                  <div className="control-group">
                    <span className="hands-count">Selected: {editingRange?.hands.length || 0} hands</span>
                  </div>
                  <div className="control-group">
                    <span className="info-text">💡 First click: Raise → Call → Fold → Remove</span>
                  </div>
                </div>
                
                <div className="editor-actions">
                  <button className="save-btn" onClick={handleSaveCustomRange} disabled={!editingRange || editingRange.hands.length === 0}>
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
                  selectedRange={isEditingRange ? editingRange : currentRange}
                  showFrequencies={false}
                  showActions={true}
                  isEditable={isEditingRange}
                  editMode="select"
                  onRangeChange={isEditingRange ? setEditingRange : undefined}
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

            {!currentRange && !isEditingRange && (
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