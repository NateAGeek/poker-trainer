import type { Player } from '../types/poker';

export interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

// Calculate side pots when players are all-in with different amounts
export function calculateSidePots(players: Player[]): { mainPot: number; sidePots: SidePot[] } {
  const activePlayers = players.filter(p => !p.hasFolded);
  
  if (activePlayers.length === 0) {
    return { mainPot: 0, sidePots: [] };
  }

  // Sort players by total bet amount (ascending)
  const sortedByBet = [...activePlayers].sort((a, b) => a.totalBetThisRound - b.totalBetThisRound);
  
  let remainingPlayers = [...activePlayers];
  const sidePots: SidePot[] = [];
  let previousBetLevel = 0;

  for (const player of sortedByBet) {
    const currentBetLevel = player.totalBetThisRound;
    
    if (currentBetLevel > previousBetLevel) {
      const potContribution = (currentBetLevel - previousBetLevel) * remainingPlayers.length;
      
      if (potContribution > 0) {
        sidePots.push({
          amount: potContribution,
          eligiblePlayers: remainingPlayers.map(p => p.id)
        });
      }
      
      previousBetLevel = currentBetLevel;
    }
    
    // Remove players who are all-in at this level
    if (player.isAllIn) {
      remainingPlayers = remainingPlayers.filter(p => p.id !== player.id);
    }
  }

  // Main pot is the first side pot, or total if no side pots
  const mainPot = sidePots.length > 0 ? sidePots[0].amount : 0;
  const actualSidePots = sidePots.slice(1);

  return { mainPot, sidePots: actualSidePots };
}

// Distribute winnings from pots
export function distributePots(
  mainPot: number,
  sidePots: SidePot[],
  players: Player[],
  winners: { playerId: string; handRank: number }[]
): { player: Player; winnings: number }[] {
  const winnings: { player: Player; winnings: number }[] = [];
  
  // Helper function to distribute a single pot
  const distributePot = (amount: number, eligiblePlayerIds: string[]) => {
    const eligibleWinners = winners.filter(w => eligiblePlayerIds.includes(w.playerId));
    
    if (eligibleWinners.length === 0) return;
    
    // Find the best hand rank among eligible players
    const bestRank = Math.max(...eligibleWinners.map(w => w.handRank));
    const actualWinners = eligibleWinners.filter(w => w.handRank === bestRank);
    
    const winningsPerPlayer = Math.floor(amount / actualWinners.length);
    const remainder = amount % actualWinners.length;
    
    actualWinners.forEach((winner, index) => {
      const player = players.find(p => p.id === winner.playerId)!;
      const baseWinnings = winningsPerPlayer + (index < remainder ? 1 : 0);
      
      const existingEntry = winnings.find(w => w.player.id === player.id);
      if (existingEntry) {
        existingEntry.winnings += baseWinnings;
      } else {
        winnings.push({ player, winnings: baseWinnings });
      }
    });
  };

  // Distribute main pot
  if (mainPot > 0) {
    const mainPotEligible = players.filter(p => !p.hasFolded).map(p => p.id);
    distributePot(mainPot, mainPotEligible);
  }

  // Distribute side pots
  sidePots.forEach(sidePot => {
    distributePot(sidePot.amount, sidePot.eligiblePlayers);
  });

  return winnings;
}

// Calculate total pot size
export function calculateTotalPot(players: Player[]): number {
  return players.reduce((total, player) => total + player.totalBetThisRound, 0);
}

// Reset betting round (clear current bets but keep total bets for pot calculation)
export function resetBettingRound(players: Player[]): Player[] {
  return players.map(player => ({
    ...player,
    currentBet: 0,
    lastAction: undefined
  }));
}

// Collect all bets into the pot and reset current bets
export function collectBets(players: Player[]): { players: Player[]; collectedAmount: number } {
  const collectedAmount = players.reduce((total, player) => total + player.currentBet, 0);
  
  const updatedPlayers = players.map(player => ({
    ...player,
    totalBetThisRound: player.totalBetThisRound + player.currentBet,
    currentBet: 0,
    lastAction: undefined
  }));

  return { players: updatedPlayers, collectedAmount };
}
