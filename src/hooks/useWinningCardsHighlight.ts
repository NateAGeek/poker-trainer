import { useMemo } from 'react';
import type { Card, Player } from '../types/poker';
import { useGameContext } from './useGameContext';
import { useWinnerCalculation, useGameDisplay } from './useGameDisplay';

/**
 * Hook that calculates which cards should be highlighted as winning cards
 * Returns information about which player cards and community cards contributed to the win
 */
export function useWinningCardsHighlight() {
  const { showdown } = useGameContext();
  const { winner } = useWinnerCalculation();
  const { visibleCommunityCards } = useGameDisplay();

  const highlightInfo = useMemo(() => {
    if (!showdown || !winner || winner.isTie) {
      return {
        winningPlayer: null,
        highlightedPlayerCards: new Set<string>(),
        highlightedCommunityCards: new Set<string>(),
        winningHand: null
      };
    }

    const winningPlayer = winner.player;
    if (!winningPlayer) {
      return {
        winningPlayer: null,
        highlightedPlayerCards: new Set<string>(),
        highlightedCommunityCards: new Set<string>(),
        winningHand: null
      };
    }

    const evaluation = winner.evaluation;
    const winningCards = evaluation.winningCards || [];
    
    // Separate winning cards into player cards and community cards
    const highlightedPlayerCards = new Set<string>();
    const highlightedCommunityCards = new Set<string>();

    winningCards.forEach(card => {
      // Check if this card is in the player's hole cards
      const isPlayerCard = winningPlayer.hand.some(playerCard => playerCard.id === card.id);
      if (isPlayerCard) {
        highlightedPlayerCards.add(card.id);
      } else {
        // Check if this card is in the community cards
        const isCommunityCard = visibleCommunityCards.some(communityCard => communityCard.id === card.id);
        if (isCommunityCard) {
          highlightedCommunityCards.add(card.id);
        }
      }
    });

    return {
      winningPlayer,
      highlightedPlayerCards,
      highlightedCommunityCards,
      winningHand: evaluation
    };
  }, [showdown, winner, visibleCommunityCards]);

  /**
   * Check if a specific card should be highlighted for a given player
   */
  const isCardHighlighted = useMemo(() => {
    return (card: Card, player?: Player) => {
      if (!highlightInfo.winningPlayer) return false;
      
      // Only highlight cards for the winning player
      if (player && player.id !== highlightInfo.winningPlayer.id) return false;
      
      // Check if this card is in the highlighted sets
      return highlightInfo.highlightedPlayerCards.has(card.id) || 
             highlightInfo.highlightedCommunityCards.has(card.id);
    };
  }, [highlightInfo]);

  /**
   * Check if a community card should be highlighted
   */
  const isCommunityCardHighlighted = useMemo(() => {
    return (card: Card) => {
      return highlightInfo.highlightedCommunityCards.has(card.id);
    };
  }, [highlightInfo]);

  /**
   * Check if any of a player's cards should be highlighted
   */
  const hasHighlightedCards = useMemo(() => {
    return (player: Player) => {
      if (!highlightInfo.winningPlayer || player.id !== highlightInfo.winningPlayer.id) {
        return false;
      }
      
      return player.hand.some(card => highlightInfo.highlightedPlayerCards.has(card.id));
    };
  }, [highlightInfo]);

  return {
    ...highlightInfo,
    isCardHighlighted,
    isCommunityCardHighlighted,
    hasHighlightedCards,
    // Helper to get all winning card IDs as a flat array
    allWinningCardIds: [
      ...highlightInfo.highlightedPlayerCards, 
      ...highlightInfo.highlightedCommunityCards
    ]
  };
}