/**
 * SearchBar.jsx
 *
 * The top navigation strip: a text input for searching venues plus a
 * circular profile button in the top-right corner.
 *
 * ── Props ─────────────────────────────────────────────────────────────────────
 * @prop {string}   value       - Controlled input value (the current search text)
 * @prop {Function} onChange    - Called with the new string when the user types
 * @prop {Function} onSearch    - Called when the user presses Enter or the icon
 *
 * ── Design Notes ──────────────────────────────────────────────────────────────
 * - Purple border on the search input matches the wireframe accent colour.
 * - The profile circle sits to the right, slightly above the input.
 * - On mobile the bar spans full width; on desktop it's constrained by the
 *   parent page's max-width wrapper.
 */

import { useState } from 'react'

/**
 * Small magnifying-glass SVG icon displayed inside the search input.
 * Inline SVG avoids needing an icon library dependency.
 */
function SearchIcon() {
  return (
    <svg
      className="w-5 h-5 text-purple-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function SearchBar({ value, onChange, onSearch }) {
  // Handle Enter key press to trigger search
  function handleKeyDown(e) {
    if (e.key === 'Enter' && onSearch) onSearch(value)
  }

  return (
    /*
     * Outer row: search bar on the left, profile button on the right.
     * `items-center` vertically centres both elements in the row.
     */
    <div className="flex items-center gap-3 px-3 py-3 bg-white">

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        {/*
          * `relative` on the wrapper + `absolute` on the icon lets us
          * position the icon inside the input without affecting layout.
          */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="search"
          className="
            w-full
            rounded-full
            border-2 border-purple-500
            px-4 py-2 pr-10
            text-gray-700 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-purple-300
            text-base
          "
        />
        {/* Search icon — positioned inside the right side of the input */}
        <button
          onClick={() => onSearch && onSearch(value)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>

      {/* ── Profile Button ───────────────────────────────────────────────── */}
      {/*
        * A circular button that will eventually open the user profile/settings.
        * The initials "P" are a placeholder for a profile photo.
        * `shrink-0` prevents the circle from squishing when the input is long.
        */}
      <button
        className="
          shrink-0
          w-10 h-10
          rounded-full
          bg-gray-200 border-2 border-gray-300
          flex items-center justify-center
          text-gray-600 text-sm font-semibold
          hover:bg-purple-100 hover:border-purple-400
          transition-colors
        "
        aria-label="Profile"
      >
        P
      </button>
    </div>
  )
}

export default SearchBar
