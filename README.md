# FarmWatch

Weather intelligence portal for Kenyan smallholder farmers — built as a technical assessment for [Weather-AI](https://weather-ai.co).

FarmWatch solves a real last-mile problem: delivering timely, actionable weather data to farmers who make high-stakes decisions about planting, irrigation, and harvesting based on conditions they cannot control.

**Live demo:** https://farmwatch.netlify.app ← _replace with your Netlify URL after deploy_

---

## Features

### Dashboard
Real-time weather with Gemini AI narrative, 7-day forecast, and 24-hour hourly strip. On load the app auto-detects location via IP geolocation; any of Kenya's 47 counties can be searched by name, with OpenStreetMap Nominatim as a fallback for cities and coordinates outside the county map. An English/Swahili language toggle re-generates the AI summary in the chosen language. Compact irrigation and soil cards surface the most critical data without leaving the dashboard.

### Farm Guide
Three decision-support tools under one tab.

**Planting Calendar** — Season-aware crop guide built around Kenya's two growing seasons (Long Rains: March–May, Short Rains: October–December). Covers ten crops: maize, beans, tea, coffee, wheat, rice, sorghum, millet, sugarcane, and horticulture. Each profile shows planting status, days to maturity, recommended varieties, row spacing, fertilizer schedule, pest watch list, and a step-by-step care guide. Crops planted by registered farmers are highlighted with an enrollment count.

**Irrigation Planner** — 7-day schedule derived from FAO-56 evapotranspiration (ET₀) data pulled from Open-Meteo, multiplied by each crop's coefficient (Kc) to compute daily crop water demand (ETc). Net irrigation need = ETc − expected rainfall. Urgency thresholds: >6 mm/m² = irrigate today, 3–6 mm = moderate need, <3 mm = low. A per-crop breakdown is shown for all unique crop types across registered farmers.

**Soil Profile** — SoilGrids ISRIC API (0–5 cm depth) provides soil pH, organic carbon (g/kg), and clay content (%) for any searched location. Each metric is colour-coded with an agronomic interpretation and amendment recommendations. Crop suitability is inferred from the pH reading.

### Farmer Alert Portal
Register Bomet-district farmers with E.164 phone number validation. Each farmer card fetches live weather for their county on demand. An "Insights" panel shows today's calculated irrigation need and soil pH for that farmer's location without loading data for every farmer on mount. SMS alert dispatch is fully implemented; on the free tier the API returns `403 SMS_NOT_ENABLED`, which the app catches and presents as a clear simulated-success state rather than an error — the full UX flow is visible even without the Scale plan.

### Tree & Canopy Analysis
Drag-and-drop aerial or drone image upload. The image is sent as a multipart POST to the Weather-AI `/trees/analyze` endpoint, which returns a tree crown count, canopy health score, and Gemini-generated agronomic recommendations. Live quota is fetched from `/trees/quota` before each upload. Analysis history is pulled from `/trees/history`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite |
| Styling | Inline styles + CSS custom properties |
| Icons | lucide-react |
| API proxy | Netlify Functions (Node 18) |
| Primary API | Weather-AI REST API v1 |
| ET₀ / precipitation | Open-Meteo (free, no key required) |
| Soil data | SoilGrids ISRIC v2.0 (free, no key required) |
| Geocoding | Nominatim / OpenStreetMap (free, no key required) |
| Deployment | Netlify |

---

## Architecture

**Pure client-side SPA.** No router, no state management library. Tab-based navigation with conditional rendering in `App.jsx`. State lives at the top level and flows down as props — `useState` + prop drilling is intentional at this scale.

**Single API layer.** `src/lib/api.js` is the only file that calls the Weather-AI API. All fetch logic, auth headers, and response shaping live there. Components never call the API directly.

**Server-side API key.** The Weather-AI key is never included in the browser bundle. In production, all `/api/*` requests are caught by a Netlify serverless function (`netlify/functions/proxy.js`) that injects the `Authorization: Bearer` header server-side before forwarding to `https://api.weather-ai.co/v1`. In local development, Vite's proxy middleware does the same from `.env`. The key is loaded as `process.env.WEATHER_API_KEY` — note there is no `VITE_` prefix, which is what prevents it from being baked into the client bundle at build time.

**Private error logging.** `src/lib/errors.js` logs full error objects to the console while returning only generic, status-code-mapped messages to the UI. Stack traces are never surfaced to the browser.

**Redirect safety.** `src/lib/redirect.js` validates all redirect targets against the current origin and rejects any absolute URL not on an explicit allowlist, preventing open-redirect attacks.

---

## APIs Used

| Endpoint | Method | Purpose |
|---|---|---|
| `/v1/weather` | GET | Main weather + 7-day forecast + Gemini summary |
| `/v1/weather-geo` | GET | IP-based auto-location on first load |
| `/v1/hourly` | GET | 24-hour strip (lazy-loaded) |
| `/v1/sms/bomet/register` | POST | Register farmer for daily SMS alerts |
| `/v1/sms/alert` | POST | Dispatch structured SMS weather alert |
| `/v1/trees/analyze` | POST | Aerial image → tree count + canopy health |
| `/v1/trees/history` | GET | Past analyses |
| `/v1/usage` | GET | Quota / billing stats |
| Open-Meteo `/v1/forecast` | GET | ET₀ + precipitation for irrigation calculations |
| SoilGrids `/v2.0/properties/query` | GET | Soil pH, organic carbon, clay |
| Nominatim `/search` | GET | Geocoding fallback for non-county queries |

Weather-AI endpoints proxy through `netlify/functions/proxy.js` in production and through Vite's dev proxy locally. Open-Meteo, SoilGrids, and Nominatim are called directly from the browser — they are all free, keyless public APIs.

---

## Local Setup

**Requirements:** Node 18+, a Weather-AI API key (get one at weather-ai.co → Dashboard → API Keys).

```bash
git clone https://github.com/jatex009/Farmwatch.git
cd Farmwatch
npm install
cp .env.example .env
```

Edit `.env` and set your key:

```
WEATHER_API_KEY=wai_your_key_here
```

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

The Vite dev proxy injects the `Authorization` header for all `/api/*` requests. The key never appears in the browser, even locally.

---

## Deployment

The repo is configured for Netlify out of the box. `netlify.toml` sets the build command, publish directory, SPA fallback redirect, `/api/*` → serverless function routing, and Content-Security-Policy headers.

1. Push to GitHub.
2. In the Netlify dashboard, connect the repository.
3. Set a single environment variable:

```
WEATHER_API_KEY=wai_your_key_here
```

There is no step 4. Netlify reads `netlify.toml` and handles the rest.

> The variable name must be `WEATHER_API_KEY` — not `VITE_WEATHER_API_KEY`. The `VITE_` prefix tells Vite to embed the value in the client bundle at build time; without it, the key stays server-side in the Netlify function.

---

## Project Structure

```
farmwatch/
├── netlify/
│   └── functions/
│       └── proxy.js            # Serverless API key proxy
├── src/
│   ├── components/
│   │   ├── WeatherCard.jsx     # Current conditions + forecast + AI summary
│   │   ├── HourlyStrip.jsx     # 24-hour hourly forecast (lazy)
│   │   ├── CropAdvisory.jsx    # Risk parsing + per-crop recommendations
│   │   ├── FarmGuide.jsx       # Farm Guide tab shell + sub-navigation
│   │   ├── PlantingCalendar.jsx
│   │   ├── IrrigationCard.jsx
│   │   ├── SoilCard.jsx
│   │   ├── FarmerList.jsx      # Roster + per-farmer insights + SMS dispatch
│   │   ├── RegisterFarmerForm.jsx
│   │   ├── TreeAnalyzer.jsx    # Drag-and-drop image analysis
│   │   └── UsageBar.jsx        # Live API quota display
│   ├── lib/
│   │   ├── api.js              # All Weather-AI API calls
│   │   ├── openmeteo.js        # ET₀ + precipitation (Open-Meteo)
│   │   ├── soilgrids.js        # Soil data + d_factor unit conversion
│   │   ├── farmguide.js        # Crop profiles + Kenya season logic
│   │   ├── errors.js           # Private logging + safe user messages
│   │   ├── redirect.js         # Open-redirect prevention
│   │   └── useToast.js         # Lightweight toast hook
│   ├── App.jsx                 # Root layout, tab routing, top-level state
│   ├── main.jsx
│   └── index.css               # Design tokens + utility classes
├── .env.example
├── netlify.toml
├── vite.config.js
└── package.json
```

---

## Design System

Earthy / agroforestry aesthetic built entirely on CSS custom properties. No framework, no utility classes beyond a small set defined in `index.css`.

```css
--soil:     #1a1208   /* darkest background */
--bark:     #2d1f0e   /* card background */
--clay:     #3d2b14   /* input background */
--ochre:    #c47a2b   /* primary accent */
--sun:      #f0a500   /* hover / highlight */
--leaf:     #4a7c3f   /* success / green */
--sky:      #7ec8e3   /* info / blue */
--cream:    #f5ede0   /* primary text */
--text-dim: #a89880   /* secondary text */
```

Typography: `Syne` (headings) and `DM Sans` (body) from Google Fonts.

---

## Developer

**Sharmake Ahmed** — Full-Stack Engineer, Nairobi, Kenya  
React · TypeScript · Node.js · PostgreSQL · Firebase · Go
