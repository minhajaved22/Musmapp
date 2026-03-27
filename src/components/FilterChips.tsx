import { motion } from "framer-motion";

export type FilterType = "all" | "female" | "open" | "wudu";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "female", label: "🕌 Female Spaces" },
  { key: "open", label: "Open Now" },
  { key: "wudu", label: "🚿 Wudu" },
];

interface Props {
  active: FilterType;
  onChange: (f: FilterType) => void;
}

export default function FilterChips({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
      {FILTERS.map((f) => (
        <motion.button
          key={f.key}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(f.key)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            active === f.key ? "chip-active" : "chip-inactive"
          }`}
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}
