import { useState, useCallback } from "react";

interface GeoState {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0, // Always get fresh position, never use cached
};

function getErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission denied. Please enable location access in your browser or device settings.";
    case err.POSITION_UNAVAILABLE:
      return "Location unavailable. Make sure location services are turned on.";
    case err.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "Unable to determine your location.";
  }
}

export function useGeolocation() {
  const [state, setState] = useState<Omit<GeoState, "retry">>({
    location: null,
    loading: true,
    error: null,
  });

  const fetchLocation = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState({ location: null, loading: false, error: "Geolocation is not supported by your browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({
          location: null,
          loading: false,
          error: getErrorMessage(err),
        });
      },
      GEO_OPTIONS
    );
  }, []);

  return { ...state, retry: fetchLocation, fetchLocation };
}
