import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mosques, Mosque } from "@/data/mosques";
import { MapPin, LocateFixed, AlertCircle } from "lucide-react";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  onContinue: () => void;
  geo: {
    location: { lat: number; lng: number } | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
  };
}

export default function SplashScreen({ onContinue, geo }: Props) {
  const nearest = useMemo(() => {
    if (!geo.location) return null;
    let best: (Mosque & { dist: number }) | null = null;
    for (const m of mosques) {
      const d = haversineDistance(geo.location.lat, geo.location.lng, m.lat, m.lng);
      if (!best || d < best.dist) best = { ...m, dist: Math.round(d * 10) / 10 };
    }
    return best;
  }, [geo.location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-card px-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-mint/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Crescent motif */}
        <div className="w-20 h-20 mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-forest" />
          <div className="absolute top-1 right-1 w-14 h-14 rounded-full bg-card" />
        </div>

        <h1 className="font-display text-4xl font-extrabold text-forest tracking-tight">
          Musmapp
        </h1>
        <p className="text-lg text-foreground/80 mt-3 font-medium leading-snug">
          Find your prayer space,
          <br />
          wherever you are
        </p>

        <AnimatePresence mode="wait">
          {geo.loading ? (
            <motion.div
              key="locating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Finding nearest mosque…
            </motion.div>
          ) : geo.error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex flex-col items-center gap-3 max-w-[280px]"
            >
              <div className="bg-destructive/10 rounded-2xl px-5 py-4 text-center">
                <AlertCircle size={20} className="text-destructive mx-auto mb-2" />
                <p className="text-sm text-foreground/80">{geo.error}</p>
              </div>
              <button
                onClick={geo.retry}
                className="flex items-center gap-2 text-sm text-forest font-semibold"
              >
                <LocateFixed size={16} />
                Retry location
              </button>
            </motion.div>
          ) : nearest ? (
            <motion.div
              key="nearest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 bg-mint/15 rounded-2xl px-5 py-4 max-w-[280px]"
            >
              <div className="flex items-center gap-2 text-forest font-semibold text-base">
                <MapPin size={18} />
                {nearest.name}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {nearest.dist} miles away · {nearest.isOpen ? "Open now" : "Closed"}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-5 max-w-[260px]"
            >
              Built for the moment you're out and need to pray now
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={geo.error ? geo.retry : onContinue}
          className="btn-primary mt-10 text-base"
        >
          {geo.error ? "Enable location" : nearest ? "Let's go" : "Enable location"}
        </motion.button>
      </motion.div>
    </div>
  );
}
