import { useState, useEffect } from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { useAIPlayer } from '../../hooks/useAIPlayer';
import './AIInfoPanel.scss';

/**
 * Decision history entry
 */
interface DecisionHistoryEntry {
  id: string;
  timestamp: number;
  playerName: string;
  playerId: string;
  hand: string;
  action: string;
  amount?: number;
  handNumber: number;
  gamePhase: string;
  pot: number;
  chips: number;
  personality: string;
  wasInRange: boolean;
  recommendedAction?: string;
  frequency?: number;
}

/**
 * Example component demonstrating useAIPlayer hook usage
 * This component shows real-time AI player information and decision-making process
 */
export function AIInfoPanel() {
  const { gameState } = useGameContext();
  const {
    currentAIPlayer,
    isAITurn,
    aiPlayers,
    getAIStats,
    getHandNotation,
    getRangeForPlayer,
    checkHandInRange,
    personalities
  } = useAIPlayer();

  // Decision history state
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryEntry[]>([]);
  const [maxHistorySize] = useState(50); // Keep last 50 decisions

  // Track AI decisions
  useEffect(() => {
    // When an AI player makes an action, record it
    const players = gameState.players;
    
    players.forEach(player => {
      if (!player.isHuman && player.lastAction) {
        const existingEntry = decisionHistory.find(
          entry => 
            entry.playerId === player.id && 
            entry.handNumber === gameState.handNumber &&
            entry.gamePhase === gameState.gamePhase &&
            entry.action === player.lastAction
        );

        // Only add if this is a new decision (not already recorded)
        if (!existingEntry) {
          const hand = getHandNotation(player.hand);
          const personality = player.aiPersonality;
          let rangeCheck = null;
          
          if (personality && player.hand.length === 2 && gameState.gamePhase === 'preflop') {
            rangeCheck = checkHandInRange(player.hand, personality);
          }

          const newEntry: DecisionHistoryEntry = {
            id: `${player.id}-${gameState.handNumber}-${gameState.gamePhase}-${Date.now()}`,
            timestamp: Date.now(),
            playerName: player.name,
            playerId: player.id,
            hand,
            action: player.lastAction,
            amount: player.currentBet,
            handNumber: gameState.handNumber,
            gamePhase: gameState.gamePhase,
            pot: gameState.pot,
            chips: player.chips,
            personality: personality?.name || 'Unknown',
            wasInRange: rangeCheck?.shouldPlay ?? false,
            recommendedAction: rangeCheck?.action,
            frequency: rangeCheck?.frequency
          };

          setDecisionHistory(prev => {
            const updated = [newEntry, ...prev];
            // Keep only the most recent entries
            return updated.slice(0, maxHistorySize);
          });
        }
      }
    });
  }, [gameState.players, gameState.handNumber, gameState.gamePhase, gameState.pot, getHandNotation, checkHandInRange, decisionHistory, maxHistorySize]);

  // Clear history when session resets
  useEffect(() => {
    if (gameState.handNumber === 1) {
      setDecisionHistory([]);
    }
  }, [gameState.handNumber]);

  if (!currentAIPlayer) {
    return (
      <div className="ai-info-panel">
        <h3>AI Player Info</h3>
        <p className="no-ai">No AI player active (Human player's turn or showdown)</p>
        <div className="ai-players-list">
          <h4>AI Players in Game</h4>
          {aiPlayers.length === 0 ? (
            <p>No AI players in game</p>
          ) : (
            <ul>
              {aiPlayers.map(player => {
                const stats = getAIStats(player.id);
                return (
                  <li key={player.id} className={stats?.isActive ? 'active' : 'inactive'}>
                    <span className="player-name">{stats?.name}</span>
                    <span className="player-chips">{stats?.chips} chips</span>
                    <span className="player-position">{stats?.position}</span>
                    {stats?.isAllIn && <span className="all-in-badge">ALL IN</span>}
                    {!stats?.isActive && <span className="folded-badge">Folded</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  const stats = getAIStats(currentAIPlayer.id);
  const range = getRangeForPlayer(currentAIPlayer);
  const handNotation = getHandNotation(currentAIPlayer.hand);
  const personality = currentAIPlayer.aiPersonality;
  
  let rangeCheck = null;
  if (personality && currentAIPlayer.hand.length === 2) {
    rangeCheck = checkHandInRange(currentAIPlayer.hand, personality);
  }

  return (
    <div className="ai-info-panel">
      <div className="panel-header">
        <h3>Current AI Player</h3>
        {isAITurn && <span className="ai-thinking">🤔 Thinking...</span>}
      </div>

      <div className="ai-details">
        <div className="detail-row">
          <label>Name:</label>
          <span className="value">{stats?.name}</span>
        </div>
        
        <div className="detail-row">
          <label>Position:</label>
          <span className="value position">{stats?.position}</span>
        </div>
        
        <div className="detail-row">
          <label>Chips:</label>
          <span className="value chips">{stats?.chips}</span>
        </div>
        
        <div className="detail-row">
          <label>Last Action:</label>
          <span className="value action">{stats?.lastAction || 'None'}</span>
        </div>

        {stats?.isAllIn && (
          <div className="detail-row">
            <span className="all-in-indicator">⚠️ ALL IN</span>
          </div>
        )}
      </div>

      <div className="personality-section">
        <h4>Personality</h4>
        {personality && (
          <div className="personality-details">
            <div className="personality-name">{personality.name || 'Unknown'}</div>
            <div className="personality-stats">
              <div className="stat">
                <label>Aggression:</label>
                <div className="bar">
                  <div 
                    className="fill aggressive" 
                    style={{ width: `${personality.aggressiveness * 100}%` }}
                  />
                </div>
                <span>{(personality.aggressiveness * 100).toFixed(0)}%</span>
              </div>
              
              <div className="stat">
                <label>Bluff Freq:</label>
                <div className="bar">
                  <div 
                    className="fill bluff" 
                    style={{ width: `${personality.bluffFrequency * 100}%` }}
                  />
                </div>
                <span>{(personality.bluffFrequency * 100).toFixed(0)}%</span>
              </div>
              
              <div className="stat">
                <label>Tightness:</label>
                <div className="bar">
                  <div 
                    className="fill tight" 
                    style={{ width: `${personality.foldThreshold * 100}%` }}
                  />
                </div>
                <span>{(personality.foldThreshold * 100).toFixed(0)}%</span>
              </div>
              
              <div className="stat">
                <label>Raise Bias:</label>
                <div className="bar">
                  <div 
                    className="fill raise" 
                    style={{ width: `${personality.raiseBias * 100}%` }}
                  />
                </div>
                <span>{(personality.raiseBias * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {range && (
        <div className="range-section">
          <h4>Playing Range</h4>
          <div className="range-info">
            <div className="range-name">{range.name}</div>
            <div className="range-stats">
              <span>{range.hands.length} hand combinations</span>
            </div>
          </div>
        </div>
      )}

      {handNotation && (
        <div className="hand-section">
          <h4>Current Hand</h4>
          <div className="hand-info">
            <div className="hand-notation">{handNotation}</div>
            {rangeCheck && (
              <div className="range-check">
                <div className={`should-play ${rangeCheck.shouldPlay ? 'yes' : 'no'}`}>
                  {rangeCheck.shouldPlay ? '✓ In Range' : '✗ Not in Range'}
                </div>
                {rangeCheck.shouldPlay && (
                  <>
                    <div className="recommended-action">
                      Recommended: <strong>{rangeCheck.action.toUpperCase()}</strong>
                    </div>
                    <div className="frequency">
                      Frequency: {(rangeCheck.frequency * 100).toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="all-ai-section">
        <h4>All AI Players</h4>
        <div className="ai-grid">
          {aiPlayers.map(player => {
            const playerStats = getAIStats(player.id);
            const isCurrent = player.id === currentAIPlayer.id;
            return (
              <div 
                key={player.id} 
                className={`ai-card ${isCurrent ? 'current' : ''} ${!playerStats?.isActive ? 'inactive' : ''}`}
              >
                <div className="ai-card-header">
                  <span className="ai-card-name">{playerStats?.name}</span>
                  {isCurrent && <span className="current-badge">Current</span>}
                </div>
                <div className="ai-card-body">
                  <div className="ai-card-stat">
                    <span className="label">Chips:</span>
                    <span className="value">{playerStats?.chips}</span>
                  </div>
                  <div className="ai-card-stat">
                    <span className="label">Pos:</span>
                    <span className="value">{playerStats?.position}</span>
                  </div>
                  {playerStats?.isAllIn && (
                    <div className="ai-card-badge all-in">ALL IN</div>
                  )}
                  {!playerStats?.isActive && (
                    <div className="ai-card-badge folded">Folded</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="decision-history-section">
        <div className="section-header">
          <h4>Decision History</h4>
          <button 
            className="clear-history-btn"
            onClick={() => setDecisionHistory([])}
            disabled={decisionHistory.length === 0}
          >
            Clear History
          </button>
        </div>
        
        {decisionHistory.length === 0 ? (
          <p className="no-history">No decisions recorded yet. AI decisions will appear here as they play.</p>
        ) : (
          <div className="history-list">
            {decisionHistory.map((entry) => (
              <div key={entry.id} className="history-entry">
                <div className="history-header">
                  <span className="history-player">{entry.playerName}</span>
                  <span className="history-time">
                    Hand #{entry.handNumber} • {entry.gamePhase}
                  </span>
                </div>
                <div className="history-body">
                  <div className="history-main">
                    <div className="history-hand">
                      <span className="label">Hand:</span>
                      <span className="value">{entry.hand || 'Unknown'}</span>
                    </div>
                    <div className="history-action">
                      <span className="label">Action:</span>
                      <span className={`value action-${entry.action}`}>
                        {entry.action.toUpperCase()}
                        {entry.amount ? ` (${entry.amount})` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="history-details">
                    <div className="history-detail">
                      <span className="label">Pot:</span>
                      <span className="value">{entry.pot}</span>
                    </div>
                    <div className="history-detail">
                      <span className="label">Chips:</span>
                      <span className="value">{entry.chips}</span>
                    </div>
                    <div className="history-detail">
                      <span className="label">Personality:</span>
                      <span className="value">{entry.personality}</span>
                    </div>
                  </div>
                  {entry.gamePhase === 'preflop' && (
                    <div className="history-range-info">
                      <div className={`range-status ${entry.wasInRange ? 'in-range' : 'out-range'}`}>
                        {entry.wasInRange ? '✓ In Range' : '✗ Out of Range'}
                      </div>
                      {entry.wasInRange && entry.recommendedAction && (
                        <div className="range-details">
                          <span className="recommended">
                            Recommended: {entry.recommendedAction.toUpperCase()}
                          </span>
                          {entry.frequency !== undefined && (
                            <span className="frequency">
                              ({(entry.frequency * 100).toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="personalities-reference">
        <h4>Available Personalities</h4>
        <div className="personalities-grid">
          {Object.entries(personalities).map(([key, p]) => (
            <div key={key} className="personality-card">
              <div className="personality-card-name">{p.name}</div>
              <div className="personality-card-range">{p.preflopRange}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
