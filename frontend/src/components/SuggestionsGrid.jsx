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
 * ── Star / Favorite toggle ────────────────────────────────────────────────────
 * A ☆/★ button sits in the top-right corner next to the distance label.
 * Tapping it calls `toggleFavorite` from FavoritesContext without triggering
 * the card's `onSelect` (stopPropagation).  Filled ★ = text-yellow-300.
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
 * @prop {Object[]} suggestions   - Array of venue objects (same shape as `place` in MainInfoCard)
 * @prop {Function} onSelectPlace - Called with a place id when the user taps a card.
 *                                  Lifts selection up to SearchResultPage so the hero
 *                                  and info card update to show the chosen venue.
 */

import { useCrew }                                     from '../context/CrewContext'
import { useFavorites }                                from '../context/FavoritesContext'
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
 *
 * Clicking anywhere on the card calls `onSelect`, which updates `activePlaceId`
 * in SearchResultPage and swaps the hero map pin, photo grid, and info card.
 * `cursor-pointer` and a hover ring give users a clear affordance that the
 * entire card is a tap target.
 */
function SuggestionCard({ place, onSelect }) {
  const { crew } = useCrew()
  const { favorites, toggleFavorite } = useFavorites()
  const score = calculateCompatibilityScore(crew, place.tags)
  const { bg, text } = scoreToColorClasses(score)

  // Border colour: white-bg cards get a visible border so they don't float
  const borderClass = bg === 'bg-white' ? 'border border-gray-200' : ''
  const isFavorited = favorites.has(place.id)

  return (
    <button
      onClick={() => onSelect(place.id)}
      /*
       * `w-full text-left` makes the <button> fill its grid cell and keeps
       * text alignment consistent with the old <div> layout.
       * The ring on focus-visible provides keyboard accessibility.
       */
      className={`
        w-full text-left
        rounded-2xl p-3 shadow-sm
        flex flex-col gap-1
        cursor-pointer
        hover:ring-2 hover:ring-purple-400 hover:ring-offset-1
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
        transition-shadow
        ${bg} ${text} ${borderClass}
      `}
    >

      {/* ── Top row: Name + Distance + Star ─────────────────────────────── */}
      <div className="flex justify-between items-start gap-1">
        <p className="font-bold text-sm leading-tight line-clamp-1">{place.name}</p>

        {/* Distance + favorite star grouped at top-right */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Slightly larger than xs so it reads at a glance */}
          <span className="text-sm font-semibold opacity-80">{place.distance} km</span>

          {/*
           * Star toggle — stopPropagation prevents the card's onSelect from
           * firing when the user only wants to save the place, not navigate to it.
           * Padding + negative margin keeps the visual size tight while
           * expanding the tap surface to ~32×32 px for comfortable thumb use.
           */}
          <button
            onClick={e => { e.stopPropagation(); toggleFavorite(place.id) }}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className="p-1.5 -m-1.5 leading-none focus-visible:outline-none"
          >
            {isFavorited
              ? <span className="text-yellow-300 text-lg">★</span>
              : <span className="text-lg opacity-60">☆</span>
            }
          </button>
        </div>
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
    </button>
  )
}

/**
 * SuggestionsGrid — the 2-column container.
 *
 * `grid-cols-2` creates the two-column layout.
 * `gap-2` gives each card breathing room.
 */
function SuggestionsGrid({ suggestions, onSelectPlace }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <p className="mx-3 mt-3 text-gray-400 text-sm text-center py-4">
        No nearby venues match your filters.
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
          <SuggestionCard
            key={place.id}
            place={place}
            onSelect={onSelectPlace}
          />
        ))}
      </div>
    </div>
  )
}

export default SuggestionsGrid
