import { useState } from "react";
import { Mosque } from "@/data/mosques";
import FilterChips, { FilterType } from "@/components/FilterChips";
import MosqueCard from "@/components/MosqueCard";
import { MapPin, Search, X } from "lucide-react";

interface Props {
  mosques: Mosque[];
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onSelectMosque: (m: Mosque) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export default function ListView({ mosques, filter, onFilterChange, onSelectMosque, search, onSearchChange }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="font-display text-xl font-bold text-forest">Musmapp</h1>
        <MapPin size={20} className="text-forest" />
      </div>
      <FilterChips active={filter} onChange={onFilterChange} />
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {mosques.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No mosques match this filter</p>
        )}
        {mosques.map((m) => (
          <MosqueCard key={m.id} mosque={m} onClick={() => onSelectMosque(m)} />
        ))}
      </div>
    </div>
  );
}
