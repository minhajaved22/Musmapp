import { useState, useMemo, useCallback, useEffect } from "react";
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

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tab, setTab] = useState<"map" | "list" | "qibla">("map");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [liveMosques, setLiveMosques] = useState<Mosque[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location early (on splash)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 51.5074, lng: -0.1278 })
    );
  }, []);

  const combinedMosques = useMemo(() => {
    const combined = [...allMosques, ...liveMosques.filter(
      (lm) => !allMosques.some((am) => am.id === lm.id)
    )];

    // Recalculate distances from user location
    const withDist = combined.map((m) => ({
      ...m,
      distanceMiles: userLocation
        ? Math.round(haversineDistance(userLocation.lat, userLocation.lng, m.lat, m.lng) * 10) / 10
        : m.distanceMiles,
    }));

    return withDist
      .filter((m) => {
        if (filter === "female") return m.hasFemaleSpace;
        if (filter === "open") return m.isOpen;
        if (filter === "wudu") return m.hasWudu;
        return true;
      })
      .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [filter, search, liveMosques, userLocation]);

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
                  mosques={combinedMosques}
                  filter={filter}
                  onFilterChange={setFilter}
                  onSelectMosque={handleSelect}
                  search={search}
                  onSearchChange={setSearch}
                  liveMosques={liveMosques}
                  onLiveMosquesChange={setLiveMosques}
                />
              ) : tab === "list" ? (
                <ListView
                  mosques={combinedMosques}
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
