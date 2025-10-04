import { useGameContext } from '../../../hooks/useGameContext';
import { calculateWinRate, calculateSessionDuration, formatSessionDuration } from '../../../utils/sessionUtils';
import { formatBettingAmount } from '../../../utils/bettingUtils';
import './SessionStatsTab.scss';

export function SessionStatsTab() {
  const { gameSession, gameSettings } = useGameContext();
  
  const winRate = calculateWinRate(gameSession);
  const sessionDuration = calculateSessionDuration(gameSession);
  const sessionDurationFormatted = formatSessionDuration(sessionDuration);
  
  const formatChipAmount = (amount: number) => {
    return formatBettingAmount(amount, gameSettings.bigBlind, gameSettings.bettingDisplayMode);
  };

  return (
    <div className="session-stats-tab">
      <div className="stats-header">
        <h3>Session Statistics</h3>
        <div className="session-info">
          <span className="session-duration">Session: {sessionDurationFormatted}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Hands Played</div>
          <div className="stat-value">{gameSession.handsPlayed}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Hands Won</div>
          <div className="stat-value">{gameSession.handsWon}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className={`stat-value ${winRate > 50 ? 'positive' : winRate < 50 ? 'negative' : ''}`}>
            {winRate.toFixed(1)}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Winnings</div>
          <div className={`stat-value ${gameSession.totalWinnings > 0 ? 'positive' : gameSession.totalWinnings < 0 ? 'negative' : ''}`}>
            {gameSession.totalWinnings > 0 ? '+' : ''}{formatChipAmount(gameSession.totalWinnings)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Biggest Pot</div>
          <div className="stat-value">{formatChipAmount(gameSession.biggestPot)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg. Pot Size</div>
          <div className="stat-value">
            {gameSession.handsPlayed > 0 
              ? formatChipAmount(Math.round(gameSession.history.reduce((sum, hand) => sum + hand.finalPot, 0) / gameSession.handsPlayed))
              : formatChipAmount(0)
            }
          </div>
        </div>
      </div>

      {gameSession.history.length > 0 && (
        <div className="recent-hands">
          <h4>Recent Hands</h4>
          <div className="hands-list">
            {gameSession.history.slice(-5).reverse().map((hand) => (
              <div key={hand.handNumber} className="hand-summary">
                <div className="hand-info">
                  <span className="hand-number">#{hand.handNumber}</span>
                  <span className="pot-size">{formatChipAmount(hand.finalPot)} pot</span>
                </div>
                <div className="hand-result">
                  {hand.winner ? (
                    <span className={`winner ${hand.winner.playerId === 'player1' ? 'you-won' : 'opponent-won'}`}>
                      {hand.winner.playerId === 'player1' ? 'You won' : `${hand.winner.playerName} won`}
                    </span>
                  ) : (
                    <span className="no-winner">No contest</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameSession.handsPlayed === 0 && (
        <div className="no-data">
          <p>No hands played yet. Start playing to see your statistics!</p>
        </div>
      )}
    </div>
  );
}