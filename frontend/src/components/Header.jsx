/**
 * Header.jsx
 *
 * A simple top navigation bar that displays the app name and a health-check
 * status badge.
 *
 * WHY fetch the health check here?
 *   Showing backend status in the UI immediately tells developers (and users)
 *   whether the FastAPI server is running.  It's a fast feedback loop during
 *   development and a useful status indicator in production.
 */

import { useEffect, useState } from 'react'

function Header() {
  // `apiStatus` will be 'checking', 'online', or 'offline'
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    // Hit the FastAPI health endpoint.  Vite proxies /api → http://localhost:8000
    fetch('/api/health')
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
