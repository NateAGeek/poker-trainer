import React from 'react';
import { getPredefinedRanges, getSavedRanges } from '../../../RangeMatrix';
import type { PredefinedRange } from '../../../RangeMatrix';
import './RangeSelector.scss';

export interface RangeSelectorProps {
  selectedRangeKey: string;
  onRangeChange: (rangeKey: string) => void;
  showFrequencies: boolean;
  onShowFrequenciesChange: (show: boolean) => void;
  showActions: boolean;
  onShowActionsChange: (show: boolean) => void;
  customRangeCount?: number;
  onClearCustomRange?: () => void;
  onSaveCustomRange?: (name: string) => void;
  onDeleteRange?: (key: string) => void;
  className?: string;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  selectedRangeKey,
  onRangeChange,
  showFrequencies,
  onShowFrequenciesChange,
  showActions,
  onShowActionsChange,
  customRangeCount = 0,
  onClearCustomRange,
  onSaveCustomRange,
  onDeleteRange,
  className = ''
}) => {
  const [saveRangeName, setSaveRangeName] = React.useState('');
  const [showSaveInput, setShowSaveInput] = React.useState(false);
  
  const predefinedRanges = React.useMemo(() => getPredefinedRanges(), []);
  const savedRanges = React.useMemo(() => getSavedRanges(), []);
  
  // Get current range info
  const currentRange = React.useMemo(() => {
    if (selectedRangeKey === 'customRange') return null;
    
    // Check predefined ranges first
    if (predefinedRanges[selectedRangeKey]) {
      return predefinedRanges[selectedRangeKey];
    }
    
    // Check saved ranges
    if (savedRanges[selectedRangeKey]) {
      return savedRanges[selectedRangeKey];
    }
    
    return null;
  }, [selectedRangeKey, predefinedRanges, savedRanges]);

  const handleSaveRange = () => {
    if (saveRangeName.trim() && onSaveCustomRange) {
      onSaveCustomRange(saveRangeName.trim());
      setSaveRangeName('');
      setShowSaveInput(false);
    }
  };

  const handleDeleteRange = (key: string) => {
    if (onDeleteRange && key.startsWith('saved_')) {
      if (confirm(`Are you sure you want to delete this saved range?`)) {
        onDeleteRange(key);
      }
    }
  };
  return (
    <div className={`range-selector-card stats-card ${className}`}>
      <h4>Range Selection</h4>
      <div className="stats-content">
        <div className="range-dropdown-container">
          <div className="stat-item">
            <label htmlFor="range-select">Select Range:</label>
            <select
              id="range-select"
              value={selectedRangeKey}
              onChange={(e) => onRangeChange(e.target.value)}
              className="range-dropdown"
            >
              <optgroup label="Custom Range">
                <option value="customRange">Custom Range</option>
              </optgroup>
              <optgroup label="Predefined Ranges">
                {Object.entries(predefinedRanges)
                  .filter(([key]) => key !== 'customRange') // Exclude customRange from predefined
                  .map(([key, range]) => (
                    <option key={key} value={key}>
                      {(range as PredefinedRange).name}
                    </option>
                  ))}
              </optgroup>
              {Object.keys(savedRanges).length > 0 && (
                <optgroup label="Saved Ranges">
                  {Object.entries(savedRanges).map(([key, range]) => (
                    <option key={key} value={key}>
                      {(range as PredefinedRange).name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            
            {/* Show range description for selected range */}
            {selectedRangeKey !== 'customRange' && currentRange && (
              <div className="range-info">
                <span className="range-description">
                  {currentRange.description || 'No description available'}
                </span>
              </div>
            )}
            
            {/* Delete button for saved ranges */}
            {selectedRangeKey.startsWith('saved_') && onDeleteRange && (
              <button
                className="delete-range-btn"
                onClick={() => handleDeleteRange(selectedRangeKey)}
                title="Delete this saved range"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>

        {selectedRangeKey === 'customRange' && (
          <div className="custom-range-controls">
            <div className="stat-item">
              <label>Custom Range Status:</label>
              <div className="custom-status">
                <span className="stat-value">
                  {customRangeCount > 0 ? `${customRangeCount} hands selected` : 'No hands selected'}
                </span>
                <div className="range-actions">
                  {customRangeCount > 0 && (
                    <>
                      {onSaveCustomRange && (
                        <button 
                          className="save-range-btn"
                          onClick={() => setShowSaveInput(!showSaveInput)}
                          title="Save this custom range"
                        >
                          💾 Save Range
                        </button>
                      )}
                      {onClearCustomRange && (
                        <button 
                          className="clear-range-btn"
                          onClick={onClearCustomRange}
                          title="Clear all selected hands"
                        >
                          🗑️ Clear Range
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {showSaveInput && (
              <div className="stat-item">
                <label>Save Range Name:</label>
                <div className="save-input-container">
                  <input
                    type="text"
                    value={saveRangeName}
                    onChange={(e) => setSaveRangeName(e.target.value)}
                    placeholder="Enter range name..."
                    className="save-range-input"
                    maxLength={30}
                  />
                  <button
                    className="save-confirm-btn"
                    onClick={handleSaveRange}
                    disabled={!saveRangeName.trim()}
                    title="Save range with this name"
                  >
                    ✓ Save
                  </button>
                  <button
                    className="save-cancel-btn"
                    onClick={() => {
                      setShowSaveInput(false);
                      setSaveRangeName('');
                    }}
                    title="Cancel saving"
                  >
                    ✗ Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="stat-item">
              <label className="instruction-label">
                💡 Click hands: 1st = Raise, 2nd = Call, 3rd = Fold, 4th = Remove | Drag to select multiple hands
              </label>
            </div>
          </div>
        )}

        <div className="display-options">
          <div className="stat-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={showFrequencies}
                onChange={(e) => onShowFrequenciesChange(e.target.checked)}
              />
              Show Frequencies
            </label>
          </div>
          <div className="stat-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={showActions}
                onChange={(e) => onShowActionsChange(e.target.checked)}
              />
              Show Actions
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};