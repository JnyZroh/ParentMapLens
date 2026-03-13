/**
 * MapComponent.jsx
 *
 * Renders an interactive OpenStreetMap tile layer using react-leaflet.
 *
 * WHY react-leaflet?
 *   Leaflet is a battle-tested, open-source mapping library.  OpenStreetMap
 *   provides the free tile imagery.  Together they replace Google Maps with
 *   zero API-key friction.
 *
 * WHY fix the Leaflet icon paths?
 *   Vite (and most bundlers) move image assets to hashed filenames in /assets.
 *   Leaflet hard-codes relative paths to its default marker PNGs, which break
 *   in bundled projects.  The block below patches those paths at runtime so
 *   pins render correctly out of the box.
 */

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// Icon fix is applied globally in main.jsx via leafletIconFix.js — no need to repeat here.

/**
 * Default map center and zoom level.
 * Centred on Métro Verdun (Rue Wellington), our launch neighbourhood in Montréal.
 * Zoom 15 shows roughly a 5-block radius — ideal for a neighbourhood search view.
 */
const DEFAULT_CENTER = [45.4651, -73.5692] // Métro Verdun, Rue Wellington
const DEFAULT_ZOOM = 15

function MapComponent() {
  return (
    /**
     * MapContainer — the root Leaflet element.
     *
     * `style` must give the container an explicit height; otherwise the map
     * renders as 0px tall and you see nothing.  We use 100vh so it fills the
     * entire browser window.
     */
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100vh', width: '100%' }}
      // scrollWheelZoom lets users zoom with a mouse wheel / trackpad pinch
      scrollWheelZoom={true}
    >
      {/**
       * TileLayer — fetches and displays the actual map imagery.
       * OpenStreetMap tiles are free and require no API key.
       * The attribution string is required by OSM's terms of service.
       */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/**
       * Marker + Popup — a placeholder pin demonstrating that pins work.
       * Phase 3 will replace this with real "Awareness" location pins loaded
       * from the FastAPI backend.
       */}
      <Marker position={DEFAULT_CENTER}>
        <Popup>
          <strong>Métro Verdun 📍</strong>
          <br />
          Phase 3 will load real venue pins here.
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default MapComponent
