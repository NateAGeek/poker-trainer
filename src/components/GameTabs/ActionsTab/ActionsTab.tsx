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
  const { newHand, resetSession } = useGameControls();

  const handleBettingAction = (action: string, amount?: number) => {
    handlePlayerAction(action as PlayerAction, amount);
  };

  // Check if human player (player1) is eliminated
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const isHumanEliminated = humanPlayer?.isEliminated || false;

  // Check if only one player remains (game over)
  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const isGameOver = activePlayers.length <= 1;

  return (
    <div className="actions-tab">
      {isHumanEliminated ? (
        <div className="game-over-section">
          <h3>💀 You've Been Eliminated!</h3>
          <div className="elimination-message">
            <p>You ran out of chips and have been eliminated from the game.</p>
            <p>Better luck next time!</p>
          </div>
          <button onClick={resetSession} className="new-game-btn">
            🔄 Start New Session
          </button>
        </div>
      ) : isGameOver ? (
        <div className="game-over-section">
          <h3>🏆 Game Over!</h3>
          <div className="game-over-message">
            <p>Only one player remains!</p>
            {activePlayers.length === 1 && (
              <p><strong>{activePlayers[0].name} wins the game!</strong></p>
            )}
          </div>
          <button onClick={resetSession} className="new-game-btn">
            🔄 Start New Session
          </button>
        </div>
      ) : gameState.waitingForPlayerAction && !showdown ? (
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
          <h3>Hand #{gameState.handNumber} Complete</h3>
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
          <div className="next-hand-info">
            <p>Ready for the next hand? Dealer button will move to the next player.</p>
          </div>
          <button onClick={newHand} className="new-game-btn">
            🃏 Next Hand
          </button>
        </div>
      )}
    </div>
  );
}