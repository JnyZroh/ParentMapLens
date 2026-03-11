/**
 * HeroSection.jsx
 *
 * The visual hero area below the search bar.  Mirrors the top half of the
 * wireframe: a map snippet on the left, a photo grid on the right.
 *
 * ── Layout ────────────────────────────────────────────────────────────────────
 *
 *   ┌────────────────┬───────────────┐
 *   │                │  photo  photo │
 *   │   Map snippet  │  photo  photo │
 *   │  (Leaflet)     │  photo  photo │
 *   └────────────────┴───────────────┘
 *
 *   Left  ~55%  →  Leaflet MapContainer, limited interaction (read-only feel)
 *   Right ~45%  →  2 × 3 grid of venue photo thumbnails (gray placeholders)
 *
 * ── Map Interaction Restrictions ─────────────────────────────────────────────
 * Per CLAUDE.md: the snippet is "non-interactive or limited-interaction."
 * We disable dragging, zoom controls, scroll wheel, double-click, tap, and
 * keyboard navigation.  The map is essentially a static image built from live
 * OpenStreetMap tiles — it renders the real street layout without being a
 * full interactive map (that lives on a dedicated map screen).
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 * @prop {[number, number]} center  - [latitude, longitude] of the venue
 * @prop {number}           zoom    - Leaflet zoom level (15–17 recommended for block-level)
 * @prop {string[]}         photos  - Array of image URLs; falls back to placeholders
 */

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

/**
 * A single placeholder tile for the photo grid.
 * In Phase 3+ this will accept a `src` prop and render a real <img>.
 */
function PhotoTile({ src, index }) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Venue photo ${index + 1}`}
        className="w-full h-full object-cover rounded-md"
      />
    )
  }
  // Placeholder: a gray box with a subtle diagonal line pattern
  return (
    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
      <span className="text-gray-400 text-xs">photo</span>
    </div>
  )
}

function HeroSection({ center, zoom = 16, photos = [] }) {
  return (
    /*
     * `flex` + `h-52` (mobile) → side-by-side at a fixed height.
     * Rounded corners and overflow-hidden clip both children to the same shape.
     */
    <div className="flex h-52 sm:h-64 mx-3 gap-2 rounded-xl overflow-hidden">

      {/* ── Left: Map Snippet ─────────────────────────────────────────────── */}
      {/*
        * `flex-[3]` gives the map roughly 55–60% of the available width.
        * The MapContainer must have an explicit height or it renders as 0px.
        * We set it to 100% so it fills this flex child.
        *
        * ALL interaction props are set to `false` to make this a read-only
        * location snippet, as specified in CLAUDE.md.
        */}
      <div className="flex-[3] relative rounded-xl overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          // ── Disable all user interaction ──────────────────────────────
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          // ─────────────────────────────────────────────────────────────
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {/* Pin for the venue itself */}
          <Marker position={center}>
            <Popup>This venue</Popup>
          </Marker>
        </MapContainer>

        {/* Small overlay label so users know this is a map snippet */}
        <div className="absolute bottom-1 left-1 bg-white/70 rounded px-1 py-0.5 text-[10px] text-gray-600 pointer-events-none">
          Location
        </div>
      </div>

      {/* ── Right: Photo Grid (2 columns × 3 rows) ────────────────────────── */}
      {/*
        * `flex-[2]` gives the grid the remaining ~40–45% width.
        * `grid-cols-2 grid-rows-3` creates a 2×3 thumbnail layout.
        * We always render 6 tiles; any photos beyond index 5 are ignored.
        */}
      <div className="flex-[2] grid grid-cols-2 grid-rows-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <PhotoTile key={i} src={photos[i]} index={i} />
        ))}
      </div>
    </div>
  )
}

export default HeroSection
