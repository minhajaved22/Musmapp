import { usePrayerTimes } from "@/hooks/usePrayerTimes";

export default function PrayerBanner() {
  const { currentPrayer, nextPrayer, nextPrayerTime, countdown, loading } = usePrayerTimes();

  if (loading) {
    return (
      <div className="prayer-banner animate-pulse mx-4">
        <div className="h-5 bg-primary-foreground/20 rounded w-3/4" />
      </div>
    );
  }

  return (
    <div className="prayer-banner mx-4 flex items-center justify-between">
      <div>
        <span className="text-sm font-medium opacity-80">Now</span>
        <p className="text-base font-bold">{currentPrayer}</p>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium opacity-80">{nextPrayer} in</span>
        <p className="text-base font-bold">{countdown}</p>
      </div>
    </div>
  );
}
