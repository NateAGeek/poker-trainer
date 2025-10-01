import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameDisplay } from './useGameDisplay';

/**
 * Custom hook for managing poker table layout and player positioning
 * Extracts complex positioning logic from PokerGame component
 */
export function useTableLayout() {
  const { gameState, getSeatIndex } = useGameDisplay();
  const tableBoardRef = useRef<HTMLDivElement>(null);
  const [playerPositions, setPlayerPositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  // Calculate player positions based on actual table size
  const calculatePlayerPositions = useCallback((boardWidth: number, boardHeight: number) => {
    const radius = Math.min(boardWidth, boardHeight) * 0.45;
    const centerX = boardWidth / 2;
    const centerY = boardHeight / 2;
    const positions = new Map<number, { x: number; y: number }>();
    
    // Get all occupied seats to determine how many positions we need
    const occupiedSeats = new Set<number>();
    gameState.players.forEach((_, index) => {
      occupiedSeats.add(getSeatIndex(index, gameState.players.length));
    });
    
    // Add empty seats if showing them
    if (gameState.players.length < 9) {
      const playersCount = gameState.players.length;
      const maxTableSize = 9;
      const emptySeatsToShow = Math.min(6, maxTableSize - playersCount);
      
      for (let i = 0; i < emptySeatsToShow; i++) {
        const virtualPlayerIndex = playersCount + i;
        const totalVirtualPlayers = playersCount + emptySeatsToShow;
        const seatIndex = getSeatIndex(virtualPlayerIndex, totalVirtualPlayers);
        occupiedSeats.add(seatIndex);
      }
    }
    
    // Convert to sorted array for consistent positioning
    const allSeats = Array.from(occupiedSeats).sort((a, b) => a - b);
    const totalSeats = allSeats.length;
    
    // Calculate dynamic angles - always start from bottom (90°) and distribute evenly
    const seatAngles = new Map<number, number>();
    
    if (totalSeats === 1) {
      // Single player at bottom
      seatAngles.set(allSeats[0], Math.PI / 2);
    } else {
      // Distribute players evenly around the circle
      // Start from bottom (90°) and go clockwise
      const angleStep = (2 * Math.PI) / totalSeats;
      
      allSeats.forEach((seat, index) => {
        // Start at 90° (bottom) and distribute clockwise
        const angle = Math.PI / 2 - (index * angleStep);
        seatAngles.set(seat, angle);
      });
    }
    
    // Calculate position for each seat
    seatAngles.forEach((angle, seat) => {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY - radius * Math.sin(angle); // Negative because CSS y increases downward
      positions.set(seat, { x, y });
    });
    
    return positions;
  }, [gameState.players, getSeatIndex]);

  // Measure table and calculate positions
  useEffect(() => {
    const measureTable = () => {
      if (tableBoardRef.current) {
        const rect = tableBoardRef.current.getBoundingClientRect();
        setPlayerPositions(calculatePlayerPositions(rect.width, rect.height));
      }
    };

    // Initial measurement
    measureTable();

    // Add resize observer for dynamic updates
    const resizeObserver = new ResizeObserver(measureTable);
    if (tableBoardRef.current) {
      resizeObserver.observe(tableBoardRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculatePlayerPositions]);

  // Memoized positioned players data
  const positionedPlayers = useMemo(() => {
    return gameState.players.map((player, index) => {
      const seatIndex = getSeatIndex(index, gameState.players.length);
      const position = playerPositions.get(seatIndex);
      
      return {
        player,
        index,
        seatIndex,
        position
      };
    });
  }, [gameState.players, getSeatIndex, playerPositions]);

  return {
    tableBoardRef,
    playerPositions,
    positionedPlayers
  };
}

/**
 * Custom hook for managing pot display animations
 */
export function usePotDisplay() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevPotSize, setPrevPotSize] = useState(0);

  const updatePotSize = useCallback((newPotSize: number) => {
    if (newPotSize !== prevPotSize) {
      setIsUpdating(true);
      setPrevPotSize(newPotSize);
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [prevPotSize]);

  return {
    isUpdating,
    updatePotSize
  };
}

/**
 * Custom hook for managing responsive table scaling
 */
export function useResponsiveTable() {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const minDimension = Math.min(containerRect.width, containerRect.height);
        
        // Calculate scale based on container size
        // Base scale for containers smaller than 800px
        if (minDimension < 600) {
          setScale(0.7);
        } else if (minDimension < 800) {
          setScale(0.85);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return {
    containerRef,
    scale,
    tableStyle: {
      transform: `scale(${scale})`,
      transformOrigin: 'center center'
    }
  };
}