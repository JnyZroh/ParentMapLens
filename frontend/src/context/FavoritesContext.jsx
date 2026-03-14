/**
 * FavoritesContext.jsx
 *
 * Tracks which venues the user has starred as favorites.
 *
 * ── What it stores ────────────────────────────────────────────────────────────
 * `favorites` is a Set of place IDs (strings/numbers). Using a Set means
 * "is this place favorited?" checks are O(1) and we never get duplicates.
 *
 * ── Why a context? ────────────────────────────────────────────────────────────
 * The star toggle appears on SuggestionCard, which renders on both
 * HomeDashboard and SearchResultPage. A shared context means a star tapped
 * on one page is still filled when you navigate to the other.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * const { favorites, toggleFavorite } = useFavorites()
 * favorites.has(place.id)   // → boolean
 * toggleFavorite(place.id)  // → adds if absent, removes if present
 */

import { createContext, useContext, useState } from 'react'

const FavoritesContext = createContext(null)

/**
 * FavoritesProvider — wrap the app (or any subtree) to give children
 * access to the favorites Set and the toggle function.
 */
export function FavoritesProvider({ children }) {
  // We store a Set inside state. Because Sets are mutable, we spread into
  // a new Set on every toggle so React detects the state change and re-renders.
  const [favorites, setFavorites] = useState(new Set())

  function toggleFavorite(id) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

/** Convenience hook — throws if used outside FavoritesProvider. */
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return ctx
}
