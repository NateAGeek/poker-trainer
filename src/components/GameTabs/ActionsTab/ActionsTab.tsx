import { BettingInterface } from '../../BettingInterface/BettingInterface';
import { useGameStatus, useWinnerCalculation } from '../../../hooks/useGameDisplay';
import { usePlayerActions, useGameControls } from '../../../hooks/useGameActions';
import { useGameContext } from '../../../hooks/useGameContext';
import { PlayerAction } from '../../../types/poker';
import './ActionsTab.scss';

export function ActionsTab() {
  const { gameState, showdown } = useGameContext();
  const { gameInfo } = useGameStatus();
  const { winner } = useWinnerCalculation();
  const { handlePlayerAction } = usePlayerActions();
  const { resetGame } = useGameControls();

  const handleBettingAction = (action: string, amount?: number) => {
    handlePlayerAction(action as PlayerAction, amount);
  };

  return (
    <div className="actions-tab">
      {gameState.waitingForPlayerAction && !showdown ? (
        <BettingInterface
          onAction={handleBettingAction}
        />
      ) : !showdown ? (
        <div className="ai-action-indicator">
          <h3>Waiting for Action</h3>
          <p>{gameInfo.currentPlayerName} is thinking...</p>
          <div className="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ) : (
        <div className="showdown-section">
          <h3>Hand Complete</h3>
          {winner && (
            <div className="winner-announcement">
              {winner.isTie ? (
                <p><strong>It's a tie!</strong> Multiple players have {winner.evaluation.description}</p>
              ) : winner.player ? (
                <p><strong>{winner.player.name} wins</strong> with {winner.evaluation.description}!</p>
              ) : (
                <p><strong>It's a tie!</strong> Both players have {winner.evaluation.description}</p>
              )}
            </div>
          )}
          <button onClick={resetGame} className="new-game-btn">
            Deal New Hand
          </button>
        </div>
      )}
    </div>
  );
}