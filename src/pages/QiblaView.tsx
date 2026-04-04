import { useState, useEffect, useCallback } from "react";
import { Compass, LocateFixed } from "lucide-react";
import { motion } from "framer-motion";

// Kaaba coordinates
const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

function calculateQibla(lat: number, lng: number): number {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const meccaLatRad = (MECCA_LAT * Math.PI) / 180;
  const meccaLngRad = (MECCA_LNG * Math.PI) / 180;
  const dLng = meccaLngRad - lngRad;
  const x = Math.sin(dLng);
  const y = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(dLng);
  let qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

export default function QiblaView() {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [hasCompass, setHasCompass] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocation = useCallback(() => {
    setLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const angle = calculateQibla(pos.coords.latitude, pos.coords.longitude);
        setQiblaAngle(angle);
        setLoading(false);
      },
      () => {
        // Fallback to London
        setQiblaAngle(calculateQibla(51.5074, -0.1278));
        setLocationError("Using London as default location");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      // iOS provides webkitCompassHeading (degrees from true north, clockwise)
      // Android/desktop: alpha is degrees counterclockwise from north
      const evt = e as any;
      if (typeof evt.webkitCompassHeading === "number") {
        setHeading(evt.webkitCompassHeading);
      } else if (e.alpha !== null) {
        // On Android, alpha=0 means pointing north, increases counterclockwise
        // Convert to clockwise compass heading
        setHeading((360 - e.alpha) % 360);
      }
    };

    if ("DeviceOrientationEvent" in window) {
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === "function") {
        // iOS 13+ — permission must be triggered by user gesture
        // We'll request on first render; if it fails, show the button
        DOE.requestPermission()
          .then((permission: string) => {
            if (permission === "granted") {
              window.addEventListener("deviceorientation", handler, true);
            } else {
              setHasCompass(false);
            }
          })
          .catch(() => setHasCompass(false));
      } else {
        window.addEventListener("deviceorientation", handler, true);
        const timeout = setTimeout(() => {
          setHasCompass(false);
        }, 3000);
        const onFirst = (e: DeviceOrientationEvent) => {
          if (e.alpha !== null) {
            clearTimeout(timeout);
            setHasCompass(true);
          }
        };
        window.addEventListener("deviceorientation", onFirst, { once: true });
      }
    } else {
      setHasCompass(false);
    }

    return () => {
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, []);

  const rotation = qiblaAngle !== null ? qiblaAngle - heading : 0;
  const normalizedDiff = Math.abs(((rotation % 360) + 360) % 360);
  const facingQibla = normalizedDiff < 5 || normalizedDiff > 355;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="font-display text-xl font-bold text-forest">Qibla</h1>
        <Compass size={20} className="text-forest" />
      </div>

      {/* Compass area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-sage/30 border-t-forest rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Finding your location…</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Compass circle */}
            <div className="relative w-64 h-64">
              {/* Glow ring behind compass when facing Qibla */}
              <motion.div
                className="absolute -inset-3 rounded-full"
                animate={{
                  boxShadow: facingQibla
                    ? ["0 0 20px 4px hsla(145, 30%, 52%, 0.25)", "0 0 30px 8px hsla(145, 30%, 52%, 0.4)", "0 0 20px 4px hsla(145, 30%, 52%, 0.25)"]
                    : "0 0 0px 0px transparent",
                }}
                transition={{
                  duration: 2,
                  repeat: facingQibla ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />

              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-[3px]"
                animate={{
                  borderColor: facingQibla ? "hsl(145, 30%, 52%)" : "hsl(var(--border))",
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              {/* Cardinal directions */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">N</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">S</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">E</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">W</span>

              {/* Rotating needle */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              >
                {/* Needle line */}
                <motion.div
                  className="absolute top-6 left-1/2 -translate-x-1/2 w-1 h-[calc(50%-24px)] rounded-full origin-bottom"
                  animate={{ backgroundColor: facingQibla ? "hsl(145, 30%, 52%)" : "hsl(145, 30%, 32%)" }}
                  transition={{ duration: 0.6 }}
                />
                {/* Kaaba icon at tip */}
                <motion.div
                  className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
                  animate={{
                    backgroundColor: facingQibla ? "hsl(145, 40%, 48%)" : "hsl(145, 30%, 32%)",
                    boxShadow: facingQibla
                      ? "0 0 16px 4px hsla(145, 40%, 48%, 0.4)"
                      : "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <span className="text-white text-sm">🕋</span>
                </motion.div>
                {/* Opposite end */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-1 h-[calc(50%-24px)] bg-muted-foreground/30 rounded-full origin-top" />
              </motion.div>

              {/* Center dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2"
                animate={{
                  backgroundColor: facingQibla ? "hsl(145, 40%, 80%)" : "hsl(var(--mint))",
                  borderColor: facingQibla ? "hsl(145, 40%, 48%)" : "hsl(145, 30%, 32%)",
                }}
                transition={{ duration: 0.6 }}
              />
            </div>

            {/* Info */}
            <div className="text-center space-y-1">
              <p className="text-2xl font-display font-bold text-foreground">
                {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : "—"}
              </p>
              <p className="text-sm text-muted-foreground">from North</p>
            </div>

            <AnimatePresence>
              {facingQibla && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-primary/15 text-forest text-sm font-semibold px-5 py-2 rounded-full"
                >
                  ✓ Facing Qibla
                </motion.div>
              )}
            </AnimatePresence>

            {!hasCompass && (
              <div className="bg-mint/20 text-accent-foreground text-xs font-medium px-4 py-2 rounded-full text-center max-w-[260px]">
                Compass not available — rotate your phone to orient manually
              </div>
            )}

            {locationError && (
              <button
                onClick={getLocation}
                className="flex items-center gap-2 text-sm text-forest font-medium"
              >
                <LocateFixed size={16} />
                Use my location
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom info */}
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          Point the 🕋 toward Mecca to find your prayer direction
        </p>
      </div>
    </div>
  );
}
