import { useEffect, useState } from 'react'

/**
 * Automatic version checker and cache buster
 * Shows notification when new version is available
 */
export default function VersionChecker() {
  const [showUpdate, setShowUpdate] = useState(false)
  const APP_VERSION = '3.0.0' // Increment this when you make changes

  useEffect(() => {
    const checkVersion = () => {
      const storedVersion = localStorage.getItem('app_version')
      
      if (storedVersion && storedVersion !== APP_VERSION) {
        setShowUpdate(true)
      } else if (!storedVersion) {
        localStorage.setItem('app_version', APP_VERSION)
      }
    }

    checkVersion()

    // Check every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdate = async () => {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(reg => reg.unregister()))
      }

      // Update version
      localStorage.setItem('app_version', APP_VERSION)

      // Reload page
      window.location.reload(true)
    } catch (error) {
      console.error('Error updating:', error)
      // Force reload anyway
      window.location.reload(true)
    }
  }

  if (!showUpdate) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      backgroundColor: '#4F46E5',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      maxWidth: '320px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <button
        onClick={() => setShowUpdate(false)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          lineHeight: '20px'
        }}
        title="Dismiss"
      >
        ×
      </button>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', paddingRight: '20px' }}>
        🎉 New Version Available!
      </div>
      <div style={{ fontSize: '14px', marginBottom: '15px' }}>
        Notes feature, voice recording, and dual-language AI are now available. Update to get the latest features!
      </div>
      <button
        onClick={handleUpdate}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: 'white',
          color: '#4F46E5',
          border: 'none',
          borderRadius: '5px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Update Now
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
