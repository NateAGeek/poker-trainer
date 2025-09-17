import './PotGeometry.scss';
import { useGameContext } from '../../../../hooks/useGameContext';
import { calculatePotGeometry } from '../../../../utils/potGeometryUtils';
import { HelpTooltip } from '../../../HelpTooltip/HelpTooltip';
import { useMemo, useCallback } from 'react';

export function PotGeometry() {
  const { gameState } = useGameContext();
  
  // Format numbers for display - using useCallback to prevent re-renders
  const formatCurrency = useCallback((amount: number): string => {
    return amount.toLocaleString();
  }, []);

  const formatSPR = useCallback((spr: number): string => {
    if (spr === Infinity) return '∞';
    if (spr > 999) return '999+';
    return spr.toFixed(2);
  }, []);

  const formatPercent = useCallback((percent: number): string => {
    if (percent === 0) return '--';
    return `${percent}%`;
  }, []);

  // Calculate pot geometry data
  const potGeometry = useMemo(() => {
    return calculatePotGeometry(gameState);
  }, [gameState]);

  // Generate detailed help text with calculations
  const helpText = useMemo(() => {
    const activePlayers = gameState.players.filter(p => !p.hasFolded);
    const currentBets = gameState.players.map(p => p.currentBet);
    const totalCurrentBets = currentBets.reduce((sum, bet) => sum + bet, 0);
    const highestBet = Math.max(...currentBets);
    const potBeforeBet = potGeometry.potSize - highestBet;
    const playerStacks = activePlayers.map(p => p.chips);
    
    return {
      pot: `Pot Calculation:
• Base pot: ${formatCurrency(gameState.pot)}
• Current bets: ${currentBets.map((bet, i) => `Player ${i + 1}: ${formatCurrency(bet)}`).join(', ')}
• Total current bets: ${formatCurrency(totalCurrentBets)}
• Final pot size: ${formatCurrency(gameState.pot)} + ${formatCurrency(totalCurrentBets)} = ${formatCurrency(potGeometry.potSize)}

This represents all chips committed to the pot in the current hand.`,

      effectiveStack: `Effective Stack Calculation:
• Active player stacks: ${playerStacks.map(stack => `${formatCurrency(stack)}`).join(', ')}
• Effective stack = Min(${playerStacks.map(s => formatCurrency(s)).join(', ')}) = ${formatCurrency(potGeometry.effectiveStack)}

The effective stack determines the maximum amount that can be won by any player, as it's limited by the smallest stack still in the hand.`,

      spr: `Stack-to-Pot Ratio (SPR) Calculation:
• Formula: SPR = Effective Stack ÷ Pot Size
• SPR = ${formatCurrency(potGeometry.effectiveStack)} ÷ ${formatCurrency(potGeometry.potSize)} = ${formatSPR(potGeometry.spr)}

SPR Interpretation:
• Very Low (0-1): Heavy commitment, strong hands should go all-in
• Low (1-5): Medium commitment, top pairs and better should stack off
• Medium (5-20): Normal play, hand strength matters significantly  
• High (20+): Deep stack play, more post-flop maneuvering`,

      betSize: `Bet Size Percentage Calculation:
• Current highest bet: ${formatCurrency(highestBet)}
• Pot before this bet: ${formatCurrency(potBeforeBet)}
• Bet size % = (${formatCurrency(highestBet)} ÷ ${formatCurrency(potBeforeBet)}) × 100 = ${formatPercent(potGeometry.currentBetSizePercent)}

Common bet sizes:
• 25-33%: Small/blocking bet
• 50-66%: Standard value bet
• 75-100%: Large/polarized bet
• 100%+: Overbet for thin value or bluff`
    };
  }, [gameState, potGeometry, formatCurrency, formatSPR, formatPercent]);

  return (
    <div className="pot-geometry">
      <h4>Pot & Geometry</h4>
      <div className="geometry-stats">
        <div className="stat-row">
          <div className="stat-item">
            <label>
              Pot:
              <HelpTooltip content={helpText.pot} />
            </label>
            <span className="stat-value pot-value">
              {formatCurrency(potGeometry.potSize)}
            </span>
          </div>
          
          <div className="stat-item">
            <label>
              Effective Stack:
              <HelpTooltip content={helpText.effectiveStack} />
            </label>
            <span className="stat-value stack-value">
              {formatCurrency(potGeometry.effectiveStack)}
            </span>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-item">
            <label>
              SPR:
              <HelpTooltip content={helpText.spr} />
            </label>
            <span className={`stat-value spr-value ${getSPRClass(potGeometry.spr)}`}>
              {formatSPR(potGeometry.spr)}
            </span>
          </div>
          
          <div className="stat-item">
            <label>
              Current Bet Size:
              <HelpTooltip content={helpText.betSize} />
            </label>
            <span className="stat-value bet-size-value">
              <span className="bet-amount">{formatCurrency(potGeometry.currentBetAmount)}</span>
              <span className="bet-percent">({formatPercent(potGeometry.currentBetSizePercent)})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine SPR color class
function getSPRClass(spr: number): string {
  if (spr === Infinity || spr > 20) return 'spr-high';
  if (spr > 5) return 'spr-medium';
  if (spr > 1) return 'spr-low';
  return 'spr-very-low';
}