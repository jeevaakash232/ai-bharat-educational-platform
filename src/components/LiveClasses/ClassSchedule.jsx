import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE_URL } from '../../config'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Play,
  Plus,
  Search,
  ArrowLeft,
  Upload,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'

const RecordedClasses = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recordings, setRecordings] = useState([])
  const [filter, setFilter] = useState('all') // all, my-uploads, favorites
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetchTime, setLastFetchTime] = useState(null)
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Initial load
    loadRecordings()
    
    // Set up auto-refresh every 15 seconds
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing videos...')
      loadRecordings(true) // Silent refresh (no loading state)
    }, 15000) // 15 seconds
    
    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [user, navigate])

  // Reload when filter changes
  useEffect(() => {
    if (user) {
      loadRecordings()
    }
  }, [filter])

  const loadRecordings = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    setError(null)
    
    try {
      console.log('📡 Fetching videos from backend API...')
      console.log('🔗 API URL:', `${API_BASE_URL}/api/videos`)
      
      const response = await fetch(`${API_BASE_URL}/api/videos`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const videos = await response.json()
      console.log('✅ Received videos from API:', videos)
      console.log('📊 Total videos:', videos.length)
      
      // Transform S3 video data to match our recording format
      const transformedRecordings = videos.map(video => ({
        id: video.key,
        key: video.key,
        title: video.metadata?.title || video.name || 'Untitled Video',
        description: video.metadata?.description || '',
        subject: video.metadata?.subject || 'General',
        class: video.metadata?.class || 'N/A',
        state: video.metadata?.state || 'All States',
        medium: video.metadata?.medium || 'both',
        language: video.metadata?.language || 'English',
        topic: video.metadata?.topic || '',
        chapter: video.metadata?.chapter || '',
        term: video.metadata?.term || '',
        teacherName: video.metadata?.uploadedBy || 'Unknown Teacher',
        teacherId: video.metadata?.uploadedBy || 'unknown',
        uploadedAt: video.lastModified || new Date().toISOString(),
        duration: parseInt(video.metadata?.duration) || 0,
        views: 0,
        size: video.size,
        url: video.url
      }))
      
      console.log('🔄 Transformed recordings:', transformedRecordings)
      
      // Apply filter
      let filteredRecordings = transformedRecordings
      
      if (filter === 'my-uploads' && user.userType === 'teacher') {
        filteredRecordings = transformedRecordings.filter(rec => 
          rec.teacherId === user.email || rec.teacherId === user.id
        )
        console.log(`🔍 Filtered to my uploads (${user.email}):`, filteredRecordings.length)
      }
      
      setRecordings(filteredRecordings)
      setLastFetchTime(new Date())
      
      if (!silent) {
        console.log('✅ Videos loaded successfully!')
      }
    } catch (error) {
      console.error('❌ Error loading recordings:', error)
      setError(error.message)
      // Don't clear recordings on error, keep showing old data
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    loadRecordings()
  }

  const watchRecording = (recordingId) => {
    console.log('🎬 Navigating to video:', recordingId)
    // Encode the recording ID to handle special characters like slashes
    const encodedId = encodeURIComponent(recordingId)
    navigate(`/watch-recording/${encodedId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredRecordings = recordings.filter(rec => 
    rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Video className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-800">Recorded Classes</h1>
                  <p className="text-xs md:text-sm text-gray-600">
                    {recordings.length} video{recordings.length !== 1 ? 's' : ''} available
                    {lastFetchTime && (
                      <span className="ml-2 text-gray-400">
                        • Updated {new Date(lastFetchTime).toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh videos"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
              {user.userType === 'teacher' && (
                <Link
                  to="/upload-recording"
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden md:inline">Upload Recording</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Videos</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={handleManualRefresh}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        {!loading && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-700 text-sm">
                <RefreshCw className="h-4 w-4" />
                <span>Auto-refreshing every 15 seconds • Videos update automatically</span>
              </div>
              {lastFetchTime && (
                <span className="text-blue-600 text-xs">
                  Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Filter tabs */}
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Recordings
            </button>
            {user.userType === 'teacher' && (
              <button
                onClick={() => setFilter('my-uploads')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'my-uploads'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Uploads
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Recording list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading recordings from S3...</p>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No matching recordings found' : 'No recordings found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : filter === 'my-uploads' 
                  ? 'You haven\'t uploaded any recordings yet' 
                  : 'No recorded classes available yet'}
            </p>
            {user.userType === 'teacher' && !searchTerm && (
              <Link
                to="/upload-recording"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload First Recording</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map(recording => {
              console.log('🎬 Rendering video card:', recording.title, recording.key)
              return (
                <div key={recording.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                    {recording.thumbnail ? (
                      <img 
                        src={recording.thumbnail} 
                        alt={recording.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Duration overlay */}
                    {recording.duration > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(recording.duration)}
                      </div>
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-8 w-8 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Recording info */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{recording.title}</h3>
                    {recording.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{recording.teacherName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(recording.uploadedAt)}</span>
                      </div>
                      {recording.size && (
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>{formatFileSize(recording.size)}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject and class badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {recording.subject}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        Class {recording.class}
                      </span>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => watchRecording(recording.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      <span>Watch Recording</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default RecordedClasses
