import { Map, List, Compass } from "lucide-react";

type Tab = "map" | "list" | "qibla";

interface Props {
  active: Tab;
  onChange: (v: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Map }[] = [
  { id: "map", label: "Map", icon: Map },
  { id: "list", label: "List", icon: List },
  { id: "qibla", label: "Qibla", icon: Compass },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="flex bg-card border-t border-border">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            active === id ? "text-forest" : "text-muted-foreground"
          }`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </div>
  );
}
