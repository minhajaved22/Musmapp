import { useState, useMemo, useCallback } from "react";
import { mosques as allMosques, Mosque } from "@/data/mosques";
import { FilterType } from "@/components/FilterChips";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/pages/SplashScreen";
import MapView from "@/pages/MapView";
import ListView from "@/pages/ListView";
import MosqueDetail from "@/pages/MosqueDetail";
import { AnimatePresence } from "framer-motion";

type Screen = "splash" | "main";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tab, setTab] = useState<"map" | "list">("map");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  const filtered = useMemo(() => {
    return allMosques.filter((m) => {
      if (filter === "female") return m.hasFemaleSpace;
      if (filter === "open") return m.isOpen;
      if (filter === "wudu") return m.hasWudu;
      return true;
    });
  }, [filter]);

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
                />
              ) : (
                <ListView
                  mosques={filtered}
                  filter={filter}
                  onFilterChange={setFilter}
                  onSelectMosque={handleSelect}
                />
              )}
            </div>
            <BottomNav active={tab} onChange={setTab} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
