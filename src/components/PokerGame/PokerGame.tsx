import { Hand } from '../Hand/Hand';
import { PlayerCountSelector } from '../PlayerCountSelector';
import { GameTabs } from '../GameTabs/GameTabs';
import { TablePlayer } from './TablePlayer';
import { useGameDisplay, useGameStatus } from '../../hooks/useGameDisplay';
import { useGameControls } from '../../hooks/useGameActions';
import { useAIAutomation } from '../../hooks/useAIAutomation';
import { useTableLayout, usePotDisplay } from '../../hooks/useTableLayout';
import { useEffect, useMemo } from 'react';
import { calculateCurrentPotSize } from '../../utils/gameUtils';
import "./PokerGame.scss";

export function PokerGame() {
  // Custom hooks for game state and actions
  const { gameState, visibleCommunityCards, showdown } = useGameDisplay();
  const { gameInfo, playerCount, canChangePlayerCount } = useGameStatus();
  const { initializeNewGame } = useGameControls();
  
  // Table layout and positioning
  const { tableBoardRef, positionedPlayers } = useTableLayout();
  
  // Calculate real-time pot size including current bets
  const currentPotSize = useMemo(() => {
    return calculateCurrentPotSize(gameState);
  }, [gameState]);
  
  // Animation for pot value changes
  const { isUpdating, updatePotSize } = usePotDisplay();
  
  useEffect(() => {
    updatePotSize(currentPotSize);
  }, [currentPotSize, updatePotSize]);
  
  // Auto-handle AI actions
  useAIAutomation();

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
          <div className="info-item phase-info">
            <span className="info-label">Phase</span>
            <span className="info-value">{gameInfo.phase}</span>
          </div>
          <div className="info-item pot-info">
            <span className="info-label">Pot</span>
            <span className="info-value">${gameInfo.pot}</span>
          </div>
          <div className="info-item dealer-info">
            <span className="info-label">Dealer</span>
            <span className="info-value">P{gameState.dealerPosition + 1}</span>
          </div>
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
                <div className={`pot-amount ${isUpdating ? 'updating' : ''}`}>
                  {`$${currentPotSize.toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Position all players around the circular table */}
            {positionedPlayers.map(({ player, index, seatIndex, position }) => (
              <TablePlayer
                key={player.id}
                player={player}
                index={index}
                seatIndex={seatIndex}
                position={position}
                dealerSeatIndex={gameState.dealerPosition}
                totalPlayers={gameState.players.length}
                isCurrentPlayer={index === gameState.currentPlayer && !showdown}
                faceDown={index !== 0 && !showdown}
                showHandRank={showdown}
              />
            ))}
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
