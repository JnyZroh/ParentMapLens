/**
 * MainInfoCard.jsx
 *
 * The primary venue information card.  Mirrors the large blue card in the
 * wireframe with a purple border and the "7.8" compatibility badge.
 *
 * ── What's in the card? ───────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────── ── ─ ┐
 *   │  Venue Name                      4.1 ★  │  ← public rating (out of 5)
 *   │  Address, postal code            1.1 km  │
 *   │                                          │
 *   │  🛒 Stroller-friendly spaces             │  ← filled = confirmed
 *   │  🍼 Diaper changing tables               │    outline = unconfirmed
 *   │  🐴 Play area                         ╭────╮
 *   │  🪑 High chairs                       │7.8 │  ← crew compatibility (0–10)
 *   │  🚻 Unisex baby duty spaces           ╰────╯
 *   └──────────────────────────────────────────┘
 *
 * ── Confirmed vs. Unconfirmed ─────────────────────────────────────────────────
 * A venue is "confirmed" once a user has reviewed it and verified the tags are
 * still accurate.  Icons reflect this:
 *   FilledIcon  (place.confirmed = true)  — a user has vouched for these tags
 *   OutlineIcon (place.confirmed = false) — reported but not yet verified
 * This keeps parents informed about data freshness without cluttering the UI.
 *
 * ── Dual Ratings Explained ───────────────────────────────────────────────────
 * 1. Public Rating (★ 4.1 / 5.0)
 *    A general crowd-sourced star score — similar to Google Maps.
 *    Shows how much the average visitor enjoyed this place overall.
 *
 * 2. Crew Compatibility Score (7.8 / 10.0)
 *    Calculated in real-time by scoreEngine.js based on which tags the venue
 *    has AND which crew members are in your current session.
 *    This is the differentiator — it answers "is this right for MY crew TODAY?"
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 * @prop {Object} place - Venue data object.  Must include a `confirmed` boolean
 *                        (true = user-verified tags; false = unverified reports).
 */

import { useCrew }                     from '../context/CrewContext'
import { calculateCompatibilityScore } from '../utils/scoreEngine'
import { TAG_META }                    from '../utils/tagMeta'

/**
 * StarRating — renders "4.1 ★" with the star glyph coloured gold.
 */
function StarRating({ value }) {
  return (
    <span className="flex items-center gap-1 text-white font-bold text-lg">
      {value.toFixed(1)}
      <span className="text-yellow-300 text-xl">★</span>
    </span>
  )
}

/**
 * TagRow — a single amenity tag line with its SVG icon.
 * `confirmed` controls whether the filled or outline icon variant is rendered.
 * For tags whose FilledIcon === OutlineIcon (e.g. play_area / TbHorseToy),
 * the distinction is communicated via opacity instead of icon shape.
 */
function TagRow({ tagKey, confirmed }) {
  const meta = TAG_META[tagKey]
  if (!meta) return null
  // Pick the appropriate icon variant based on the venue's confirmation status
  const Icon = confirmed ? meta.FilledIcon : meta.OutlineIcon
  return (
    <li className="flex items-center gap-1.5 text-xs text-blue-100 min-w-0">
      <Icon
        className={`${meta.color} text-base shrink-0 ${!confirmed ? 'opacity-50' : ''}`}
        aria-hidden="true"
      />
      <span className="leading-snug">{meta.label}</span>
    </li>
  )
}

function MainInfoCard({ place }) {
  // Pull the current crew from global context — score recalculates automatically
  // whenever the crew changes (e.g., after pressing "Adjust").
  const { crew } = useCrew()

  const compatScore = calculateCompatibilityScore(crew, place.tags)

  return (
    /*
     * Card container:
     *   - bg-blue-600  →  the solid blue background from the wireframe
     *   - border-purple-500  →  the purple accent border
     *   - relative  →  needed so the score badge can be positioned absolutely
     *     inside the card on larger screens, or flow naturally on smaller ones.
     */
    <div className="relative mx-3 rounded-2xl bg-blue-600 border-2 border-purple-500 p-4 shadow-lg">

      {/* ── Top row: Name + Public Rating ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-white font-bold text-xl leading-tight">{place.name}</h2>
          <p className="text-blue-200 text-sm mt-0.5">{place.address}</p>
        </div>
        <div className="text-right shrink-0">
          <StarRating value={place.rating} />
          {/*
            * Distance is shown below the star rating, right-aligned.
            * This is purely informational for now; Phase 3 will compute it
            * dynamically from the user's GPS position.
            */}
          <p className="text-blue-200 text-sm mt-0.5">{place.distance} km</p>
        </div>
      </div>

      {/* ── Tag list + Compatibility Score ────────────────────────────────── */}
      {/*
        * `pr-20` (padding-right) reserves space for the score badge so the
        * tag list doesn't overlap it on narrow screens.
        */}
      {/*
        * `pr-20` reserves 80 px on the right so the tag grid never slides
        * under the absolutely-positioned score badge (w-16 + right-4 gap).
        * Inside that space we use a 2-column grid so tags read side-by-side
        * rather than in a single long list.
        */}
      <div className="mt-3 pr-20">
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          {place.tags.map(tag => (
            <TagRow key={tag} tagKey={tag} confirmed={place.confirmed} />
          ))}
        </ul>
      </div>

      {/* ── Crew Compatibility Score Badge ────────────────────────────────── */}
      {/*
        * Positioned absolutely in the bottom-right of the card.
        * The purple circle with the large score number is the central UI
        * differentiator of Anywhere Parent — it answers "is this right
        * for MY crew?" at a glance.
        *
        * `absolute bottom-4 right-4` anchors it to the card's bottom-right.
        * The parent card needs `relative` (set above) for this to work.
        */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center">
        <div className="
          w-16 h-16
          rounded-full
          bg-purple-600
          flex items-center justify-center
          shadow-md
          border-2 border-purple-300
        ">
          <span className="text-white font-extrabold text-xl leading-none">
            {compatScore.toFixed(1)}
          </span>
        </div>
        {/* Label under the badge so new users understand what the number means */}
        <span className="text-purple-200 text-[10px] mt-1 text-center leading-none">
          crew<br />match
        </span>
      </div>
    </div>
  )
}

export default MainInfoCard
