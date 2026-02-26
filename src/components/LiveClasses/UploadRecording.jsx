import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Upload, 
  Video, 
  ArrowLeft, 
  FileVideo, 
  CheckCircle, 
  AlertCircle,
  X,
  Play
} from 'lucide-react'

const UploadRecording = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    tags: ''
  })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Video validation function (inline to avoid import issues)
  const validateVideoFile = (file) => {
    const validTypes = [
      'video/mp4',
      'video/webm', 
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/quicktime'
    ]
    
    const maxSize = 500 * 1024 * 1024 // 500MB
    
    const errors = []
    
    if (!file) {
      errors.push('No file selected')
    } else {
      if (!validTypes.includes(file.type)) {
        errors.push('Invalid file type. Please use MP4, WebM, OGG, AVI, or MOV')
      }
      
      if (file.size > maxSize) {
        errors.push('File size must be less than 500MB')
      }
      
      if (file.size < 1024) {
        errors.push('File is too small')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Generate unique filename
  const generateUniqueFileName = (originalName, prefix = '') => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    
    return `${prefix}${timestamp}_${randomString}.${extension}`
  }

  // Simulate S3 upload (for demo purposes)
  const uploadVideoToS3 = async (file, fileName, onProgress = () => {}) => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          // Simulate S3 URL
          const s3Url = `https://edulearn-videos.s3.ap-south-1.amazonaws.com/${fileName}`
          resolve(s3Url)
        }
        onProgress(progress)
      }, 200)
    })
  }

  // Simulate thumbnail upload to S3
  const uploadThumbnailToS3 = async (file, fileName) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `https://edulearn-videos.s3.ap-south-1.amazonaws.com/thumbnails/${fileName}`
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Use S3 service validation
      const validation = validateVideoFile(file)
      if (!validation.isValid) {
        alert(validation.errors.join('\n'))
        return
      }

      setVideoFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WebP)')
        return
      }

      setThumbnailFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!videoFile) {
      alert('Please select a video file')
      return
    }

    if (!formData.title || !formData.subject || !formData.class) {
      alert('Please fill in all required fields')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Generate unique filenames using S3 service
      const videoFileName = generateUniqueFileName(videoFile.name, 'videos/')
      const thumbnailFileName = thumbnailFile ? generateUniqueFileName(thumbnailFile.name, 'thumbnails/') : null

      // Upload video to S3
      setUploadProgress(10)
      const videoUrl = await uploadVideoToS3(videoFile, videoFileName, (progress) => {
        setUploadProgress(10 + (progress * 0.7)) // 10-80%
      })

      // Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        setUploadProgress(80)
        thumbnailUrl = await uploadThumbnailToS3(thumbnailFile, thumbnailFileName)
        setUploadProgress(95)
      }

      // Get video duration (simplified)
      const videoDuration = await getVideoDuration(videoFile)

      // Save recording data
      const recordingData = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        class: parseInt(formData.class),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        teacherId: user.id,
        teacherName: user.fullName,
        videoUrl: videoUrl,
        thumbnail: thumbnailUrl,
        duration: videoDuration,
        uploadedAt: new Date().toISOString(),
        views: 0,
        fileSize: videoFile.size,
        format: videoFile.type,
        s3Key: videoFileName // Store S3 key for future operations
      }

      // Save to localStorage (in real app, this would be an API call)
      const existingRecordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
      existingRecordings.push(recordingData)
      localStorage.setItem('recordedClasses', JSON.stringify(existingRecordings))

      setUploadProgress(100)
      
      // Success message and redirect
      setTimeout(() => {
        alert('✅ Recording uploaded successfully to S3!')
        navigate('/live-classes')
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      alert('❌ Upload failed. Please try again.')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration))
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const removeVideo = () => {
    setVideoFile(null)
    setPreviewUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
  }

  if (!user || user.userType !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only teachers can upload recordings</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link to="/live-classes" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Upload className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800">Upload Recording</h1>
                <p className="text-xs md:text-sm text-gray-600">Share your educational content</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Video Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FileVideo className="h-6 w-6 text-indigo-600" />
              <span>Video File</span>
            </h2>

            {!videoFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Video File</h3>
                <p className="text-gray-500 mb-4">Drag and drop or click to select</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Video File
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Supported formats: MP4, WebM, OGG, AVI, MOV (Max: 500MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{videoFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {previewUrl && (
                  <div className="relative">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-w-md mx-auto rounded-lg"
                      style={{ maxHeight: '300px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thumbnail (Optional)</h2>

            {!thumbnailFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Thumbnail
                </label>
                <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP (Recommended: 1280x720)</p>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-32 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{thumbnailFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(thumbnailFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Recording Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recording Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter recording title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this recording covers"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Select Class</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas (e.g., algebra, equations, basics)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tags help students find your content more easily
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploading...</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{Math.round(uploadProgress)}% complete</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/live-classes"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Recording'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default UploadRecording