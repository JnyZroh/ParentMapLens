/**
 * FilterBar.jsx
 *
 * The horizontal control strip below the MainInfoCard.  Three sections:
 *
 *  ┌─────────────┬───────────────────┬──────────────────────────┐
 *  │    CREW     │     FILTERS       │        SHOWING           │
 *  │  1 adult    │  Location H4G 1V4 │  × stroller-friendly     │
 *  │  2 toddlers │  ──●────── 3km    │  × diaper changing       │
 *  │  1 infant   │                   │  × play area             │
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
 * `radiusKm` and `onRadiusChange` are now props (lifted to SearchResultPage)
 * so slider changes immediately affect the SuggestionsGrid.
 *
 * ── SHOWING section ───────────────────────────────────────────────────────────
 * Active tag filters are now props (`activeTagFilters` + `onTagToggle`).
 * Each tag renders as a small button with a × so parents can remove tags
 * on the fly; the grid updates instantly.
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 * @prop {string}   locationCode      - Current search area postal code, e.g. "H4G 1V4"
 * @prop {number}   radiusKm          - Current slider value (km), owned by SearchResultPage
 * @prop {Function} onRadiusChange    - Called with the new number when slider moves
 * @prop {string[]} activeTagFilters  - Tag keys currently filtering the results
 * @prop {Function} onTagToggle       - Called with a tag key to add or remove it
 */

import { useState, useRef, useEffect } from 'react'
import { useCrew }                     from '../context/CrewContext'

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
  stroller_friendly: 'Stroller-friendly',
  changing_table:    'Changing tables',
  play_area:         'Play area',
  high_chairs:       'High chairs',
  unisex_baby_duty:  'Unisex baby duty',
}

// ── All available tags sorted alphabetically by display label ─────────────────
// This drives the "more tags" dropdown so new tags appear in a predictable order.
const ALL_TAGS_SORTED = Object.entries(TAG_LABELS)
  .sort(([, a], [, b]) => a.localeCompare(b))
  // → [['changing_table','Changing tables'], ['high_chairs','High chairs'], …]

function FilterBar({
  locationCode     = 'H4G 1V4',
  radiusKm         = 3,
  onRadiusChange   = () => {},
  activeTagFilters = [],
  onTagToggle      = () => {},
}) {
  // Pull crew state + adjust controls from global context
  const { crew, adjustCrew, isAdjusting, setIsAdjusting } = useCrew()

  // Include unconfirmed reports toggle — local state (doesn't affect filtering yet)
  const [includeUnconfirmed, setIncludeUnconfirmed] = useState(true)

  // ── "More tags" dropdown state ─────────────────────────────────────────────
  const [showMoreTags, setShowMoreTags]   = useState(false)
  const [tagSearch,    setTagSearch]      = useState('')
  const dropdownRef                       = useRef(null)

  // Close the dropdown when the user clicks anywhere outside of it
  useEffect(() => {
    if (!showMoreTags) return
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMoreTags(false)
        setTagSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showMoreTags])

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

          {/* Distance range slider — now a controlled prop, not local state */}
          <div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={radiusKm}
              onChange={e => onRadiusChange(parseFloat(e.target.value))}
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
          * Each active filter is a small button with a × remove action.
          * Clicking × calls onTagToggle(tag), which removes it from
          * activeTagFilters in SearchResultPage and instantly updates the grid.
          */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wide mb-1">
            Showing
          </p>

          {/* Active filter chips — each one is removable */}
          <ul className="space-y-1">
            {activeTagFilters.length === 0 && (
              <li className="text-gray-400 text-[10px] italic">All venues</li>
            )}
            {activeTagFilters.map(tag => (
              <li key={tag}>
                <button
                  onClick={() => onTagToggle(tag)}
                  /*
                   * The entire chip is a button so the × is easy to tap on mobile.
                   * `group` lets the × icon brighten on hover without a separate
                   * hover handler.
                   */
                  className="
                    group
                    inline-flex items-center gap-1
                    bg-purple-100 hover:bg-purple-200
                    text-purple-800
                    rounded-full px-2 py-0.5
                    text-[10px] font-medium
                    transition-colors
                    cursor-pointer
                    max-w-full
                  "
                  aria-label={`Remove filter: ${TAG_LABELS[tag] ?? tag}`}
                  title="Click to remove this filter"
                >
                  <span className="truncate">{TAG_LABELS[tag] ?? tag}</span>
                  {/* × remove indicator */}
                  <span className="shrink-0 opacity-50 group-hover:opacity-100 font-bold leading-none">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* ── "More tags" button + dropdown ─────────────────────────────── */}
          {/*
           * `relative` on the wrapper makes the dropdown position itself
           * relative to this element rather than the page.
           * `ref` lets the outside-click handler know what's "inside."
           */}
          <div className="relative mt-2" ref={dropdownRef}>
            <button
              onClick={() => { setShowMoreTags(v => !v); setTagSearch('') }}
              className="
                text-[10px] font-medium
                text-purple-700 underline underline-offset-2
                hover:text-purple-900
                transition-colors
              "
            >
              more tags
            </button>

            {showMoreTags && (
              /*
               * Dropdown panel — floats above the rest of the page via z-10.
               * `left-0 top-full` anchors it just below the "more tags" button.
               * min-w-[160px] ensures the panel is readable even in the narrow
               * SHOWING column.
               */
              <div className="
                absolute left-0 top-full mt-1 z-10
                min-w-[160px]
                bg-white border border-gray-200 rounded-xl shadow-lg
                p-2
              ">
                {/* Search input to narrow the tag list */}
                <input
                  type="text"
                  placeholder="Search tags…"
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  autoFocus
                  className="
                    w-full text-[10px] px-2 py-1
                    border border-gray-200 rounded-lg
                    focus:outline-none focus:border-purple-400
                    mb-1.5
                  "
                />

                {/* Alphabetized tag list, filtered by the search input */}
                <ul className="space-y-0.5 max-h-40 overflow-y-auto">
                  {ALL_TAGS_SORTED
                    .filter(([, label]) =>
                      label.toLowerCase().includes(tagSearch.toLowerCase())
                    )
                    .map(([key, label]) => (
                      <li key={key}>
                        <button
                          onClick={() => onTagToggle(key)}
                          className={`
                            w-full text-left text-[10px] px-2 py-1 rounded-lg
                            flex items-center gap-1.5
                            transition-colors
                            ${activeTagFilters.includes(key)
                              ? 'bg-purple-100 text-purple-800 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          {/* Checkmark when the tag is already active */}
                          <span className="w-3 shrink-0">
                            {activeTagFilters.includes(key) ? '✓' : ''}
                          </span>
                          {label}
                        </button>
                      </li>
                    ))
                  }
                </ul>
              </div>
            )}
          </div>

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
