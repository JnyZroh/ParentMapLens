/**
 * CrewContext.jsx — Global Crew State
 *
 * ── What is the "Crew"? ───────────────────────────────────────────────────────
 * The "Crew" is the group of people the parent is going out with right now.
 * It is the key input to the Compatibility Score engine: different crew
 * compositions produce different scores for the same venue.
 *
 * State shape:
 *   {
 *     adults:   number,   // people who don't need child-specific amenities
 *     toddlers: number,   // roughly 1–4 years old; need high chairs, play area
 *     infants:  number,   // under 1 year; need changing tables, baby duty spaces
 *   }
 *
 * ── Why a Context? ────────────────────────────────────────────────────────────
 * Multiple components (MainInfoCard, FilterBar, SuggestionsGrid) all need to
 * read the current Crew.  Rather than passing it as props through every level,
 * we store it in a React Context so any component can pull it directly.
 *
 * ── Default Values ────────────────────────────────────────────────────────────
 * In a real app these would load from the user's saved profile (Phase 4+).
 * For now we hard-code a typical family as the default.
 *
 * HOW TO READ THE CREW IN A COMPONENT:
 *   import { useCrew } from '../context/CrewContext'
 *   const { crew, setCrew } = useCrew()
 */

import { createContext, useContext, useState } from 'react'

// ── Context creation ──────────────────────────────────────────────────────────
// createContext sets up the "pipe" — an empty object is just the initial default
// before the Provider sets the real value.
const CrewContext = createContext({})

// ── Default crew (simulates a loaded user profile) ────────────────────────────
const DEFAULT_CREW = {
  adults:   1,
  toddlers: 2,
  infants:  1,
}

/**
 * CrewProvider
 *
 * Wrap the root of your app (or the SearchResultPage) with this component.
 * Every descendant will then be able to call useCrew() to read and update
 * the current crew without prop drilling.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function CrewProvider({ children }) {
  // `crew` holds the current counts; `setCrew` lets any component update them
  const [crew, setCrew] = useState(DEFAULT_CREW)

  // `isAdjusting` toggles the inline crew editor open/closed in the FilterBar
  const [isAdjusting, setIsAdjusting] = useState(false)

  /**
   * adjustCrew — safely increments or decrements a single crew-type count.
   *
   * @param {'adults'|'toddlers'|'infants'} type  - which group to change
   * @param {1|-1} delta                          - +1 to add, -1 to remove
   */
  function adjustCrew(type, delta) {
    setCrew(prev => ({
      ...prev,
      // Math.max(0, ...) prevents counts from going negative
      [type]: Math.max(0, prev[type] + delta),
    }))
  }

  return (
    <CrewContext.Provider value={{ crew, setCrew, adjustCrew, isAdjusting, setIsAdjusting }}>
      {children}
    </CrewContext.Provider>
  )
}

/**
 * useCrew — convenience hook so components don't import CrewContext directly.
 *
 * Usage:
 *   const { crew, adjustCrew, isAdjusting, setIsAdjusting } = useCrew()
 */
export function useCrew() {
  return useContext(CrewContext)
}
