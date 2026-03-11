/**
 * leafletIconFix.js — Shared Leaflet default-icon patch
 *
 * WHY THIS EXISTS:
 *   Leaflet's default marker images (the blue pin you see on a map) are
 *   referenced by relative paths baked into the library.  When Vite bundles
 *   the project it moves and renames assets, so those paths break and you
 *   get invisible markers.
 *
 *   This file patches Leaflet once, at import time, to point at the correct
 *   bundled image paths.  It is safe to import from multiple components
 *   because `mergeOptions` is idempotent — running it twice has no bad effect.
 *
 * HOW TO USE:
 *   Import this file once, as early as possible (e.g. main.jsx), and it
 *   will fix icon paths for every Leaflet map in the app automatically.
 *
 *   import './utils/leafletIconFix'  // no named export needed — side effects only
 */

import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Remove the broken built-in path resolver
delete L.Icon.Default.prototype._getIconUrl

// Point Leaflet at the Vite-bundled image paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
