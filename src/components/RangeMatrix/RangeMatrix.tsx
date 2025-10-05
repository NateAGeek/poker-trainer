import React from 'react';
import './RangeMatrix.scss';

// Types for range definitions
export interface RangeSelection {
  hand: string;
  frequency: number; // 0-1 (0 = never, 1 = always)
  action?: 'fold' | 'call' | 'raise' | 'bet';
}

export interface PredefinedRange {
  name: string;
  description: string;
  hands: RangeSelection[];
  color?: string;
}

export interface RangeMatrixProps {
  selectedRange?: PredefinedRange;
  showFrequencies?: boolean;
  showActions?: boolean;
  // Controlled mode: parent manages selection
  onHandSelect?: (hand: string) => void;
  onHandsBulkSelect?: (hands: string[]) => void;
  onHandAction?: (hand: string, action: 'call' | 'raise') => void;
  // Uncontrolled mode: RangeMatrix manages its own state
  isEditable?: boolean;
  editMode?: 'select' | 'toggle'; // 'select' = add/remove hands, 'toggle' = cycle through actions
  onRangeChange?: (range: PredefinedRange) => void; // Called when internal range changes
  allowRemove?: boolean; // Whether clicking can remove hands (for cycling through fold -> remove)
  className?: string;
}

// Get hand string from matrix position
const getHandFromPosition = (row: number, col: number): string => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  if (row === col) {
    // Pocket pair
    return `${ranks[row]}${ranks[col]}`;
  } else if (row < col) {
    // Suited (upper triangle)
    return `${ranks[row]}${ranks[col]}s`;
  } else {
    // Offsuit (lower triangle)
    return `${ranks[col]}${ranks[row]}o`;
  }
};

