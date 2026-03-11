/**
 * SuggestionsGrid.jsx
 *
 * A 2-column grid of "Nearby" venue suggestion cards, shown below the FilterBar.
 *
 * ── What a card shows ─────────────────────────────────────────────────────────
 *
 *   ┌──────────────────────┐
 *   │  Venue Name    1.4km │  ← distance top-right
 *   │  Address             │
 *   │  ◇ ○ □ ◇            │  ← tag icons (outline = unconfirmed)
 *   │                  6.0 │  ← crew compatibility score bottom-right
 *   └──────────────────────┘
 *
 * ── Card background colour ────────────────────────────────────────────────────
 * The card's background reflects match quality at a glance:
 *   ≥ 7.5  →  dark blue   (great match for your crew)
 *   ≥ 5.5  →  sky blue    (decent match)
 *   < 5.5  →  white       (weak match, but still nearby)
 *
 * ── Tag icons ─────────────────────────────────────────────────────────────────
 * Suggestion cards use outline shapes (◇ ○ □) instead of filled (◆ ● ■).
 * Outline = the tag has been *reported* but not yet fully verified.
 * This matches the "Include unconfirmed" filter in the FilterBar.
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 * @prop {Object[]} suggestions - Array of venue objects (same shape as `place` in MainInfoCard)
 */

import { useCrew }                                     from '../context/CrewContext'
import { calculateCompatibilityScore, scoreToColorClasses } from '../utils/scoreEngine'

// ── Tag shape metadata (outline versions for suggestion cards) ────────────────
const TAG_SHAPES_OUTLINE = {
  stroller_friendly: '◇',
  changing_table:    '○',
  play_area:         '□',
  high_chairs:       '◇',
  unisex_baby_duty:  '◇',
}

/**
 * TagIconRow — a small horizontal row of shape icons representing a venue's tags.
 * Used inside suggestion cards where space is tight.
 */
function TagIconRow({ tags, textClass }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.map(tag => (
        <span
          key={tag}
          className={`text-base leading-none ${textClass}`}
          title={tag.replace(/_/g, ' ')}
        >
          {TAG_SHAPES_OUTLINE[tag] ?? '◇'}
        </span>
      ))}
    </div>
  )
}

/**
 * SuggestionCard — a single nearby venue tile.
 */
function SuggestionCard({ place }) {
  const { crew } = useCrew()
  const score = calculateCompatibilityScore(crew, place.tags)
  const { bg, text } = scoreToColorClasses(score)

  // Border colour: white-bg cards get a visible border so they don't float
  const borderClass = bg === 'bg-white' ? 'border border-gray-200' : ''

  return (
    <div className={`rounded-2xl p-3 shadow-sm flex flex-col gap-1 ${bg} ${text} ${borderClass}`}>

      {/* ── Top row: Name + Distance ────────────────────────────────────── */}
      <div className="flex justify-between items-start gap-1">
        <p className="font-bold text-sm leading-tight line-clamp-1">{place.name}</p>
        <span className="text-xs font-semibold shrink-0 opacity-80">{place.distance} km</span>
      </div>

      {/* Address */}
      <p className="text-xs opacity-70 leading-snug line-clamp-1">{place.address}</p>

      {/* Tag icons */}
      <TagIconRow tags={place.tags} textClass={bg === 'bg-white' ? 'text-gray-400' : 'text-white/70'} />

      {/* ── Bottom row: Compatibility Score ─────────────────────────────── */}
      <div className="flex justify-end mt-auto pt-1">
        <span className="font-extrabold text-lg leading-none">
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

/**
 * SuggestionsGrid — the 2-column container.
 *
 * `grid-cols-2` creates the two-column layout.
 * `gap-2` gives each card breathing room.
 */
function SuggestionsGrid({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <p className="mx-3 mt-3 text-gray-400 text-sm text-center py-4">
        No nearby venues found.
      </p>
    )
  }

  return (
    <div className="mx-3 mt-3">
      {/* Section heading */}
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
        Nearby
      </p>

      {/* 2-column card grid */}
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map(place => (
          <SuggestionCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  )
}

export default SuggestionsGrid
