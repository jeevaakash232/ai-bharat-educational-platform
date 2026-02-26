import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { initializeDemoRecordings } from '../../utils/demoRecordingsData'
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
  Download
} from 'lucide-react'

const RecordedClasses = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recordings, setRecordings] = useState([])
  const [filter, setFilter] = useState('all') // all, my-uploads, favorites
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadRecordings()
  }, [filter, user, navigate])

  const loadRecordings = async () => {
    setLoading(true)
    try {
      // Initialize demo recordings if none exist
      initializeDemoRecordings()
      
      // Get recordings from localStorage
      const savedRecordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
      
      // Filter based on user and filter type
      let filteredRecordings = savedRecordings
      
      if (filter === 'my-uploads' && user.userType === 'teacher') {
        filteredRecordings = savedRecordings.filter(rec => rec.teacherId === user.id)
      }
      
      setRecordings(filteredRecordings)
    } catch (error) {
      console.error('Error loading recordings:', error)
    }
    setLoading(false)
  }

  const watchRecording = (recordingId) => {
    navigate(`/watch-recording/${recordingId}`)
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
                  <p className="text-xs md:text-sm text-gray-600">Watch educational video recordings</p>
                </div>
              </div>
            </div>
            
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
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
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
            <p className="text-gray-600 mt-4">Loading recordings...</p>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recordings found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'my-uploads' 
                ? 'You haven\'t uploaded any recordings yet' 
                : 'No recorded classes available'}
            </p>
            {user.userType === 'teacher' && (
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
            {filteredRecordings.map(recording => (
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
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(recording.duration || 0)}
                  </div>
                  
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
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.description}</p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{recording.teacherName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(recording.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{recording.views || 0} views</span>
                    </div>
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
            ))}
          </div>
        )}

        {/* Info banner */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            📹 Recorded Classes System
          </h3>
          <p className="text-green-700 mb-4">
            Teachers can upload video recordings that are stored securely in AWS S3. Students can watch these recordings anytime.
          </p>
          <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
            <li>Videos are stored in AWS S3 for reliable access</li>
            <li>Support for multiple video formats (MP4, WebM, etc.)</li>
            <li>Automatic thumbnail generation</li>
            <li>View tracking and analytics</li>
            <li>Search and filter capabilities</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default RecordedClasses
