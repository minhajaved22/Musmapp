import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Mosque } from "@/data/mosques";
import FilterChips, { FilterType } from "@/components/FilterChips";
import PrayerBanner from "@/components/PrayerBanner";
import MosqueCard from "@/components/MosqueCard";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  mosques: Mosque[];
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onSelectMosque: (m: Mosque) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export default function MapView({ mosques, filter, onFilterChange, onSelectMosque, search, onSearchChange }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const nearest = mosques[0] || null;
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, {
      center: [51.5074, -0.1278],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    mosques.forEach((mosque) => {
      const icon = L.divIcon({
        className: "mosque-marker",
        html: "🕌",
        iconSize: [32, 32],
      });
      const marker = L.marker([mosque.lat, mosque.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`<strong>${mosque.name}</strong><br/>${mosque.distanceMiles} mi`);
      markersRef.current.push(marker);
    });
  }, [mosques]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-card/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          {showSearch ? (
            <div className="flex items-center flex-1 gap-2">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search mosques…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={() => { onSearchChange(""); setShowSearch(false); }}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-xl font-bold text-forest">Musmapp</h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSearch(true)}>
                  <Search size={20} className="text-forest" />
                </button>
                <MapPin size={20} className="text-forest" />
              </div>
            </>
          )}
        </div>
        <FilterChips active={filter} onChange={onFilterChange} />
      </div>

      {/* Map */}
      <div className="flex-1">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]">
        <div className="space-y-3 pb-2">
          <PrayerBanner />
          <AnimatePresence mode="wait">
            {nearest && (
              <motion.div
                key={nearest.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="px-4 pb-1"
              >
                <MosqueCard mosque={nearest} onClick={() => onSelectMosque(nearest)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
