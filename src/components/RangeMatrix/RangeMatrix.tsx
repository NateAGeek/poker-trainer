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
  onHandSelect?: (hand: string) => void;
  onHandsBulkSelect?: (hands: string[]) => void;
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
  className = ''
}) => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // Drag state management
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartHand, setDragStartHand] = React.useState<string | null>(null);
  const [draggedHands, setDraggedHands] = React.useState<Set<string>>(new Set());
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  
  // Create a map for quick lookup of range data
  const rangeMap = React.useMemo(() => {
    if (!selectedRange) return new Map();
    
    const map = new Map<string, RangeSelection>();
    selectedRange.hands.forEach(selection => {
      map.set(selection.hand, selection);
    });
    return map;
  }, [selectedRange]);

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
      return (
        <>
          <div className="hand-label">{hand}</div>
          <div className="action-label">{selection.action?.toUpperCase()}</div>
        </>
      );
    }
    
    return hand;
  };

  const handleCellClick = () => {
    // Prevent click handler from firing during drag operations
    // The mouse up handler will handle both single clicks and drag completion
    return;
  };

  const handleMouseDown = (hand: string) => {
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

  // Global mouse up handler to catch mouse up outside the matrix
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        if (isDragging && draggedHands.size > 1 && onHandsBulkSelect) {
          // Use bulk selection for drag operations (only if multiple hands)
          onHandsBulkSelect(Array.from(draggedHands));
        } else if (dragStartHand && onHandSelect && !isDragging) {
          // Use single selection for single clicks (only if not dragging)
          onHandSelect(dragStartHand);
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
  }, [isMouseDown, isDragging, draggedHands, dragStartHand, onHandsBulkSelect, onHandSelect]);

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
                  onClick={handleCellClick}
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