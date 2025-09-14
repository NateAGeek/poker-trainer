import { Hand } from './Hand';
import { PlayerHand } from './PlayerHand';
import { PlayerCountSelector } from './PlayerCountSelector';
import { GameTabs } from './GameTabs';
import { useGameDisplay, useGameStatus } from '../hooks/useGameDisplay';
import { useGameControls } from '../hooks/useGameActions';
import { useAIAutomation } from '../hooks/useAIAutomation';
import { useRef, useEffect, useState, useCallback } from 'react';

export function PokerGame() {
  // Custom hooks for game state and actions
  const { gameState, visibleCommunityCards, showdown, getSeatIndex } = useGameDisplay();
  const { gameInfo, playerCount, canChangePlayerCount } = useGameStatus();
  const { initializeNewGame } = useGameControls();
  
  // Table measurement for dynamic positioning
  const tableBoardRef = useRef<HTMLDivElement>(null);
  const [tableSize, setTableSize] = useState({ width: 0, height: 0, radius: 0 });
  const [playerPositions, setPlayerPositions] = useState<Map<number, { x: number; y: number }>>(new Map());
  
  // Auto-handle AI actions
  useAIAutomation();

  // Calculate player positions based on actual table size
  const calculatePlayerPositions = useCallback((boardWidth: number, boardHeight: number) => {
    const radius = Math.min(boardWidth, boardHeight) * 0.45; // 45% of table size for positioning radius
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
        const newTableSize = {
          width: rect.width,
          height: rect.height,
          radius: Math.min(rect.width, rect.height) / 2
        };
        
        setTableSize(newTableSize);
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

  // Handler for player count changes
  const handlePlayerCountChange = (newCount: number) => {
    initializeNewGame(newCount);
  };

  return (
    <div className="poker-game">
      <div className="game-header">
        <h1>Texas Hold'em Poker</h1>
        <PlayerCountSelector
          playerCount={playerCount}
          onPlayerCountChange={handlePlayerCountChange}
          disabled={!canChangePlayerCount}
        />
        <div className="game-info">
          <span>Phase: {gameInfo.phase}</span>
          <span>Pot: ${gameInfo.pot}</span>
          <span>Dealer: Player {gameState.dealerPosition + 1}</span>
        </div>
      </div>

      <div className="game-layout">
        {/* Left Column - Game Board */}
        <div className="game-board-column">
          <div className="game-board" ref={tableBoardRef}>
            {/* Center of the table - Community Cards */}
            <div className="poker-table-center">
              <div className="community-section">
                <Hand
                  cards={visibleCommunityCards}
                  label="Community Cards"
                />
              </div>
              <div className="pot-display">
                <div className="pot-label">Pot</div>
                <div className="pot-amount">${gameState.pot}</div>
              </div>
            </div>

            {/* Position all players around the circular table */}
            {gameState.players.map((player, index) => {
              const seatIndex = getSeatIndex(index, gameState.players.length);
              const position = playerPositions.get(seatIndex);
              
              return (
                <div 
                  key={player.id} 
                  className="player-seat"
                  data-seat={seatIndex}
                  style={position ? {
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)'
                  } : {}}
                >
                  <div className="player-content">
                    <PlayerHand
                      player={player}
                      seatIndex={index}
                      dealerSeatIndex={gameState.dealerPosition}
                      totalPlayers={gameState.players.length}
                      isCurrentPlayer={index === gameState.currentPlayer && !showdown}
                      faceDown={index !== 0 && !showdown}
                      showHandRank={showdown}
                    />
                  </div>
                </div>
              );
            })}

            {/* Show empty seats for visual reference when table isn't full */}
            {/* {gameState.players.length < 9 && (() => {
              // Calculate how many empty seats to show (up to 6, but at least fill to minimum visual table)
              const playersCount = gameState.players.length;
              const maxTableSize = 9; // Maximum poker table size
              const emptySeatsToShow = Math.min(6, maxTableSize - playersCount);
              
              return Array.from({ length: emptySeatsToShow }, (_, i) => {
                // Create a virtual player index for empty seats
                const virtualPlayerIndex = playersCount + i;
                const totalVirtualPlayers = playersCount + emptySeatsToShow;
                const seatIndex = getSeatIndex(virtualPlayerIndex, totalVirtualPlayers);
                const position = playerPositions.get(seatIndex);
                
                return (
                  <div 
                    key={`empty-${i}`} 
                    className="player-seat"
                    data-seat={seatIndex}
                    style={position ? {
                      position: 'absolute',
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      transform: 'translate(-50%, -50%)'
                    } : {}}
                  >
                    <div className="player-content">
                      <div className="empty-seat">
                        Empty
                      </div>
                    </div>
                  </div>
                );
              });
            })()} */}
          </div>
        </div>

        {/* Right Column - Controls and Stats */}
        <div className="controls-stats-column">
          <GameTabs />
        </div>
      </div>
    </div>
  );
}
