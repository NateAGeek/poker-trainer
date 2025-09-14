import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BettingInterface } from './BettingInterface';
import { useGameStatus, useWinnerCalculation } from '../hooks/useGameDisplay';
import { usePlayerActions, useGameControls } from '../hooks/useGameActions';
import { useGameContext } from '../hooks/useGameContext';
import 'react-tabs/style/react-tabs.css';

export function GameTabs() {
  const { gameState, showdown } = useGameContext();
  const { gameInfo } = useGameStatus();
  const { winner, allPlayerEvaluations } = useWinnerCalculation();
  const { getAvailableActions, handlePlayerAction } = usePlayerActions();
  const { resetGame } = useGameControls();

  return (
    <div className="game-tabs-container">
      <Tabs className="game-tabs" defaultIndex={0}>
        <TabList className="tab-list">
          <Tab className="tab" selectedClassName="tab--selected">
            <span className="tab-icon">🎮</span>
            <span className="tab-label">Actions</span>
          </Tab>
          <Tab className="tab" selectedClassName="tab--selected">
            <span className="tab-icon">📊</span>
            <span className="tab-label">GTO Stats</span>
          </Tab>
          {showdown && (
            <Tab className="tab" selectedClassName="tab--selected">
              <span className="tab-icon">🏆</span>
              <span className="tab-label">Results</span>
            </Tab>
          )}
          <Tab className="tab" selectedClassName="tab--selected">
            <span className="tab-icon">📋</span>
            <span className="tab-label">History</span>
          </Tab>
        </TabList>

        {/* Actions Tab */}
        <TabPanel className="tab-panel">
          <div className="game-controls">
            {gameState.waitingForPlayerAction && !showdown ? (
              <BettingInterface
                availableActions={getAvailableActions(gameState.players[0])}
                currentBet={Math.max(...gameState.players.map(p => p.currentBet))}
                minRaise={gameState.bettingRound.minRaise}
                maxBet={gameState.players[0].chips}
                playerChips={gameState.players[0].chips}
                potSize={gameState.pot}
                onAction={handlePlayerAction}
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
        </TabPanel>

        {/* GTO Stats Tab */}
        <TabPanel className="tab-panel">
          <div className="gto-stats-section">
            <h3>GTO Analysis</h3>
            <div className="stats-content">
              <div className="stat-item">
                <label>Hand Strength:</label>
                <span className="stat-value">--</span>
              </div>
              <div className="stat-item">
                <label>Equity vs Range:</label>
                <span className="stat-value">--</span>
              </div>
              <div className="stat-item">
                <label>Optimal Action:</label>
                <span className="stat-value optimal-action">--</span>
              </div>
              <div className="stat-item">
                <label>EV of Actions:</label>
                <div className="action-evs">
                  <div className="ev-item">
                    <span className="action-name">Fold:</span>
                    <span className="ev-value">--</span>
                  </div>
                  <div className="ev-item">
                    <span className="action-name">Call:</span>
                    <span className="ev-value">--</span>
                  </div>
                  <div className="ev-item">
                    <span className="action-name">Raise:</span>
                    <span className="ev-value">--</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <label>Pot Odds:</label>
                <span className="stat-value">--</span>
              </div>
              <div className="stat-item">
                <label>Implied Odds:</label>
                <span className="stat-value">--</span>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Results Tab (only visible during showdown) */}
        {showdown && (
          <TabPanel className="tab-panel">
            <div className="hand-evaluations">
              <h3>Hand Results</h3>
              <div className="evaluations-list">
                {allPlayerEvaluations
                  .sort((a, b) => b.evaluation.ranking - a.evaluation.ranking)
                  .map(({ player, evaluation }, index) => (
                    <div key={player.id} className={`evaluation ${index === 0 ? 'winner' : ''}`}>
                      <div className="evaluation-header">
                        <h4>{player.name}</h4>
                        {index === 0 && <span className="winner-badge">🏆</span>}
                      </div>
                      <p className="hand-description">{evaluation.description}</p>
                      <div className="evaluation-cards">
                        {evaluation.cards.slice(0, 5).map((card, cardIndex) => (
                          <span key={cardIndex} className="eval-card">
                            {card.rank}{card.suit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabPanel>
        )}

        {/* History Tab */}
        <TabPanel className="tab-panel">
          <div className="game-history">
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
                <span>${gameState.pot}</span>
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
        </TabPanel>
      </Tabs>
    </div>
  );
}