# Copilot instructions for this repo

This repository powers a small React + Vite + Mapbox app that visualizes personal locations as a GeoJSON FeatureCollection. Use these rules to provide accurate, minimal, and stylistically consistent suggestions.

## Tech stack and entry points
- Framework: React 19 with TypeScript, Vite
- Mapping: mapbox-gl + react-map-gl
- Data source: `src/geojson.ts` exports a `FeatureCollection<Point>` named `geoJson`
- Map component: `src/Map.tsx` consumes `geoJson` and renders layers based on `properties.placeType`
- Site config: `src/siteconfig.ts` (contains the Mapbox token and site title)

## Data contract (strict)
Each feature must conform to this shape:
- `type`: "Feature"
- `properties`
  - `place`: string (display name, e.g., "City, Region, Country" or landmark)
  - `localname`: string | null (native/local script or null)
  - `placeType`: one of "Home" | "Work" | "Travel" | "Future" | "Birth"
  - `description`: string (plain text; may include simple emoji like 🤞)
- `geometry`
  - `type`: "Point"
  - `coordinates`: [longitude, latitude] as decimal degrees

Important:
- Coordinate order is [lon, lat] (x = E/W, y = N/S). Do not invert.
- Use decimal degrees with a reasonable precision (4–6 decimals).
- Keep property names exactly as above; `Map.tsx` filters by `placeType`.

## Editing conventions for `src/geojson.ts`
- Append new features near the end of the `features` array; keep formatting style consistent with nearby entries.
- Use single quotes for string literals in object keys/values in this file (match existing style).
- Include trailing commas where the file already uses them; avoid large refactors or reformatting unrelated sections.
- For “Future” locations, the `description` typically starts with "🤞 Future Location." followed by a short sentence.
- Keep descriptions concise and factual. Avoid HTML; `Map.tsx` renders descriptions via `dangerouslySetInnerHTML` but input should be plain text.

### Example feature template (copy and adapt):
```ts
{
    'type': 'Feature',
    'properties': {
        'place': 'Example Place, Region, Country',
        'localname': null,
        'placeType': 'Travel',
        'description': `Short, factual description. If future: 🤞 Future Location. …`
    },
    'geometry': {
        'type': 'Point',
        'coordinates': [8.12345, 49.12345],
    }
},
```

## Coordinates guidance
- Prefer authoritative sources (official sites, OpenStreetMap, or Wikipedia).
- If coordinates are given in DMS (degrees/minutes/seconds), convert carefully to decimal and verify on a map. East/North are positive; West/South are negative.

## Run, build, lint
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

Node version: see `package.json` engines (currently Node 23.x).

## Map styling logic (for awareness)
- Symbol/marker styles are driven by `properties.placeType`:
  - Home: green, 🏠
  - Work: blue, 💼
  - Travel: pink, 🎉
  - Future: orange, ⭐
- Do not change IDs or filter expressions in layers without explicit instruction.

## Do and Don’t
- Do: make minimal, targeted edits; keep suggestions consistent with TypeScript types (`@types/geojson` is installed).
- Do: maintain the FeatureCollection contract and coordinate ordering.
- Don’t: introduce heavy dependencies or refactor the map or data model unless asked.
- Don’t: hardcode secrets outside `src/siteconfig.ts`; prefer reading existing values.

## Common tasks
- Adding a new place: append a feature in `src/geojson.ts` using the template above; verify lon/lat ordering and formatting.
- Copy updates: small tweaks to `description` or `localname` are fine; keep style consistent.

These rules help keep data consistent and the map layers functioning without surprises. Thanks!
