import { Mosque } from "@/data/mosques";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { ArrowLeft, Navigation } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  mosque: Mosque;
  onBack: () => void;
}

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export default function MosqueDetail({ mosque, onBack }: Props) {
  const { times, nextPrayer, loading } = usePrayerTimes({ lat: mosque.lat, lng: mosque.lng });

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold text-foreground truncate">{mosque.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{mosque.address}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Status */}
        <span className={mosque.isOpen ? "badge-open" : "badge-closed"}>
          {mosque.isOpen ? "Open" : "Closed"}
        </span>

        {/* Prayer Times */}
        <div>
          <h2 className="font-display font-bold text-base mb-3">Prayer Times</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border">
              {PRAYER_NAMES.map((name) => (
                <div
                  key={name}
                  className={`flex items-center justify-between px-4 py-3 ${
                    name === nextPrayer ? "bg-mint/25" : "bg-card"
                  } ${name !== "Isha" ? "border-b border-border/50" : ""}`}
                >
                  <span className="font-medium text-sm">{name}</span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {times?.[name] || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jumu'ah */}
        {mosque.jummuahTime && (
          <div className="bg-mint/15 rounded-xl p-4">
            <h2 className="font-display font-bold text-base mb-2">Jumu'ah</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Khutbah</span>
              <span className="font-medium">{mosque.khutbahTime}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Prayer</span>
              <span className="font-medium">{mosque.jummuahTime}</span>
            </div>
          </div>
        )}

        {/* Facilities */}
        <div>
          <h2 className="font-display font-bold text-base mb-3">Facilities</h2>
          <div className="flex flex-wrap gap-2">
            {mosque.hasFemaleSpace && <span className="facility-chip">🕌 Female Prayer Space</span>}
            {mosque.hasWudu && <span className="facility-chip">🚿 Wudu Facility</span>}
            {mosque.hasWheelchairAccess && <span className="facility-chip">♿ Wheelchair Access</span>}
            {mosque.hasParking && <span className="facility-chip">🅿️ Parking</span>}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 bg-card border-t border-border">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary-full flex items-center justify-center gap-2"
        >
          <Navigation size={18} />
          Get Directions
        </a>
      </div>
    </motion.div>
  );
}
