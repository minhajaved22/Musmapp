import { useState, useEffect } from "react";

interface PrayerTimesData {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerInfo {
  times: PrayerTimesData | null;
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerTime: string;
  countdown: string;
  loading: boolean;
}

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  return now;
}

function getCountdown(targetTime: string): string {
  const now = new Date();
  const target = parseTime(targetTime);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getCurrentAndNext(times: PrayerTimesData) {
  const now = new Date();
  for (let i = 0; i < PRAYER_NAMES.length; i++) {
    const prayerTime = parseTime(times[PRAYER_NAMES[i]]);
    if (now < prayerTime) {
      return {
        currentPrayer: i > 0 ? PRAYER_NAMES[i - 1] : "Isha",
        nextPrayer: PRAYER_NAMES[i],
        nextPrayerTime: times[PRAYER_NAMES[i]],
      };
    }
  }
  return {
    currentPrayer: "Isha",
    nextPrayer: "Fajr",
    nextPrayerTime: times.Fajr,
  };
}

export function usePrayerTimes(): PrayerInfo {
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState("");
  const [nextPrayer, setNextPrayer] = useState("");
  const [nextPrayerTime, setNextPrayerTime] = useState("");

  useEffect(() => {
    fetch("https://api.aladhan.com/v1/timingsByCity?city=London&country=GB&method=2")
      .then((r) => r.json())
      .then((data) => {
        const t = data.data.timings;
        const parsed: PrayerTimesData = {
          Fajr: t.Fajr.split(" ")[0],
          Dhuhr: t.Dhuhr.split(" ")[0],
          Asr: t.Asr.split(" ")[0],
          Maghrib: t.Maghrib.split(" ")[0],
          Isha: t.Isha.split(" ")[0],
        };
        setTimes(parsed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!times) return;
    const update = () => {
      const { currentPrayer: cp, nextPrayer: np, nextPrayerTime: npt } = getCurrentAndNext(times);
      setCurrentPrayer(cp);
      setNextPrayer(np);
      setNextPrayerTime(npt);
      setCountdown(getCountdown(npt));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [times]);

  return { times, currentPrayer, nextPrayer, nextPrayerTime, countdown, loading };
}
