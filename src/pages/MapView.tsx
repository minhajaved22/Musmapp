/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, MapPin } from "lucide-react";
import { Mosque } from "@/data/mosques";
import FilterChips, { FilterType } from "@/components/FilterChips";
import PrayerBanner from "@/components/PrayerBanner";
import MosqueCard from "@/components/MosqueCard";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  mosques: Mosque[];
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onSelectMosque: (m: Mosque) => void;
  search: string;
  onSearchChange: (s: string) => void;
  liveMosques: Mosque[];
  onLiveMosquesChange: (m: Mosque[]) => void;
}

export default function MapView({
  mosques,
  filter,
  onFilterChange,
  onSelectMosque,
  search,
  onSearchChange,
  liveMosques,
  onLiveMosquesChange,
}: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const nearest = mosques.length > 0 ? mosques[0] : liveMosques[0] || null;
  const allMosques = mosques.length > 0 ? mosques : liveMosques;

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 51.5074, lng: -0.1278 }) // fallback London
    );
  }, []);

  // Init Google Map
  useEffect(() => {
    if (!containerRef.current || !userLocation || mapRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center: userLocation,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "water", stylers: [{ color: "#d4e8dc" }] },
        { featureType: "landscape", stylers: [{ color: "#f0f5f1" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      ],
    });
    mapRef.current = map;

    // User location marker
    new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#6A9E7F",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      title: "You",
    });

    // Search for nearby mosques via Places API
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: userLocation,
        radius: 5000,
        keyword: "mosque",
      },
      (results, status) => {
        setLoading(false);
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          console.warn("Places API failed:", status, "— falling back to static mosques");
          return;
        }

        const found: Mosque[] = results
          .filter((r) => r.geometry?.location)
          .map((r, i) => {
            const loc = r.geometry!.location!;
            const dist = google.maps.geometry
              ? google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(userLocation.lat, userLocation.lng),
                  loc
                ) / 1609.34
              : 0;
            return {
              id: r.place_id || `live-${i}`,
              name: r.name || "Mosque",
              address: r.vicinity || "",
              lat: loc.lat(),
              lng: loc.lng(),
              distanceMiles: Math.round(dist * 10) / 10,
              isOpen: r.opening_hours?.isOpen?.() ?? true,
              hasFemaleSpace: false,
              hasWudu: false,
              hasWheelchairAccess: false,
              hasParking: false,
              jummuahTime: null,
              khutbahTime: null,
            };
          })
          .sort((a, b) => a.distanceMiles - b.distanceMiles);

        onLiveMosquesChange(found);
      }
    );

    return () => {
      mapRef.current = null;
    };
  }, [userLocation]);

  // Update markers when mosques change
  const updateMarkers = useCallback((mosquesToShow: Mosque[]) => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    mosquesToShow.forEach((mosque) => {
      const marker = new google.maps.Marker({
        position: { lat: mosque.lat, lng: mosque.lng },
        map: mapRef.current!,
        title: mosque.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><text y="28" font-size="28">🕌</text></svg>`
          ),
          scaledSize: new google.maps.Size(36, 36),
        },
      });

      marker.addListener("click", () => onSelectMosque(mosque));
      markersRef.current.push(marker);
    });
  }, [onSelectMosque]);

  useEffect(() => {
    updateMarkers(allMosques);
  }, [allMosques, updateMarkers]);

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
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-[999]">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
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
