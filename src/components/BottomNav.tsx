import { Map, List } from "lucide-react";

interface Props {
  active: "map" | "list";
  onChange: (v: "map" | "list") => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="flex bg-card border-t border-border">
      <button
        onClick={() => onChange("map")}
        className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
          active === "map" ? "text-forest" : "text-muted-foreground"
        }`}
      >
        <Map size={20} />
        Map
      </button>
      <button
        onClick={() => onChange("list")}
        className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
          active === "list" ? "text-forest" : "text-muted-foreground"
        }`}
      >
        <List size={20} />
        List
      </button>
    </div>
  );
}
