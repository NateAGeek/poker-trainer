import './DealerChip.scss';

interface DealerChipProps {
  visible?: boolean;
}

export function DealerChip({ visible = true }: DealerChipProps) {
  if (!visible) return null;

  return (
    <div className="dealer-chip" title="Dealer Button">
      <span className="dealer-chip-text">D</span>
    </div>
  );
}