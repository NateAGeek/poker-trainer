import { useGameContext } from '../../../hooks/useGameContext';
import { useGameStatus } from '../../../hooks/useGameDisplay';
import './HistoryTab.scss';

export function HistoryTab() {
  const { gameState } = useGameContext();
  const { gameInfo } = useGameStatus();

  return (
    <div className="history-tab">
      <h3>Hand History</h3>
      <div className="history-content">
        <div className="history-item">
          <label>Current Hand:</label>
          <span>#{gameState.handNumber}</span>
        </div>
        <div className="history-item">
          <label>Game Phase:</label>
          <span>{gameInfo.phase}</span>
        </div>
        <div className="history-item">
          <label>Total Pot:</label>
          <span>${gameInfo.pot}</span>
        </div>
        <div className="history-item">
          <label>Blinds:</label>
          <span>${gameState.blinds.smallBlind}/${gameState.blinds.bigBlind}</span>
        </div>
        <div className="recent-actions">
          <h4>Recent Actions</h4>
          <div className="action-list">
            {gameState.players.map(player => (
              player.lastAction && (
                <div key={player.id} className="action-entry">
                  <span className="player-name">{player.name}:</span>
                  <span className="action">{player.lastAction}</span>
                  {player.currentBet > 0 && (
                    <span className="bet-amount">${player.currentBet}</span>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}