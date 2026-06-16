import { Search, SlidersHorizontal, X } from "lucide-react";

interface FiltersProps {
  maxBudget: number;
  interests: string;
  open: boolean;
  onToggle: () => void;
  onChange: (filters: { maxBudget: number; interests: string }) => void;
}

export function Filters({ maxBudget, interests, open, onToggle, onChange }: FiltersProps) {
  return (
    <aside className={`filters ${open ? "filters--open" : ""}`}>
      <div className="filters__header">
        <div>
          <span className="eyebrow">Refine your search</span>
          <h2>Find your fit</h2>
        </div>
        <button className="icon-button filters__close" onClick={onToggle} aria-label="Close filters">
          <X size={20} />
        </button>
      </div>

      <label className="field">
        <span>Interest</span>
        <div className="input-shell">
          <Search size={18} />
          <input
            value={interests}
            onChange={(event) => onChange({ maxBudget, interests: event.target.value })}
            placeholder="Try cooking or hiking"
          />
        </div>
      </label>

      <label className="field">
        <span>Maximum monthly budget</span>
        <strong>${maxBudget.toLocaleString()}</strong>
        <input
          className="range"
          type="range"
          min="1200"
          max="3000"
          step="100"
          value={maxBudget}
          onChange={(event) => onChange({ interests, maxBudget: Number(event.target.value) })}
        />
        <div className="range-labels"><span>$1,200</span><span>$3,000+</span></div>
      </label>

      <div className="filter-note">
        <SlidersHorizontal size={18} />
        <p>Results update using location, budget, interests, and lifestyle compatibility.</p>
      </div>
    </aside>
  );
}
