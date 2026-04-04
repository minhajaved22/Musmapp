import { useState, useMemo, useCallback } from "react";
import { mosques as allMosques, Mosque } from "@/data/mosques";
import { FilterType } from "@/components/FilterChips";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/pages/SplashScreen";
import MapView from "@/pages/MapView";
import ListView from "@/pages/ListView";
import QiblaView from "@/pages/QiblaView";
import MosqueDetail from "@/pages/MosqueDetail";
import { AnimatePresence } from "framer-motion";

type Screen = "splash" | "main";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tab, setTab] = useState<"map" | "list" | "qibla">("map");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [liveMosques, setLiveMosques] = useState<Mosque[]>([]);

  const combinedMosques = useMemo(() => {
    const combined = [...allMosques, ...liveMosques.filter(
      (lm) => !allMosques.some((am) => am.id === lm.id)
    )];
    return combined
      .filter((m) => {
        if (filter === "female") return m.hasFemaleSpace;
        if (filter === "open") return m.isOpen;
        if (filter === "wudu") return m.hasWudu;
        return true;
      })
      .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()));
  }, [filter, search, liveMosques]);

  const handleSelect = useCallback((m: Mosque) => setSelectedMosque(m), []);
  const handleBack = useCallback(() => setSelectedMosque(null), []);

  if (screen === "splash") {
    return (
      <div className="phone-frame">
        <SplashScreen onContinue={() => setScreen("main")} />
      </div>
    );
  }

  return (
    <div className="phone-frame flex flex-col h-screen">
      <AnimatePresence mode="wait">
        {selectedMosque ? (
          <MosqueDetail key="detail" mosque={selectedMosque} onBack={handleBack} />
        ) : (
          <div key="main" className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              {tab === "map" ? (
                <MapView
                  mosques={filtered}
                  filter={filter}
                  onFilterChange={setFilter}
                  onSelectMosque={handleSelect}
                  search={search}
                  onSearchChange={setSearch}
                />
              ) : tab === "list" ? (
                <ListView
                  mosques={filtered}
                  filter={filter}
                  onFilterChange={setFilter}
                  onSelectMosque={handleSelect}
                  search={search}
                  onSearchChange={setSearch}
                />
              ) : (
                <QiblaView />
              )}
            </div>
            <BottomNav active={tab} onChange={setTab} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
