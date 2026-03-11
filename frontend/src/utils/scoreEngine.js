/**
 * scoreEngine.js — Crew Compatibility Score Calculator
 *
 * ── What is the Compatibility Score? ─────────────────────────────────────────
 * A number from 0.0 to 10.0 that answers: "How well does this place serve
 * THIS specific crew right now?"
 *
 * It is NOT a general star rating (that's the public 4.1★ shown separately).
 * It is personalised: the same café might score 9.2 for a family with infants
 * and only 5.0 for a crew of adults with no young children.
 *
 * ── How It's Calculated ───────────────────────────────────────────────────────
 * 1.  Each crew group (infants, toddlers) has specific *needs*.
 * 2.  Each venue *tag* satisfies one or more of those needs to a given degree.
 * 3.  We sum up the "value" of every satisfied need, divide by the maximum
 *     possible value, and scale the result to 10.0.
 *
 * Example:
 *   Crew:  { adults: 1, toddlers: 2, infants: 0 }
 *   Tags:  ['high_chairs', 'play_area']
 *
 *   Toddler needs:          high_chairs (2.5) + play_area (3.0) = 5.5 possible
 *   Satisfied toddler tags: high_chairs (2.5) + play_area (3.0) = 5.5 earned
 *   Score: (5.5 / 5.5) × 10 = 10.0  ✓ perfect match
 *
 * ── Tag-to-Crew-Need Weights ──────────────────────────────────────────────────
 * Each key is a venue tag.  Each nested value is how much that tag "matters"
 * to that crew type.  Higher = more critical need.
 * Tags that don't apply to a crew type are omitted (treated as 0).
 */
const TAG_WEIGHTS = {
  //                         infants  toddlers
  stroller_friendly: { infants: 3.0, toddlers: 2.0 },
  changing_table:    { infants: 3.0, toddlers: 1.5 },
  play_area:         { infants: 0.5, toddlers: 3.0 },
  high_chairs:       { infants: 1.5, toddlers: 2.5 },
  unisex_baby_duty:  { infants: 2.5, toddlers: 1.0 },
}

/**
 * calculateCompatibilityScore
 *
 * @param {Object} crew        - { adults: number, toddlers: number, infants: number }
 * @param {string[]} placeTags - Array of tag keys the venue has been verified to offer.
 *                               e.g. ['stroller_friendly', 'high_chairs']
 * @returns {number}           - Compatibility score from 0.0 to 10.0 (one decimal)
 */
export function calculateCompatibilityScore(crew, placeTags) {
  // Build a quick lookup set so we can check "does this place have tag X?" in O(1)
  const tagSet = new Set(placeTags)

  let earned = 0   // points for needs that ARE met by the venue
  let possible = 0  // total points IF every need were met (the ceiling)

  // The crew groups that drive child-specific needs
  const crewGroups = [
    { type: 'infants',  count: crew.infants  },
    { type: 'toddlers', count: crew.toddlers },
  ]

  crewGroups.forEach(({ type, count }) => {
    // If this crew type isn't present, their needs don't factor into the score
    if (count === 0) return

    Object.entries(TAG_WEIGHTS).forEach(([tag, weights]) => {
      const weight = weights[type] ?? 0
      if (weight === 0) return // this tag doesn't matter to this crew type

      // Every present crew member adds this need to the "possible" pool
      possible += weight

      // If the venue has this tag, the need is satisfied — add to earned
      if (tagSet.has(tag)) earned += weight
    })
  })

  // Edge case: adults-only crew — return a neutral score (5.0) because no
  // child-specific needs exist so there is nothing to score against.
  if (possible === 0) return 5.0

  // Scale to 0.0–10.0 and round to one decimal
  return Math.round((earned / possible) * 10 * 10) / 10
}

/**
 * scoreToColor
 *
 * Maps a compatibility score to a Tailwind background + text class pair
 * used to visually signal match quality on suggestion cards.
 *
 * ≥ 7.5  →  dark blue  (great match)
 * ≥ 5.5  →  sky blue   (decent match)
 *  < 5.5  →  white      (weak match)
 *
 * @param {number} score
 * @returns {{ bg: string, text: string }}
 */
export function scoreToColorClasses(score) {
  if (score >= 7.5) return { bg: 'bg-blue-600',  text: 'text-white' }
  if (score >= 5.5) return { bg: 'bg-sky-300',   text: 'text-gray-900' }
  return               { bg: 'bg-white',      text: 'text-gray-800' }
}
