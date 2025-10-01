import './PotOddsBreakeven.scss';
import { useGameContext } from '../../../../hooks/useGameContext';
import { calculateGameStatePotOdds, formatPercent, formatCurrency } from '../../../../utils/potOddsUtils';
import { HelpTooltip } from '../../../HelpTooltip/HelpTooltip';
import { useQuizContext } from '../QuizContext';
import { useMemo } from 'react';

export function PotOddsBreakeven() {
  const { gameState } = useGameContext();
  const { quizMode, showResults, quizAnswers, handleAnswerChange, isAnswerCorrect } = useQuizContext();
  
  // Calculate pot odds and breakeven data using the technical requirements implementation
  const potOddsData = useMemo(() => {
    return calculateGameStatePotOdds(gameState);
  }, [gameState]);

  // Generate help text
  const helpText = useMemo(() => {
    return {
      potOdds: `Pot Odds Calculation:
• Call amount: ${formatCurrency(potOddsData.amountToCall)}
• Pot after call: ${formatCurrency(potOddsData.potAfterCall)}
• Formula: AmountToCall ÷ (Pot + AmountToCall) × 100
• Pot odds = ${formatCurrency(potOddsData.amountToCall)} ÷ ${formatCurrency(potOddsData.potAfterCall)} × 100 = ${formatPercent(potOddsData.potOddsPercent)}

This tells you what percentage of equity you need to make a profitable call.`,

      handEquity: `Your Hand Estimated Equity:
• Currently requires range analysis (future implementation)
• Will compare your actual hand strength vs opponents' ranges
• When implemented, compare this value to "Equity Needed" above

Decision Rule: Call if Hand Equity > Equity Needed`,

      breakeven: `Breakeven Equity Calculation:
• Formula: AmountToCall ÷ (Pot + AmountToCall) × 100
• Breakeven = ${formatCurrency(potOddsData.amountToCall)} ÷ ${formatCurrency(potOddsData.potAfterCall)} × 100 = ${formatPercent(potOddsData.breakEvenEquity)}

This is the minimum equity (win probability) you need for a call to be profitable in the long run.`,

      bluffBreakeven: potOddsData.breakEvenFoldPercent ? `Break-Even Fold % for Bluff:
• Formula: BetSize ÷ (Pot + BetSize) × 100
• Break-even fold = ${formatCurrency(potOddsData.betSize || 0)} ÷ ${formatCurrency((potOddsData.pot || 0) + (potOddsData.betSize || 0))} × 100 = ${formatPercent(potOddsData.breakEvenFoldPercent)}

This is how often opponents need to fold for your bluff to be profitable.` : 'No current bet to analyze for bluffing.'
    };
  }, [potOddsData]);

  return (
    <div className="pot-odds-breakeven">
      <h4>Odds & Thresholds</h4>
      <div className="odds-stats">
        <div className="stat-row">
          <div className="stat-item">
            <label>
              Pot Odds for Call:
              <HelpTooltip content={helpText.potOdds} />
            </label>
            {quizMode ? (
              <div className="quiz-input-container">
                <input
                  type="text"
                  className={`quiz-input ${
                    showResults 
                      ? isAnswerCorrect(quizAnswers.potOdds, potOddsData.potOddsPercent) 
                        ? 'correct' 
                        : 'incorrect'
                      : ''
                  }`}
                  placeholder="Enter %"
                  value={quizAnswers.potOdds}
                  onChange={(e) => handleAnswerChange('potOdds', e.target.value)}
                  disabled={showResults}
                />
                {showResults && (
                  <span className="correct-answer">
                    {formatPercent(potOddsData.potOddsPercent, 2)} ({potOddsData.potOddsRatio})
                  </span>
                )}
              </div>
            ) : (
              <span className="stat-value breakeven-value">
                <span className="breakeven-percent">{formatPercent(potOddsData.potOddsPercent, 2)}</span>
                <span className="breakeven-odds">({potOddsData.potOddsRatio})</span>
              </span>
            )}
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-item">
            <label>
              Your Hand Estimated Equity:
              <HelpTooltip content={helpText.handEquity} />
            </label>
            <span className="stat-value equity-value actual-equity">
              <span className="primary-value">—</span>
              <span className="secondary-value">(requires range)</span>
            </span>
          </div>
          
          <div className="stat-item">
            <label>
              Break-Even Fold % for Bluff:
              <HelpTooltip content={helpText.bluffBreakeven} />
            </label>
            {quizMode ? (
              <div className="quiz-input-container">
                <input
                  type="text"
                  className={`quiz-input ${
                    showResults 
                      ? isAnswerCorrect(quizAnswers.bluffBreakeven, potOddsData.breakEvenFoldPercent || 0) 
                        ? 'correct' 
                        : 'incorrect'
                      : ''
                  }`}
                  placeholder="Enter %"
                  value={quizAnswers.bluffBreakeven}
                  onChange={(e) => handleAnswerChange('bluffBreakeven', e.target.value)}
                  disabled={showResults}
                />
                {showResults && (
                  <span className="correct-answer">
                    {potOddsData.breakEvenFoldPercent ? formatPercent(potOddsData.breakEvenFoldPercent, 2) : '--'}
                  </span>
                )}
              </div>
            ) : (
              <span className="stat-value percentage-value">
                {potOddsData.breakEvenFoldPercent ? formatPercent(potOddsData.breakEvenFoldPercent, 2) : '--'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}