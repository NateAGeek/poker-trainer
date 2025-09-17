import './GTOStatsTab.scss';
import { useGameContext } from '../../../hooks/useGameContext';
import { calculateHandStrength } from '../../../utils/pokerUtils';
import { HelpTooltip } from '../../HelpTooltip/HelpTooltip';
import { PotGeometry } from './PotGeometry/PotGeometry';
import { useMemo } from 'react';

export function GTOStatsTab() {
  const { gameState, revealedCommunityCards } = useGameContext();
  
  // Find the human player (assuming there's only one)
  const humanPlayer = useMemo(() => 
    gameState.players.find(player => player.isHuman && !player.hasFolded), 
    [gameState.players]
  );

  // Calculate hand strength for the human player
  const handStrengthData = useMemo(() => {
    if (!humanPlayer || humanPlayer.hand.length === 0) {
      return { strength: 0, explanation: "No cards available" };
    }
    
    // Combine player's hole cards with revealed community cards
    const availableCards = [
      ...humanPlayer.hand,
      ...gameState.communityCards.slice(0, revealedCommunityCards)
    ];
    
    return calculateHandStrength(availableCards);
  }, [humanPlayer, gameState.communityCards, revealedCommunityCards]);

  return (
    <div className="gto-stats-tab">
      <h3>GTO Analysis</h3>
      
      {/* Pot & Stack Geometry Section */}
      <PotGeometry />
      
      <div className="stats-content">
        <div className="stat-item">
          <label>
            Hand Strength:
            <HelpTooltip content={handStrengthData.explanation} />
          </label>
          <span className="stat-value">
            {humanPlayer && humanPlayer.hand.length > 0 
              ? `${handStrengthData.strength}%` 
              : '--'
            }
          </span>
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
  );
}