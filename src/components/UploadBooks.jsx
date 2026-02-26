import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Upload, BookOpen, X, CheckCircle, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '../config'

const UploadBooks = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  if (!user || user.userType !== 'teacher') {
    navigate('/dashboard')
    return null
  }

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    subject: '',
    class: '',
    type: 'textbook',
    description: '',
    isbn: '',
    publisher: '',
    publishYear: '',
    state: user.selectedState || 'Uttarakhand',
    medium: user.selectedMedium || 'state',
    language: user.stateLanguage || 'Hindi',
    term: ''
  })

  // State-specific subjects based on selected state
  const getSubjectsForState = (state) => {
    const commonSubjects = [
      'English', 'Maths', 'Science', 'Social', 'EVS',
      'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Commerce', 'Accountancy', 'Business Maths', 'History',
      'Geography', 'Economics', 'Political Science'
    ]

    // Add state language as first subject
    const stateLanguages = {
      'Tamil Nadu': 'Tamil',
      'Andhra Pradesh': 'Telugu',
      'Telangana': 'Telugu',
      'Karnataka': 'Kannada',
      'Kerala': 'Malayalam',
      'Maharashtra': 'Marathi',
      'Gujarat': 'Gujarati',
      'Rajasthan': 'Hindi',
      'Madhya Pradesh': 'Hindi',
      'Uttar Pradesh': 'Hindi',
      'Bihar': 'Hindi',
      'Jharkhand': 'Hindi',
      'Chhattisgarh': 'Hindi',
      'Uttarakhand': 'Hindi',
      'Himachal Pradesh': 'Hindi',
      'Haryana': 'Hindi',
      'Punjab': 'Punjabi',
      'West Bengal': 'Bengali',
      'Odisha': 'Odia',
      'Assam': 'Assamese',
      'Manipur': 'Manipuri',
      'Meghalaya': 'English',
      'Tripura': 'Bengali',
      'Mizoram': 'Mizo',
      'Nagaland': 'English',
      'Arunachal Pradesh': 'English',
      'Sikkim': 'Nepali',
      'Goa': 'Konkani',
      'Jammu and Kashmir': 'Urdu',
      'Ladakh': 'Urdu'
    }

    const stateLanguage = stateLanguages[state]
    if (stateLanguage && !commonSubjects.includes(stateLanguage)) {
      return [stateLanguage, ...commonSubjects]
    }
    return commonSubjects
  }

  const subjects = getSubjectsForState(bookData.state)

  const classes = Array.from({ length: 12 }, (_, i) => i + 1)

  const bookTypes = [
    { id: 'textbook', name: 'Textbook' },
    { id: 'guide', name: 'Reference Guide' },
    { id: 'practice', name: 'Practice Book' },
    { id: 'workbook', name: 'Workbook' }
  ]

  const terms = [
    { id: '', name: 'No Term (Full Year)' },
    { id: '1', name: 'Term 1' },
    { id: '2', name: 'Term 2' },
    { id: '3', name: 'Term 3' }
  ]

  const handleInputChange = (e) => {
    setBookData({
      ...bookData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (file.type === 'application/pdf' && file.size <= 100 * 1024 * 1024) { // 100MB limit
        const newFile = {
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          status: 'ready',
          progress: 0
        }
        setUploadedFiles(prev => [...prev, newFile])
      } else {
        alert(`File ${file.name} is either not a PDF or exceeds 100MB limit`)
      }
    })
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const saveBookToDatabase = async (bookInfo, fileName) => {
    try {
      // Create book entry for database
      const bookEntry = {
        id: `${bookInfo.subject.toLowerCase()}-${bookInfo.class}-${Date.now()}`,
        title: bookInfo.title,
        author: bookInfo.author,
        subject: bookInfo.subject,
        class: bookInfo.class.toString(),
        type: bookInfo.type,
        board: "State Board",
        state: bookInfo.state,
        medium: bookInfo.medium,
        language: bookInfo.language,
        pages: 0, // Will be updated when PDF is processed
        size: uploadedFiles.find(f => f.file.name === fileName)?.size || "Unknown",
        format: "PDF",
        description: bookInfo.description,
        chapters: [], // Can be updated later
        downloadUrl: `/books/${bookInfo.state.toLowerCase().replace(/\s+/g, '')}/class${bookInfo.class}/${fileName}`,
        viewUrl: `/book-viewer/${bookEntry.id}`,
        thumbnail: `/images/books/${bookInfo.state.toLowerCase().replace(/\s+/g, '')}/${bookInfo.subject.toLowerCase()}-${bookInfo.class}.jpg`,
        isRealBook: true,
        lastUpdated: new Date().toISOString(),
        originalFileName: fileName,
        isbn: bookInfo.isbn,
        publisher: bookInfo.publisher,
        publishYear: bookInfo.publishYear
      }

      // Add term if specified
      if (bookInfo.term) {
        bookEntry.term = parseInt(bookInfo.term)
      }

      // Save to localStorage for now (in a real app, this would be sent to a server)
      const existingBooks = JSON.parse(localStorage.getItem('uploadedBooks') || '[]')
      existingBooks.push(bookEntry)
      localStorage.setItem('uploadedBooks', JSON.stringify(existingBooks))

      return bookEntry
    } catch (error) {
      console.error('Error saving book to database:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one PDF file')
      return
    }

    if (!bookData.title || !bookData.author || !bookData.subject || !bookData.class) {
      alert('Please fill in all required fields')
      return
    }

    setIsUploading(true)

    try {
      // Process each uploaded file
      for (let fileData of uploadedFiles) {
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, status: 'uploading' } : f)
        )

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('bookFile', fileData.file)
        
        // Add book metadata
        Object.keys(bookData).forEach(key => {
          formData.append(key, bookData[key])
        })
        formData.append('uploadedBy', user.email)
        formData.append('userType', user.userType)

        // Upload to server
        const response = await fetch(`${API_BASE_URL}/api/upload-book`, {
          method: 'POST',
          body: formData
        })

        console.log('Upload response status:', response.status)
        console.log('Upload response headers:', response.headers)

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
          } else {
            const errorText = await response.text()
            console.error('Non-JSON error response:', errorText)
            throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`)
          }
        }

        const result = await response.json()
        console.log('Upload successful:', result)

        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, status: 'completed', progress: 100 } : f)
        )
      }

      setIsUploading(false)
      
      // Show success message
      alert(`Successfully uploaded ${uploadedFiles.length} book(s)! The books are now available to students.`)
      
      // Reset form
      setBookData({
        title: '',
        author: '',
        subject: '',
        class: '',
        type: 'textbook',
        description: '',
        isbn: '',
        publisher: '',
        publishYear: '',
        state: user.selectedState || 'Uttarakhand',
        medium: user.selectedMedium || 'state',
        language: user.stateLanguage || 'Hindi',
        term: ''
      })
      setUploadedFiles([])
      
      // Navigate back to guide books
      navigate('/guide-books')
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading books: ' + error.message)
      setIsUploading(false)
      
      // Reset file status
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'ready', progress: 0 }))
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/guide-books" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <Upload className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Upload Books</h1>
                <p className="text-sm text-gray-600">Add new textbooks and guides to your library</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">Upload Instructions</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Upload PDF files up to 100MB each</li>
                  <li>• Fill in book details for proper categorization</li>
                  <li>• Books will be organized by state, medium, class, and term</li>
                  <li>• Uploaded books will appear in the Guide Books section</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Book Information */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Book Information</h2>
              
              <div className="grid-2 gap-6">
                <div className="form-group">
                  <label>Book Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={bookData.title}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={bookData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    name="subject"
                    value={bookData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Class *</label>
                  <select
                    name="class"
                    value={bookData.class}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Book Type *</label>
                  <select
                    name="type"
                    value={bookData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {bookTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Term (Optional)</label>
                  <select
                    name="term"
                    value={bookData.term}
                    onChange={handleInputChange}
                  >
                    {terms.map(term => (
                      <option key={term.id} value={term.id}>{term.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={bookData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="form-group">
                  <label>Medium</label>
                  <input
                    type="text"
                    name="medium"
                    value={bookData.medium === 'state' ? `${bookData.language} Medium` : 'English Medium'}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="form-group">
                  <label>Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={bookData.publisher}
                    onChange={handleInputChange}
                    placeholder="Enter publisher name"
                  />
                </div>

                <div className="form-group">
                  <label>Publication Year</label>
                  <input
                    type="number"
                    name="publishYear"
                    value={bookData.publishYear}
                    onChange={handleInputChange}
                    placeholder="Enter year"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={bookData.isbn}
                    onChange={handleInputChange}
                    placeholder="Enter ISBN (optional)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={bookData.description}
                  onChange={handleInputChange}
                  placeholder="Enter book description"
                  rows="4"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Upload PDF Files</h2>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Drop PDF files here or click to browse
                </h3>
                <p className="text-gray-500 mb-4">
                  Maximum file size: 100MB per file. Only PDF files are allowed.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn btn-primary cursor-pointer inline-block"
                >
                  Choose Files
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-gray-700">Files to Upload:</h3>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-500">{file.size}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {file.status === 'ready' && (
                          <span className="text-sm text-gray-600">Ready</span>
                        )}
                        
                        {file.status === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-blue-600">{file.progress}%</span>
                          </div>
                        )}
                        
                        {file.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}

                        {file.status === 'ready' && (
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link to="/guide-books" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUploading || uploadedFiles.length === 0}
                className="btn btn-primary disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} Book${uploadedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default UploadBooks