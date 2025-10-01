import { useMemo } from 'react';
import type { Player } from '../types/poker';
import { useGameContext } from './useGameContext';
import { evaluateHand, getRankValue } from '../utils/pokerUtils';
import { calculateCurrentPotSize } from '../utils/gameUtils';

/**
 * Hook for accessing and computing display-related game state
 */
export function useGameDisplay() {
  const { gameState, revealedCommunityCards, showdown } = useGameContext();

  // Get visible community cards based on game phase
  const visibleCommunityCards = useMemo(() => {
    return gameState.communityCards.slice(0, revealedCommunityCards);
  }, [gameState.communityCards, revealedCommunityCards]);

  // Calculate seat positions for circular table
  const getSeatIndex = useMemo(() => {
    return (playerIndex: number, totalPlayers: number): number => {
      // Distribute players evenly around the circle (seats 0-8)
      // Player 0 (human) always sits at bottom (seat 0)
      if (playerIndex === 0) return 0;
      
      // Distribute other players around remaining seats
      if (totalPlayers === 2) {
        return playerIndex === 1 ? 4 : 0; // Opposite sides (0 and 4)
      }
      
      if (totalPlayers === 3) {
        return [0, 3, 6][playerIndex] || 0; // Evenly spaced: bottom, right, left
      }
      
      if (totalPlayers === 4) {
        return [0, 2, 4, 6][playerIndex] || 0; // Four corners
      }
      
      if (totalPlayers === 5) {
        return [0, 2, 3, 5, 7][playerIndex] || 0; // Spread around
      }
      
      if (totalPlayers === 6) {
        return [0, 1, 3, 4, 6, 7][playerIndex] || 0; // 6-max distribution
      }
      
      if (totalPlayers === 7) {
        return [0, 1, 2, 4, 5, 6, 7][playerIndex] || 0; // Skip seat 3
      }
      
      if (totalPlayers === 8) {
        return [0, 1, 2, 3, 4, 5, 6, 7][playerIndex] || 0; // Skip seat 8
      }
      
      // For 9 players, use all seats
      return playerIndex % 9;
    };
  }, []);

  // Get player hand combined with community cards
  const getPlayerHandWithCommunity = useMemo(() => {
    return (player: Player) => {
      return [...player.hand, ...visibleCommunityCards];
    };
  }, [visibleCommunityCards]);

  return {
    gameState,
    visibleCommunityCards,
    showdown,
    getSeatIndex,
    getPlayerHandWithCommunity
  };
}

/**
 * Hook for winner calculation and hand evaluation
 */
export function useWinnerCalculation() {
  const { gameState, showdown } = useGameContext();
  const { getPlayerHandWithCommunity } = useGameDisplay();

  const winner = useMemo(() => {
    if (!showdown) return null;

    const playerEvaluations = gameState.players
      .filter(p => !p.hasFolded)
      .map(player => ({
        player,
        evaluation: evaluateHand(getPlayerHandWithCommunity(player))
      }));

    if (playerEvaluations.length === 0) return null;

    // Sort by hand evaluation (best hands first)
    playerEvaluations.sort((a, b) => {
      // First compare by ranking
      if (a.evaluation.ranking !== b.evaluation.ranking) {
        return b.evaluation.ranking - a.evaluation.ranking;
      }
      
      // For same ranking, compare high cards
      const aValues = a.evaluation.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      const bValues = b.evaluation.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      
      for (let i = 0; i < Math.min(aValues.length, bValues.length); i++) {
        if (aValues[i] !== bValues[i]) {
          return bValues[i] - aValues[i];
        }
      }
      
      return 0; // True tie
    });

    // Check for ties among the best hands
    const bestEvaluation = playerEvaluations[0].evaluation;
    const tiedWinners = playerEvaluations.filter(pe => {
      // Check if this hand ties with the best hand
      const rankingMatch = pe.evaluation.ranking === bestEvaluation.ranking;
      if (!rankingMatch) return false;
      
      // Check high cards for tie-breaking
      const peValues = pe.evaluation.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      const bestValues = bestEvaluation.cards.map(card => getRankValue(card.rank)).sort((x, y) => y - x);
      
      for (let i = 0; i < Math.min(peValues.length, bestValues.length); i++) {
        if (peValues[i] !== bestValues[i]) {
          return false;
        }
      }
      
      return true; // This hand ties with the best hand
    });

    if (tiedWinners.length === 1) {
      return { player: tiedWinners[0].player, evaluation: tiedWinners[0].evaluation, isTie: false };
    } else {
      return { player: null, evaluation: bestEvaluation, isTie: true, winners: tiedWinners };
    }
  }, [showdown, gameState.players, getPlayerHandWithCommunity]);

  // Get all player hand evaluations for display
  const allPlayerEvaluations = useMemo(() => {
    return gameState.players.map(player => ({
      player,
      evaluation: evaluateHand(getPlayerHandWithCommunity(player))
    }));
  }, [gameState.players, getPlayerHandWithCommunity]);

  return {
    winner,
    allPlayerEvaluations
  };
}

/**
 * Hook for game status and phase information
 */
export function useGameStatus() {
  const { gameState, playerCount } = useGameContext();

  const gameInfo = useMemo(() => ({
    phase: gameState.gamePhase.toUpperCase(),
    pot: calculateCurrentPotSize(gameState), // Use real-time pot calculation
    currentPlayerName: gameState.players[gameState.currentPlayer]?.name || 'Unknown',
    isWaitingForPlayer: gameState.waitingForPlayerAction,
    handNumber: gameState.handNumber
  }), [gameState]);

  const canChangePlayerCount = useMemo(() => {
    return gameState.gamePhase === 'preflop' && gameState.handNumber === 1;
  }, [gameState.gamePhase, gameState.handNumber]);

  return {
    gameInfo,
    playerCount,
    canChangePlayerCount
  };
}
