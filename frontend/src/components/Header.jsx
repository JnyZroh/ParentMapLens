/**
 * Header.jsx
 *
 * A top navigation bar that displays the app name and an API status badge.
 *
 * ── The Status Badge ─────────────────────────────────────────────────────────
 * When the component first loads it calls GET /api/status on the FastAPI
 * backend.  Based on the response you will see one of three states:
 *
 *   🟡 Yellow dot  "API: checking"
 *      The fetch is still in flight.  You see this for a fraction of a second
 *      on first load while the browser waits for the backend to respond.
 *
 *   🟢 Green dot   "API: online"
 *      The backend responded with HTTP 200 and the JSON  { "status": "ok" }.
 *      Everything is working.  The map data calls in Phase 3 will succeed.
 *
 *   🔴 Red dot     "API: offline"
 *      The fetch failed (network error) or the server returned an error code.
 *      Most likely cause: you haven't started the backend yet.
 *      Fix: open a terminal, cd backend, run  uvicorn main:app --reload
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'

function Header() {
  // `apiStatus` will be 'checking', 'online', or 'offline'
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    // Hit the FastAPI status endpoint.  Vite proxies /api → http://localhost:8000
    fetch('/api/status')
      .then((res) => {
        if (res.ok) setApiStatus('online')
        else setApiStatus('offline')
      })
      .catch(() => setApiStatus('offline'))
  }, []) // Empty dependency array → runs once on mount

  // Pick a Tailwind colour class based on the current status
  const statusColour =
    apiStatus === 'online'
      ? 'bg-green-500'
      : apiStatus === 'offline'
        ? 'bg-red-500'
        : 'bg-yellow-400'

  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur shadow-md">
      {/* App name */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🗺️</span>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">
          Anywhere Parent
        </h1>
      </div>

      {/* Backend health badge */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${statusColour}`}
          title={`API is ${apiStatus}`}
        />
        <span className="capitalize">API: {apiStatus}</span>
      </div>
    </header>
  )
}

export default Header
