# Musmapp

**Google Maps doesn't know you need to pray.**

Musmapp is a mobile-first web app that helps Muslims in London find a place to pray quickly: nearby mosques on a map, filters for what you actually need, live prayer times and a Qibla compass.

**Live app:** https://musmapp-prayer-space-finder.lovable.app/

**Slide deck:** https://www.canva.com/design/DAHFKIJ5lsA/UPzqeOVDmtn1i4EEyRlX2Q/view

I built Musmapp as an end-to-end product project. I moved between Karachi, where mosques are on every corner but rarely have space for women, and London, where there are more women's spaces but no easy way to find them. This repo holds the working prototype. The thinking behind it (problem, personas, competitors and roadmap) is summarised below.

## What it does

- **Map-first discovery.** Uses your location to show nearby mosques on a Google Map, searching 3 km, 10 km and 30 km radii and searching again as you pan.
- **Smart filters.** All, Female Spaces, Open Now and Wudu, plus search by mosque name.
- **List view.** The same results sorted by distance in miles.
- **Mosque detail.** Prayer times grid with the next prayer highlighted, Jumu'ah and khutbah times, and facility badges for female prayer space, wudu, wheelchair access and parking.
- **Live prayer times.** A banner with a countdown to the next prayer, using the Aladhan API for the user's coordinates.
- **Qibla compass.** Calculates the bearing to Mecca from your location and rotates a needle using device orientation, with a fallback message when no compass is available.
- **Instant directions.** Hands off to Google Maps for turn-by-turn directions to any mosque.

## Who it is for

| Persona | Situation | Uses Musmapp for |
| --- | --- | --- |
| Amirah, 19, architecture student at UCL | Relocated from Dubai, always on the move, London feels unfamiliar | Female spaces and open now |
| Safwaan, 26, consultant | Back-to-back client meetings across London with no time to search | Open now and directions |
| Fatima, 37, tourist from Istanbul | First visit to London with no local knowledge | GPS discovery and Qibla |

## How it compares

| App | Does well | Missing | Musmapp's angle |
| --- | --- | --- | --- |
| Techbir.org | Finds nearby prayer spaces and facilities | No live prayer times or female space filter | Live times and a female filter |
| Muslim Pro | Prayer times, Quran, Qibla, global reach | No mosque discovery or female space filter | GPS discovery and a female filter |
| Pillars | Clean, ad-free, privacy-first prayer times | No mosque finder, map or directions | Map-first mosque discovery |
| Muslimah App | Verified database of UK prayer spaces | Women only and no live prayer times | Gender neutral with live prayer times |
| Google Maps | GPS search with live directions | No female, prayer time or wudu filters | Muslim-specific filters |

## Roadmap

1. **Now: mosque finder.** Web app, user testing and iteration, then iOS and Android.
2. **Next: Muslim events.** Find talks and events nearby and link out to ticketing.

A database integration is also in progress to hold facility data that Google Maps does not provide.

## Known limitations

These are deliberate prototype trade-offs, listed so nobody is surprised:

- Facility flags (female space, wudu, wheelchair access, parking) and Jumu'ah times come from a small curated dataset in `src/data/mosques.ts`. Mosques found live through Google Places default to no facilities listed, so the Female Spaces and Wudu filters currently only match curated entries.
- When Google Places returns no opening hours, a mosque is treated as open.
- Prayer times are calculated for the mosque's coordinates through Aladhan, not taken from each mosque's own iqamah timetable.

## Tech stack

- Vite, React 18 and TypeScript
- Tailwind CSS and shadcn/ui (Radix UI)
- Framer Motion for animation
- React Router and TanStack Query
- Google Maps JavaScript API with the Places library
- Aladhan API for prayer times
- Vitest and Playwright set up for testing
- Prototyped and built with Lovable, with Claude used for problem framing, PRD review and prompt design

## Getting started

You need Node.js 18 or later.

```bash
git clone https://github.com/minhajaved22/Musmapp.git
cd Musmapp
npm install
npm run dev
```

The app runs at http://localhost:8080. Use your browser's device toolbar for the mobile layout.

### Google Maps API key

The Maps script tag in `index.html` loads the Maps JavaScript API with an API key. To run your own copy:

1. Create a key in the Google Cloud Console and enable the **Maps JavaScript API** and **Places API**.
2. Replace the `key=` value in the script tag in `index.html` with your own key.
3. Restrict the key to your own domains under HTTP referrers, so it cannot be used elsewhere.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests once with Vitest |

## Project structure

```
src/
  components/   Filter chips, mosque card, prayer banner, bottom navigation, shadcn/ui
  data/         Curated mosque dataset
  hooks/        useGeolocation and usePrayerTimes
  pages/        Splash, map, list, mosque detail and Qibla screens
  lib/          Shared utilities
```

## Author

Built by Minha Javed in London.

## Licence

MIT. See [LICENSE](LICENSE).
