import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE_URL } from '../../config'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  Download,
  Share2,
  ThumbsUp,
  Eye,
  Calendar,
  User,
  Tag
} from 'lucide-react'

const VideoPlayer = () => {
  const params = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  
  // Extract recordingId from wildcard route
  const recordingId = params['*'] || location.pathname.split('/watch-recording/')[1]
  
  console.log('🎬 VideoPlayer - Recording ID:', recordingId)
  console.log('📍 VideoPlayer - Location:', location.pathname)
  console.log('🔍 VideoPlayer - Params:', params)
  
  const [recording, setRecording] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    console.log('🎯 VideoPlayer mounted')
    console.log('📍 Location:', location.pathname)
    console.log('🆔 Recording ID from params:', params['*'])
    console.log('🆔 Recording ID extracted:', recordingId)
    
    if (!user) {
      console.log('❌ No user, redirecting to login')
      navigate('/login')
      return
    }
    
    if (!recordingId) {
      console.error('❌ No recording ID found!')
      setError('No video ID provided')
      setLoading(false)
      return
    }
    
    loadRecording()
  }, [recordingId, user, navigate])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleEnded = () => setPlaying(false)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnded)
    }
  }, [recording])

  const loadRecording = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🎬 Loading video with ID:', recordingId)
      console.log('🔗 Decoded ID:', decodeURIComponent(recordingId))
      console.log('📍 Full location:', location.pathname)
      
      // Decode the recording ID (it might be URL encoded)
      const decodedId = decodeURIComponent(recordingId)
      
      console.log('🔍 Looking for video with key:', decodedId)
      
      // Fetch all videos to find metadata
      console.log('📡 Fetching video list from API...')
      const response = await fetch(`${API_BASE_URL}/api/videos`)
      
      if (!response.ok) {
        throw new Error(`Failed to load videos: ${response.status} ${response.statusText}`)
      }
      
      const allVideos = await response.json()
      console.log('✅ Received videos:', allVideos.length)
      console.log('📋 Available video keys:', allVideos.map(v => v.key).slice(0, 5))
      
      // Find the video by key (exact match or decoded match)
      const foundVideo = allVideos.find(video => 
        video.key === decodedId || 
        video.key === recordingId ||
        video.id === decodedId ||
        video.id === recordingId
      )
      
      console.log('🔍 Search results:')
      console.log('   Looking for:', decodedId)
      console.log('   Also trying:', recordingId)
      console.log('   Found video:', foundVideo ? foundVideo.title : 'NOT FOUND')
      
      if (!foundVideo) {
        console.error('❌ Video not found in list')
        console.error('Looking for:', decodedId)
        console.error('Available keys:', allVideos.map(v => v.key))
        throw new Error(`Video not found. Looking for: ${decodedId}`)
      }

      console.log('✅ Found video:', foundVideo.name)
      console.log('📹 Video key:', foundVideo.key)
      
      // Now fetch the presigned URL for streaming
      setLoadingUrl(true)
      console.log('🔗 Fetching presigned URL for:', foundVideo.key)
      
      // Use the full key path for the API call
      const encodedKey = encodeURIComponent(foundVideo.key)
      const urlResponse = await fetch(`${API_BASE_URL}/api/videos/${encodedKey}`)
      
      if (!urlResponse.ok) {
        const errorText = await urlResponse.text()
        console.error('❌ URL fetch failed:', errorText)
        throw new Error(`Failed to get video URL: ${urlResponse.status}`)
      }
      
      const urlData = await urlResponse.json()
      console.log('✅ Got presigned URL')
      
      // Validate the URL
      if (!urlData.url) {
        throw new Error('No video URL received from server')
      }
      
      console.log('🔗 Presigned URL received (valid for 1 hour)')
      
      // Transform video data to recording format
      const recordingData = {
        id: foundVideo.key,
        key: foundVideo.key,
        title: foundVideo.metadata?.title || foundVideo.name || 'Untitled Video',
        description: foundVideo.metadata?.description || '',
        subject: foundVideo.metadata?.subject || 'General',
        class: foundVideo.metadata?.class || 'N/A',
        state: foundVideo.metadata?.state || 'All States',
        medium: foundVideo.metadata?.medium || 'both',
        language: foundVideo.metadata?.language || 'English',
        topic: foundVideo.metadata?.topic || '',
        chapter: foundVideo.metadata?.chapter || '',
        term: foundVideo.metadata?.term || '',
        teacherName: foundVideo.metadata?.uploadedBy || 'Unknown Teacher',
        teacherId: foundVideo.metadata?.uploadedBy || 'unknown',
        uploadedAt: foundVideo.lastModified || new Date().toISOString(),
        duration: parseInt(foundVideo.metadata?.duration) || 0,
        views: 0,
        size: foundVideo.size,
        fileName: foundVideo.name,
        format: foundVideo.contentType || 'video/mp4',
        videoUrl: urlData.url, // Presigned S3 URL
        tags: foundVideo.metadata?.topic ? [foundVideo.metadata.topic] : []
      }
      
      setRecording(recordingData)
      console.log('✅ Video loaded successfully')
      console.log('🎬 Video ready to stream')
      
      // Set up URL refresh before it expires (refresh after 3.5 hours = 210 minutes)
      setTimeout(() => {
        console.log('🔄 Refreshing presigned URL...')
        refreshVideoUrl(foundVideo.key)
      }, 210 * 60 * 1000) // 210 minutes (3.5 hours)
      
    } catch (error) {
      console.error('❌ Error loading video:', error)
      setError(error.message || 'Failed to load video')
    } finally {
      setLoading(false)
      setLoadingUrl(false)
    }
  }

  const refreshVideoUrl = async (videoKey) => {
    try {
      console.log('🔄 Refreshing video URL for:', videoKey)
      const encodedKey = encodeURIComponent(videoKey)
      const urlResponse = await fetch(`${API_BASE_URL}/api/videos/${encodedKey}`)
      
      if (!urlResponse.ok) {
        throw new Error('Failed to refresh video URL')
      }
      
      const urlData = await urlResponse.json()
      
      if (urlData.url && recording) {
        setRecording(prev => ({
          ...prev,
          videoUrl: urlData.url
        }))
        console.log('✅ Video URL refreshed')
        
        // Schedule next refresh (3.5 hours)
        setTimeout(() => refreshVideoUrl(videoKey), 210 * 60 * 1000)
      }
    } catch (error) {
      console.error('❌ Error refreshing video URL:', error)
    }
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (playing) {
      video.pause()
    } else {
      video.play()
    }
    setPlaying(!playing)
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (muted) {
      video.volume = volume
      setMuted(false)
    } else {
      video.volume = 0
      setMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!fullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setFullscreen(!fullscreen)
  }

  const skip = (seconds) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changePlaybackRate = (rate) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const downloadVideo = async () => {
    try {
      console.log('📥 Downloading video:', recording.title)
      
      const response = await fetch(`${API_BASE_URL}/api/videos/${encodeURIComponent(recording.key)}/download`)
      if (!response.ok) throw new Error('Failed to get download URL')
      
      const data = await response.json()
      
      const link = document.createElement('a')
      link.href = data.url
      link.download = recording.fileName || `${recording.title}.mp4`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ Download started')
    } catch (error) {
      console.error('❌ Download error:', error)
      alert('Failed to download video: ' + error.message)
    }
  }

  const shareVideo = () => {
    if (navigator.share) {
      navigator.share({
        title: recording.title,
        text: recording.description,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!user) return null

  if (loading || loadingUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg mb-2">
            {loading ? 'Loading video...' : 'Fetching stream URL...'}
          </p>
          <p className="text-gray-400 text-sm">Please wait</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Video</h2>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadRecording}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/live-classes"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Videos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!recording) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Not Found</h2>
          <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
          <Link
            to="/live-classes"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Videos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-screen object-contain bg-black"
          controls
          crossOrigin="anonymous"
          preload="metadata"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onError={(e) => {
            console.error('❌ Video playback error:', e)
            console.error('Error code:', e.target.error?.code)
            console.error('Error message:', e.target.error?.message)
            console.error('Current video URL:', recording?.videoUrl?.substring(0, 100) + '...')
            
            let errorMessage = 'Failed to play video. '
            
            switch (e.target.error?.code) {
              case 1: // MEDIA_ERR_ABORTED
                errorMessage += 'Video loading was aborted. Please try again.'
                break
              case 2: // MEDIA_ERR_NETWORK
                errorMessage += 'Network error occurred. Check your internet connection and try again.'
                break
              case 3: // MEDIA_ERR_DECODE
                errorMessage += 'Video file is corrupted or in an unsupported format.'
                break
              case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                errorMessage += 'Video format is not supported or URL has expired. Refreshing...'
                // Try to refresh the URL automatically
                if (recording?.key) {
                  console.log('🔄 Attempting automatic URL refresh...')
                  refreshVideoUrl(recording.key)
                  return // Don't set error yet, let refresh attempt work
                }
                break
              default:
                errorMessage += 'An unknown error occurred. Please refresh the page.'
            }
            
            setError(errorMessage)
          }}
          onLoadStart={() => console.log('📹 Video loading started...')}
          onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
          onCanPlay={() => console.log('✅ Video can start playing')}
          onWaiting={() => console.log('⏳ Video buffering...')}
          onPlaying={() => console.log('▶️ Video playing')}
        >
          <source src={recording.videoUrl} type="video/mp4" />
          <source src={recording.videoUrl} type="video/webm" />
          <source src={recording.videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>

        {/* Video Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <Link to="/live-classes" className="text-white hover:text-gray-300">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-4">
              <button onClick={shareVideo} className="text-white hover:text-gray-300">
                <Share2 className="h-5 w-5" />
              </button>
              <button onClick={downloadVideo} className="text-white hover:text-gray-300">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center Play Button */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-white/20 hover:bg-white/30 rounded-full p-6 transition-colors"
              >
                <Play className="h-12 w-12 text-white ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="w-full h-2 bg-white/30 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={togglePlay} className="text-white hover:text-gray-300">
                  {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                
                <button onClick={() => skip(-10)} className="text-white hover:text-gray-300">
                  <SkipBack className="h-5 w-5" />
                </button>
                
                <button onClick={() => skip(10)} className="text-white hover:text-gray-300">
                  <SkipForward className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="text-white hover:text-gray-300">
                    {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Playback Speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="bg-white/20 text-white text-sm rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Information Panel */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">{recording.title}</h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{recording.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(recording.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{recording.teacherName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {recording.subject}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Class {recording.class}
                </span>
              </div>

              {recording.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{recording.description}</p>
                </div>
              )}

              {recording.tags && recording.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recording.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Teacher Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Instructor</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{recording.teacherName}</p>
                    <p className="text-sm text-gray-600">{recording.subject} Teacher</p>
                  </div>
                </div>
              </div>

              {/* Video Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Video Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{recording.duration || formatTime(duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{recording.format || 'video/mp4'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{recording.size || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">
                      {new Date(recording.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={downloadVideo}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Video</span>
                </button>
                
                <button
                  onClick={shareVideo}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Video</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer