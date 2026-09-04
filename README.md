# Class OP

Iowa State University class schedule optimizer preview. Plan a walkable week from Friley Hall / 212 Beyer Ct, Ames.

Not an official ISU app. Does not call live Workday. Demo Workday simulates SSO and loads the Beyer Loop Fall Y1 seed.

## Scripts

From /workspace/class-op-app: install dependencies, then the dev script (port 3000) or the production build script. See package.json.

## Demo flow

1. Sign in with an @iastate.edu email (other domains are rejected).
2. Click Demo Workday (not live OAuth). Optional: Open ISU Workday in a new tab.
3. Select Computer Engineering B.S., then edit the week grid and toggle Overview / MWF / TR on the map.

## Stack

Next.js 15 App Router, TypeScript, Tailwind CSS, Leaflet (OSM / CARTO). Session stored in localStorage key class-op-v1.

## Data

- Seed: MATH 1650, CPRE 1850, ENGL 1500, CHEM 1670, ENGR 1010, LIB 1600.
- Add-section picker uses a trimmed Fall 2026 dump from api.classes.iastate.edu (rooms not public; buildings inferred).
- Map pins use the supplied campus coordinates.
