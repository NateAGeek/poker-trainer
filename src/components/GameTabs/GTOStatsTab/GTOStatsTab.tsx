import './GTOStatsTab.scss';
import { useGameContext } from '../../../hooks/useGameContext';
import { calculateHandStrength } from '../../../utils/pokerUtils';
import { calculateGameStatePotOdds } from '../../../utils/potOddsUtils';
import { HelpTooltip } from '../../HelpTooltip/HelpTooltip';
import { PotGeometry } from './PotGeometry/PotGeometry';
import { PotOddsBreakeven } from './PotOddsBreakeven/PotOddsBreakeven';
import { RangeAnalysis } from './RangeAnalysis/RangeAnalysis';
import { QuizContext, type QuizAnswers } from './QuizContext';
import { useMemo, useState } from 'react';



export function GTOStatsTab() {
  const { gameState, revealedCommunityCards } = useGameContext();
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    handStrength: '',
    potOdds: '',
    breakEvenEquity: '',
    potSize: '',
    effectiveStack: '',
    spr: '',
    betSizePercent: '',
    bluffBreakeven: ''
  });
  const [showResults, setShowResults] = useState(false);
  
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

  // Calculate pot odds data
  const potOddsData = useMemo(() => {
    return calculateGameStatePotOdds(gameState);
  }, [gameState]);

  const handleQuizToggle = () => {
    setQuizMode(!quizMode);
    setShowResults(false);
    setQuizAnswers({
      handStrength: '',
      potOdds: '',
      breakEvenEquity: '',
      potSize: '',
      effectiveStack: '',
      spr: '',
      betSizePercent: '',
      bluffBreakeven: ''
    });
  };

  const handleQuizSubmit = () => {
    setShowResults(true);
  };

  const handleAnswerChange = (field: keyof QuizAnswers, value: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isAnswerCorrect = (userAnswer: string, correctAnswer: number, tolerance: number = 2) => {
    // Remove common formatting like commas and dollar signs
    const cleanAnswer = userAnswer.replace(/[,$]/g, '');
    const parsed = parseFloat(cleanAnswer);
    if (isNaN(parsed)) return false;
    
    // Handle percentage tolerance (for percentages, use smaller tolerance)
    const actualTolerance = correctAnswer < 100 ? tolerance : Math.max(tolerance, correctAnswer * 0.05);
    return Math.abs(parsed - correctAnswer) <= actualTolerance;
  };

  return (
    <QuizContext.Provider value={{
      quizMode,
      showResults,
      quizAnswers,
      setQuizAnswers,
      handleAnswerChange,
      isAnswerCorrect
    }}>
      <div className="gto-stats-tab">
        <div className="header-with-toggle">
          <h3>GTO Analysis</h3>
          <button 
            className={`quiz-toggle ${quizMode ? 'active' : ''}`}
            onClick={handleQuizToggle}
            title="Toggle quiz mode to test your mental math"
          >
            {quizMode ? '📊' : '🧠'} {quizMode ? 'Show Answers' : 'Quiz Mode'}
          </button>
        </div>
        
        {/* Pot & Stack Geometry Section */}
        <PotGeometry />
        
        {/* Pot Odds & Breakeven Section */}
        <PotOddsBreakeven />

        {/* Range Analysis Section */}
        <RangeAnalysis />
      
      <div className="stats-content">
        <div className="stat-item">
          <label>
            Hand Strength:
            <HelpTooltip content={handStrengthData.explanation} />
          </label>
          {quizMode ? (
            <div className="quiz-input-container">
              <input
                type="text"
                className={`quiz-input ${
                  showResults 
                    ? isAnswerCorrect(quizAnswers.handStrength, handStrengthData.strength) 
                      ? 'correct' 
                      : 'incorrect'
                    : ''
                }`}
                placeholder="Enter %"
                value={quizAnswers.handStrength}
                onChange={(e) => handleAnswerChange('handStrength', e.target.value)}
                disabled={showResults}
              />
              {showResults && (
                <span className="correct-answer">
                  {humanPlayer && humanPlayer.hand.length > 0 
                    ? `${handStrengthData.strength}%` 
                    : '--'
                  }
                </span>
              )}
            </div>
          ) : (
            <span className="stat-value">
              {humanPlayer && humanPlayer.hand.length > 0 
                ? `${handStrengthData.strength}%` 
                : '--'
              }
            </span>
          )}
        </div>

        <div className="stat-item">
          <label>
            Pot Odds:
            <HelpTooltip content="The odds being offered by the pot for your call" />
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
                  {potOddsData.potOddsPercent}%
                </span>
              )}
            </div>
          ) : (
            <span className="stat-value">
              {potOddsData.potOddsPercent > 0 ? `${potOddsData.potOddsPercent}%` : '--'}
            </span>
          )}
        </div>

        <div className="stat-item">
          <label>
            Break-Even Equity:
            <HelpTooltip content="Minimum equity needed to make a profitable call" />
          </label>
          {quizMode ? (
            <div className="quiz-input-container">
              <input
                type="text"
                className={`quiz-input ${
                  showResults 
                    ? isAnswerCorrect(quizAnswers.breakEvenEquity, potOddsData.breakEvenEquity) 
                      ? 'correct' 
                      : 'incorrect'
                    : ''
                }`}
                placeholder="Enter %"
                value={quizAnswers.breakEvenEquity}
                onChange={(e) => handleAnswerChange('breakEvenEquity', e.target.value)}
                disabled={showResults}
              />
              {showResults && (
                <span className="correct-answer">
                  {potOddsData.breakEvenEquity}%
                </span>
              )}
            </div>
          ) : (
            <span className="stat-value">
              {potOddsData.breakEvenEquity > 0 ? `${potOddsData.breakEvenEquity}%` : '--'}
            </span>
          )}
        </div>

        {quizMode && (
          <div className="quiz-controls">
            {!showResults ? (
              <button 
                className="quiz-submit-btn"
                onClick={handleQuizSubmit}
                disabled={Object.values(quizAnswers).every(answer => !answer.trim())}
              >
                Check Answers
              </button>
            ) : (
              <button 
                className="quiz-reset-btn"
                onClick={handleQuizToggle}
              >
                Try Again
              </button>
            )}
          </div>
        )}

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
      </div>
      </div>
    </QuizContext.Provider>
  );
}