export const RangeMatrix: React.FC<RangeMatrixProps> = ({
  selectedRange,
  showFrequencies = false,
  showActions = false,
  onHandSelect,
  onHandsBulkSelect,
  onHandAction,
  isEditable = false,
  editMode = 'select',
  onRangeChange,
  allowRemove = true,
  className = ''
}) => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // Internal state for uncontrolled mode
  const [internalRange, setInternalRange] = React.useState<Map<string, RangeSelection>>(new Map());
  
  // Track if we're syncing from external prop to prevent infinite loops
  const isSyncingRef = React.useRef(false);
  
  // Drag state management
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartHand, setDragStartHand] = React.useState<string | null>(null);
  const [draggedHands, setDraggedHands] = React.useState<Set<string>>(new Set());
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = !!(onHandSelect || onHandsBulkSelect || onHandAction);
  const isUncontrolled = !isControlled && isEditable;
  
  // Sync internal range with selectedRange prop when it changes (for uncontrolled mode)
  React.useEffect(() => {
    if (isUncontrolled && selectedRange) {
      isSyncingRef.current = true;
      const newMap = new Map<string, RangeSelection>();
      selectedRange.hands.forEach(hand => {
        newMap.set(hand.hand, hand);
      });
      setInternalRange(newMap);
      // Reset flag after state update
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [isUncontrolled, selectedRange]);
  
  // Create a map for quick lookup of range data
  const rangeMap = React.useMemo(() => {
    // Use internal state in uncontrolled mode
    if (isUncontrolled) {
      return internalRange;
    }
    
    // Use selectedRange in controlled mode
    if (!selectedRange) return new Map();
    
    const map = new Map<string, RangeSelection>();
    selectedRange.hands.forEach(selection => {
      map.set(selection.hand, selection);
    });
    return map;
  }, [selectedRange, internalRange, isUncontrolled]);
  
  // Notify parent of range changes in uncontrolled mode (but not during sync from parent)
  React.useEffect(() => {
    if (isUncontrolled && onRangeChange && !isSyncingRef.current) {
      const range: PredefinedRange = {
        name: 'Custom Range',
        description: `Custom range with ${internalRange.size} hands`,
        hands: Array.from(internalRange.values()),
        color: '#10b981'
      };
      onRangeChange(range);
    }
  }, [internalRange, isUncontrolled, onRangeChange]);

  const getCellClasses = (hand: string): string => {
    const selection = rangeMap.get(hand);
    if (!selection) return '';
    
    const { frequency, action } = selection;
    
    // Base color from action
    let colorClass: string;
    switch (action) {
      case 'raise':
      case 'bet':
        colorClass = 'raise-color';
        break;
      case 'call':
        colorClass = 'call-color';
        break;
      case 'fold':
        colorClass = 'fold-color';
        break;
      default:
        colorClass = 'default-color';
    }
    
    // Frequency class for opacity
    const frequencyClass = frequency > 0.8 ? 'high-frequency' : 
                          frequency > 0.5 ? 'medium-frequency' : 'low-frequency';
    
    return `${colorClass} ${frequencyClass}`;
  };

  const getCellContent = (hand: string): React.ReactNode => {
    const selection = rangeMap.get(hand);
    
    if (showFrequencies && selection) {
      return (
        <>
          <div className="hand-label">{hand}</div>
          <div className="frequency-label">{Math.round(selection.frequency * 100)}%</div>
        </>
      );
    }
    
    if (showActions && selection) {
      const actionLabel = selection.action === 'raise' ? 'R' : selection.action === 'call' ? 'C' : 'F';
      return (
        <>
          <div className="hand-label">{hand}</div>
          <div className="action-label">{actionLabel}</div>
        </>
      );
    }
    
    return hand;
  };

  const handleCellClick = (hand: string) => {
    // Uncontrolled mode - manage state internally
    if (isUncontrolled) {
      setInternalRange(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(hand);
        
        if (editMode === 'toggle' && current) {
          // Toggle mode: cycle through actions for existing hands
          const newAction = current.action === 'call' ? 'raise' : 'call';
          newMap.set(hand, { ...current, action: newAction });
        } else if (editMode === 'select') {
          // Select mode: cycle through raise -> call -> fold -> remove (like RangeAnalysis)
          if (!current) {
            newMap.set(hand, { hand, frequency: 1.0, action: 'raise' });
          } else {
            switch (current.action) {
              case 'raise':
                newMap.set(hand, { hand, frequency: 1.0, action: 'call' });
                break;
              case 'call':
                newMap.set(hand, { hand, frequency: 1.0, action: 'fold' });
                break;
              case 'fold':
                if (allowRemove) {
                  newMap.delete(hand);
                } else {
                  newMap.set(hand, { hand, frequency: 1.0, action: 'raise' });
                }
                break;
              default:
                newMap.set(hand, { hand, frequency: 1.0, action: 'raise' });
            }
          }
        }
        
        return newMap;
      });
      return;
    }
    
    // Controlled mode - use callbacks
    if (editMode === 'toggle' && onHandAction && rangeMap.has(hand)) {
      const selection = rangeMap.get(hand);
      if (selection) {
        const newAction = selection.action === 'call' ? 'raise' : 'call';
        onHandAction(hand, newAction);
      }
      return;
    }
    
    if (onHandSelect) {
      onHandSelect(hand);
    }
  };

  const handleMouseDown = (hand: string) => {
    // Don't start drag if we're in toggle mode and clicking a selected hand
    if (editMode === 'toggle' && rangeMap.has(hand)) {
      return;
    }
    
    setIsMouseDown(true);
    setDragStartHand(hand);
    setDraggedHands(new Set([hand]));
  };

  const handleMouseEnter = (hand: string) => {
    if (isMouseDown) {
      setIsDragging(true);
      setDraggedHands(prev => new Set([...prev, hand]));
    }
  };
  
  // Handle bulk selection in uncontrolled mode
  const handleBulkSelection = React.useCallback((hands: string[]) => {
    if (!isUncontrolled) return;
    
    setInternalRange(prev => {
      const newMap = new Map(prev);
      
      // Determine next action based on current state of all selected hands
      const handStates = hands.map(hand => newMap.get(hand)?.action || null);
      const uniqueStates = [...new Set(handStates)];
      
      let nextAction: 'raise' | 'call' | 'fold' | undefined = 'raise';
      
      if (uniqueStates.length === 1) {
        // All hands have same state, advance to next
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
            nextAction = allowRemove ? undefined : 'raise';
            break;
          default:
            nextAction = 'raise';
        }
      } else {
        // Mixed states, set all to raise
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
  }, [isUncontrolled, allowRemove]);

  // Global mouse up handler to catch mouse up outside the matrix
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        if (isDragging && draggedHands.size > 1) {
          // Uncontrolled mode - bulk selection
          if (isUncontrolled) {
            handleBulkSelection(Array.from(draggedHands));
          } else if (onHandsBulkSelect) {
            onHandsBulkSelect(Array.from(draggedHands));
          }
        } else if (dragStartHand && !isDragging) {
          // Single click handled by onClick
        }
        
        // Reset drag state
        setIsMouseDown(false);
        setIsDragging(false);
        setDragStartHand(null);
        setDraggedHands(new Set());
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isMouseDown, isDragging, draggedHands, dragStartHand, onHandsBulkSelect, isUncontrolled, handleBulkSelection]);

  return (
    <div className={`range-matrix ${className}`}>
      {selectedRange && (
        <div className="range-header">
          <h4 className="range-name">{selectedRange.name}</h4>
          <p className="range-description">{selectedRange.description}</p>
        </div>
      )}
      
      <div className="matrix-grid">
        {ranks.map((rowRank, rowIndex) => (
          <div key={rowRank} className="matrix-row">
            {ranks.map((colRank, colIndex) => {
              const hand = getHandFromPosition(rowIndex, colIndex);
              const selection = rangeMap.get(hand);
              const isSelected = !!selection;
              const isDragHighlighted = draggedHands.has(hand);
              
              return (
                <div
                  key={`${rowRank}-${colRank}`}
                  className={`matrix-cell ${isSelected ? 'selected' : ''} ${
                    isDragHighlighted ? 'drag-highlighted' : ''
                  } ${
                    rowIndex === colIndex ? 'pocket-pair' : 
                    rowIndex < colIndex ? 'suited' : 'offsuit'
                  } ${getCellClasses(hand)}`}
                  onClick={() => handleCellClick(hand)}
                  onMouseDown={() => handleMouseDown(hand)}
                  onMouseEnter={() => handleMouseEnter(hand)}
                >
                  {getCellContent(hand)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="matrix-legend">
        <div className="legend-item">
          <span className="legend-color pocket-pair-legend"></span>
          <span>Pocket Pairs</span>
        </div>
        <div className="legend-item">
          <span className="legend-color suited-legend"></span>
          <span>Suited (s)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color offsuit-legend"></span>
          <span>Offsuit (o)</span>
        </div>
      </div>
    </div>
  );
};