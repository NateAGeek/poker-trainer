import { useWinnerCalculation } from '../../../hooks/useGameDisplay';
import { useGameContext } from '../../../hooks/useGameContext';
import { useGameStatus } from '../../../hooks/useGameDisplay';
import './ResultsTab.scss';

export function ResultsTab() {
  const { gameState, showdown } = useGameContext();
  const { gameInfo } = useGameStatus();
  const { allPlayerEvaluations } = useWinnerCalculation();

  return (
    <div className="results-tab">
      {showdown ? (
        <>
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
        </>
      ) : (
        <>
          <h3>Results</h3>
          <div className="no-results">
            <div className="no-results-icon">🏆</div>
            <p>Hand results will appear here when the hand is complete.</p>
            <div className="current-hand-info">
              <div className="info-item">
                <span className="label">Hand #:</span>
                <span className="value">{gameState.handNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Phase:</span>
                <span className="value">{gameInfo.phase}</span>
              </div>
              <div className="info-item">
                <span className="label">Pot:</span>
                <span className="value">${gameState.pot}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}