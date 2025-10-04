import { Hand } from '../Hand/Hand';
import { GameTabs } from '../GameTabs/GameTabs';
import { GameSettings } from '../GameSettings';
import { TablePlayer } from './TablePlayer';
import { useGameDisplay, useGameStatus } from '../../hooks/useGameDisplay';
import { useAIAutomation } from '../../hooks/useAIAutomation';
import { useTableLayout, usePotDisplay } from '../../hooks/useTableLayout';
import { useGameContext } from '../../hooks/useGameContext';
import { useGameControls } from '../../hooks/useGameActions';
import { useEffect, useMemo, useState } from 'react';
import { calculateCurrentPotSize } from '../../utils/gameUtils';
import { formatBettingAmount } from '../../utils/bettingUtils';
import type { GameSettings as GameSettingsType } from '../../types/poker';
import "./PokerGame.scss";

export function PokerGame() {
  // Custom hooks for game state and actions
  const { gameState, visibleCommunityCards, showdown } = useGameDisplay();
  const { gameInfo } = useGameStatus();
  const { gameSettings, dispatch } = useGameContext();
  
  // Import useGameControls for reset functionality
  const { resetSession } = useGameControls();
  
  // Local state for settings modal
  const [showSettings, setShowSettings] = useState(false);
  
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

  // Format pot amount based on display mode
  const formattedPotAmount = useMemo(() => {
    return formatBettingAmount(
      currentPotSize, 
      gameSettings.bigBlind, 
      gameSettings.bettingDisplayMode
    );
  }, [currentPotSize, gameSettings]);

  // Handler for game settings changes
  const handleSettingsChange = (newSettings: GameSettingsType) => {
    dispatch({
      type: 'UPDATE_GAME_SETTINGS',
      payload: { gameSettings: newSettings }
    });
  };

  return (
    <div className="poker-game">
      <div className="game-header">
        <div className="header-left">
          <h1>Texas Hold'em Poker</h1>
          <div className="game-type-indicator">
            {gameSettings.gameType === 'cash' ? 'Cash Game' : 'Tournament'}
          </div>
        </div>
        
        <div className="header-right">
          <div className="game-info">
            <div className="info-item phase-info">
              <span className="info-label">Phase</span>
              <span className="info-value">{gameInfo.phase}</span>
            </div>
            <div className="info-item pot-info">
              <span className="info-label">Pot</span>
              <span className="info-value">{formattedPotAmount}</span>
            </div>
            <div className="info-item blinds-info">
              <span className="info-label">Blinds</span>
              <span className="info-value">
                {formatBettingAmount(gameSettings.smallBlind, gameSettings.bigBlind, gameSettings.bettingDisplayMode)}/
                {formatBettingAmount(gameSettings.bigBlind, gameSettings.bigBlind, gameSettings.bettingDisplayMode)}
              </span>
            </div>
            <div className="info-item dealer-info">
              <span className="info-label">Dealer</span>
              <span className="info-value">P{gameState.dealerPosition + 1}</span>
            </div>
            <div className="info-item hand-info">
              <span className="info-label">Hand</span>
              <span className="info-value">#{gameState.handNumber}</span>
            </div>
            <div className="info-item settings-info">
              <button 
                className="settings-button"
                onClick={() => setShowSettings(true)}
                title="Game Settings"
              >
                ⚙️ Settings
              </button>
            </div>
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
                  {formattedPotAmount}
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

      {/* Game Settings Modal */}
      <GameSettings
        currentSettings={gameSettings}
        onSettingsChange={handleSettingsChange}
        onResetSession={resetSession}
        onClose={() => setShowSettings(false)}
        isOpen={showSettings}
      />
    </div>
  );
}
