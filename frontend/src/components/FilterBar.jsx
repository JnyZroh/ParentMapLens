/**
 * FilterBar.jsx
 *
 * The horizontal control strip below the MainInfoCard.  Three sections:
 *
 *  ┌─────────────┬───────────────────┬──────────────────────────┐
 *  │    CREW     │     FILTERS       │        SHOWING           │
 *  │  1 adult    │  Location H4E 1T5 │  stroller-friendly       │
 *  │  2 toddlers │  ──●────── 3km    │  diaper changing tables  │
 *  │  1 infant   │                   │  play area               │
 *  │  [adjust]   │                   │  ☑ Include unconfirmed   │
 *  └─────────────┴───────────────────┴──────────────────────────┘
 *
 * ── CREW section ──────────────────────────────────────────────────────────────
 * Reads current crew from CrewContext.  The "Adjust" button toggles an inline
 * editor with +/- controls for each crew type.  Changes update the context,
 * which automatically re-computes compatibility scores everywhere.
 *
 * ── FILTERS section ───────────────────────────────────────────────────────────
 * Location chip (postal code of current search area) + a distance range slider.
 * In Phase 3 these will filter the venue list returned by the backend.
 *
 * ── SHOWING section ───────────────────────────────────────────────────────────
 * A read-only summary of the currently active tag filters.
 * "Include unconfirmed" toggles whether venues with parent-reported-but-
 * unverified tags are shown alongside fully verified ones.
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 * @prop {string}   locationCode     - Current search area postal code, e.g. "H4E 1T5"
 * @prop {string[]} activeTagFilters - Tag keys currently filtering the results
 * @prop {Function} onFiltersChange  - Called with updated filter state (Phase 3)
 */

import { useState }                from 'react'
import { useCrew }                 from '../context/CrewContext'

// ── Small helper: +/- stepper for the Adjust panel ────────────────────────────
function Stepper({ label, value, onIncrement, onDecrement }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-700 text-xs w-16">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-purple-200 text-gray-700 font-bold text-sm flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className="w-4 text-center text-sm font-semibold text-gray-800">{value}</span>
        <button
          onClick={onIncrement}
          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-purple-200 text-gray-700 font-bold text-sm flex items-center justify-center"
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  )
}

// ── Tag label lookup (short versions for the SHOWING column) ──────────────────
const TAG_LABELS = {
  stroller_friendly: 'Stroller-friendly spaces',
  changing_table:    'Diaper changing tables',
  play_area:         'Play area',
  high_chairs:       'High chairs',
  unisex_baby_duty:  'Unisex baby duty spaces',
}

function FilterBar({
  locationCode = 'H4E 1T5',
  activeTagFilters = ['stroller_friendly', 'changing_table', 'play_area'],
  onFiltersChange,
}) {
  // Pull crew state + adjust controls from global context
  const { crew, adjustCrew, isAdjusting, setIsAdjusting } = useCrew()

  // Distance radius slider — local state; will be lifted to a filter context in Phase 3
  const [radiusKm, setRadiusKm] = useState(3)

  // Include unconfirmed reports toggle — local state for now
  const [includeUnconfirmed, setIncludeUnconfirmed] = useState(true)

  // Build a readable crew summary string, skipping zero-count groups
  function crewSummary() {
    const parts = []
    if (crew.adults   > 0) parts.push(`${crew.adults} adult${crew.adults   > 1 ? 's' : ''}`)
    if (crew.toddlers > 0) parts.push(`${crew.toddlers} toddler${crew.toddlers > 1 ? 's' : ''}`)
    if (crew.infants  > 0) parts.push(`${crew.infants} infant${crew.infants  > 1 ? 's' : ''}`)
    return parts.length > 0 ? parts : ['No crew set']
  }

  return (
    <div className="mx-3 mt-3 rounded-2xl bg-gray-50 border border-gray-200 p-3 shadow-sm">
      {/*
        * Three columns, each in a `flex-1` container so they share width equally.
        * On very small screens they wrap to their own rows; on normal phones
        * (≥ 360px) they sit side by side.
        */}
      <div className="flex gap-3 text-xs">

        {/* ── Column 1: Crew ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm mb-1">Crew</p>

          {/* When NOT adjusting: show a plain text summary */}
          {!isAdjusting && (
            <>
              {crewSummary().map((line, i) => (
                <p key={i} className="text-gray-600 leading-snug">{line}</p>
              ))}
            </>
          )}

          {/* When adjusting: show +/- steppers for each crew type */}
          {isAdjusting && (
            <div className="space-y-1.5 mt-1">
              <Stepper
                label="Adults"
                value={crew.adults}
                onIncrement={() => adjustCrew('adults',   +1)}
                onDecrement={() => adjustCrew('adults',   -1)}
              />
              <Stepper
                label="Toddlers"
                value={crew.toddlers}
                onIncrement={() => adjustCrew('toddlers', +1)}
                onDecrement={() => adjustCrew('toddlers', -1)}
              />
              <Stepper
                label="Infants"
                value={crew.infants}
                onIncrement={() => adjustCrew('infants',  +1)}
                onDecrement={() => adjustCrew('infants',  -1)}
              />
            </div>
          )}

          {/* Toggle button: "adjust" ↔ "done" */}
          <button
            onClick={() => setIsAdjusting(!isAdjusting)}
            className="
              mt-2
              px-3 py-1
              rounded-full
              border border-gray-400 text-gray-600
              hover:border-purple-400 hover:text-purple-700
              text-xs font-medium
              transition-colors
            "
          >
            {isAdjusting ? 'done' : 'adjust'}
          </button>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 self-stretch" />

        {/* ── Column 2: Filters ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm mb-1">Filters</p>

          {/* Location chip — shows the postal code of the current search area */}
          <div className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded-full px-2 py-0.5 mb-2">
            <span className="text-gray-500 text-[10px]">Location</span>
            <span className="text-gray-800 font-semibold text-[10px]">{locationCode}</span>
          </div>

          {/* Distance range slider (0–10 km) */}
          <div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={radiusKm}
              onChange={e => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
              aria-label="Search radius in km"
            />
            {/* Show current value below the slider */}
            <p className="text-gray-500 text-[10px] text-right">{radiusKm} km</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 self-stretch" />

        {/* ── Column 3: Showing ───────────────────────────────────────────── */}
        {/*
          * A read-only summary of active tag filters.
          * "SHOWING" is the plain-english answer to "what are we filtering by?"
          */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wide mb-1">
            Showing
          </p>

          {/* Active filter tag names */}
          <ul className="space-y-0.5">
            {activeTagFilters.map(tag => (
              <li key={tag} className="text-gray-600 leading-snug truncate">
                {TAG_LABELS[tag] ?? tag}
              </li>
            ))}
          </ul>

          {/* Include unconfirmed checkbox */}
          <label className="flex items-center gap-1 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUnconfirmed}
              onChange={e => setIncludeUnconfirmed(e.target.checked)}
              className="accent-purple-500 w-3 h-3"
            />
            <span className="text-gray-500 text-[10px] leading-tight">
              Include unconfirmed
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
