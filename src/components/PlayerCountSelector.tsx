interface PlayerCountSelectorProps {
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  disabled?: boolean;
}

export function PlayerCountSelector({ playerCount, onPlayerCountChange, disabled = false }: PlayerCountSelectorProps) {
  const playerOptions = [
    { value: 2, label: "2 Players (Heads-Up)" },
    { value: 3, label: "3 Players" },
    { value: 4, label: "4 Players" },
    { value: 5, label: "5 Players" },
    { value: 6, label: "6 Players (6-Max)" },
    { value: 7, label: "7 Players" },
    { value: 8, label: "8 Players" },
    { value: 9, label: "9 Players (Full Ring)" }
  ];

  return (
    <div className="player-count-selector">
      <label htmlFor="player-count">Table Size:</label>
      <select
        id="player-count"
        value={playerCount}
        onChange={(e) => onPlayerCountChange(Number(e.target.value))}
        disabled={disabled}
      >
        {playerOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
