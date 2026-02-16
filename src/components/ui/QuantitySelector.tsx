"use client";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 20,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="w-8 h-8 rounded-full bg-surface-light text-cream flex items-center justify-center text-sm font-medium transition-colors hover:bg-gold hover:text-bg disabled:opacity-30 disabled:hover:bg-surface-light disabled:hover:text-cream"
      >
        &minus;
      </button>
      <span className="w-8 text-center text-cream font-body text-sm tabular-nums">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-8 h-8 rounded-full bg-surface-light text-cream flex items-center justify-center text-sm font-medium transition-colors hover:bg-gold hover:text-bg disabled:opacity-30 disabled:hover:bg-surface-light disabled:hover:text-cream"
      >
        +
      </button>
    </div>
  );
}
