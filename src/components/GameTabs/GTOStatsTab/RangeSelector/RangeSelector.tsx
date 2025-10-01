import React from 'react';
import { PREDEFINED_RANGES } from '../../../RangeMatrix';
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
  className = ''
}) => {
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
              {Object.entries(PREDEFINED_RANGES).map(([key, range]) => (
                <option key={key} value={key}>
                  {(range as PredefinedRange).name}
                </option>
              ))}
            </select>
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
                {customRangeCount > 0 && onClearCustomRange && (
                  <button 
                    className="clear-range-btn"
                    onClick={onClearCustomRange}
                    title="Clear all selected hands"
                  >
                    Clear Range
                  </button>
                )}
              </div>
            </div>
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