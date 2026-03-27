import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Mosque } from "@/data/mosques";
import FilterChips, { FilterType } from "@/components/FilterChips";
import PrayerBanner from "@/components/PrayerBanner";
import MosqueCard from "@/components/MosqueCard";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mosqueIcon = L.divIcon({
  className: "mosque-marker",
  html: "🕌",
  iconSize: [32, 32],
});

interface Props {
  mosques: Mosque[];
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onSelectMosque: (m: Mosque) => void;
}

export default function MapView({ mosques, filter, onFilterChange, onSelectMosque }: Props) {
  const nearest = mosques[0] || null;

  return (
    <div className="flex flex-col h-full relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-card/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-display text-xl font-bold text-forest">Musmapp</h1>
          <MapPin size={20} className="text-forest" />
        </div>
        <FilterChips active={filter} onChange={onFilterChange} />
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={[51.5074, -0.1278]}
          zoom={12}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mosques.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={mosqueIcon}>
              <Popup>
                <strong>{m.name}</strong>
                <br />
                {m.distanceMiles} mi
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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
