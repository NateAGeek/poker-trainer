import type { GameState, HandHistory, Player, HandEvaluation } from '../types/poker';
import { evaluateHand, getRankValue } from './pokerUtils';

function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
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

function getWinners(playerEvaluations: Array<{ player: Player; evaluation: HandEvaluation }>) {
  if (playerEvaluations.length === 0) return [];
  
  let bestEvaluation = playerEvaluations[0].evaluation;
  let winners = [playerEvaluations[0]];
  
  for (let i = 1; i < playerEvaluations.length; i++) {
    const comparison = compareHands(playerEvaluations[i].evaluation, bestEvaluation);
    if (comparison > 0) {
      bestEvaluation = playerEvaluations[i].evaluation;
      winners = [playerEvaluations[i]];
    } else if (comparison === 0) {
      winners.push(playerEvaluations[i]);
    }
  }
  
  return winners;
}

export function createHandHistory(
  gameState: GameState,
  handNumber: number
): HandHistory {
  const activePlayers = gameState.players.filter(p => !p.hasFolded);
  
  // Evaluate all player hands
  const playerEvaluations = activePlayers.map(player => ({
    player,
    evaluation: evaluateHand([...player.hand, ...gameState.communityCards])
  }));

  // Find the winner(s)
  const winners = getWinners(playerEvaluations);
  const winner = winners.length === 1 ? winners[0] : null;

  // Calculate winnings
  const totalPot = gameState.pot;
  const winnings = winner ? totalPot : Math.floor(totalPot / winners.length);

  return {
    handNumber,
    winner: winner ? {
      playerId: winner.player.id,
      playerName: winner.player.name,
      hand: winner.player.hand,
      evaluation: winner.evaluation,
      amountWon: winnings
    } : null,
    communityCards: gameState.communityCards,
    finalPot: totalPot,
    playerHands: gameState.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      hand: player.hand,
      evaluation: !player.hasFolded ? evaluateHand([...player.hand, ...gameState.communityCards]) : undefined,
      finalChips: player.chips,
      actions: [] // This would need to be tracked during the hand
    })),
    timestamp: Date.now()
  };
}

export function updatePlayerChipsAfterHand(
  players: Player[],
  handHistory: HandHistory
): Player[] {
  return players.map(player => {
    if (handHistory.winner && player.id === handHistory.winner.playerId) {
      return {
        ...player,
        chips: player.chips + handHistory.winner.amountWon
      };
    }
    return player;
  });
}