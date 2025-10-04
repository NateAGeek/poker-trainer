import type { GameState, HandEvaluation } from '../types/poker';
import { evaluateHand, getRankValue } from './pokerUtils';

/**
 * Compare two hand evaluations to determine which is better
 * Returns > 0 if hand1 is better, < 0 if hand2 is better, 0 if tie
 */
function compareHandEvaluations(hand1: HandEvaluation, hand2: HandEvaluation): number {
  // Higher ranking wins (e.g., straight flush beats four of a kind)
  if (hand1.ranking !== hand2.ranking) {
    return hand1.ranking - hand2.ranking;
  }
  
  // Same ranking - need to compare high cards/kickers
  const hand1Values = hand1.cards.map(card => getRankValue(card.rank)).sort((a, b) => b - a);
  const hand2Values = hand2.cards.map(card => getRankValue(card.rank)).sort((a, b) => b - a);
  
  // Compare each card from highest to lowest
  for (let i = 0; i < Math.min(hand1Values.length, hand2Values.length); i++) {
    if (hand1Values[i] !== hand2Values[i]) {
      return hand1Values[i] - hand2Values[i];
    }
  }
  
  // If all compared cards are equal, it's a true tie
  return 0;
}

/**
 * Determine the winner(s) of a hand and distribute the pot
 */
export function determineWinnerAndDistributePot(gameState: GameState): GameState {
  const activePlayers = gameState.players.filter(p => !p.hasFolded && !p.isEliminated);
  
  if (activePlayers.length === 0) {
    // No active players - shouldn't happen, but handle gracefully
    return gameState;
  }
  
  if (activePlayers.length === 1) {
    // Only one player left - they win the pot
    const winner = activePlayers[0];
    const updatedPlayers = gameState.players.map(player => 
      player.id === winner.id 
        ? { ...player, chips: player.chips + gameState.pot }
        : player
    );
    
    return {
      ...gameState,
      players: updatedPlayers,
      pot: 0
    };
  }
  
  // Multiple players - evaluate hands to find winner
  const playerEvaluations = activePlayers.map(player => ({
    player,
    evaluation: evaluateHand([...player.hand, ...gameState.communityCards])
  }));
  
  // Find the best hand
  let bestEvaluation = playerEvaluations[0].evaluation;
  let winners = [playerEvaluations[0].player];
  
  for (let i = 1; i < playerEvaluations.length; i++) {
    const comparison = compareHandEvaluations(playerEvaluations[i].evaluation, bestEvaluation);
    if (comparison > 0) {
      // New best hand
      bestEvaluation = playerEvaluations[i].evaluation;
      winners = [playerEvaluations[i].player];
    } else if (comparison === 0) {
      // Tie
      winners.push(playerEvaluations[i].player);
    }
  }
  
  // Distribute pot among winners
  const potShare = Math.floor(gameState.pot / winners.length);
  const remainder = gameState.pot % winners.length;
  
  const updatedPlayers = gameState.players.map(player => {
    const isWinner = winners.some(winner => winner.id === player.id);
    if (isWinner) {
      const winnerIndex = winners.findIndex(winner => winner.id === player.id);
      // Give remainder to first winner(s)
      const bonus = winnerIndex < remainder ? 1 : 0;
      return { ...player, chips: player.chips + potShare + bonus };
    }
    return player;
  });
  
  return {
    ...gameState,
    players: updatedPlayers,
    pot: 0
  };
}