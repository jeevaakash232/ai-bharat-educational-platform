import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, BookOpen, Trash2, Eye, Download } from 'lucide-react'
import { API_BASE_URL } from '../config'

const ManageBooks = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [uploadedBooks, setUploadedBooks] = useState([])

  useEffect(() => {
    if (!user || user.userType !== 'teacher') {
      navigate('/dashboard')
      return
    }

    // Fetch uploaded books from server
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`)
        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }
        const allBooks = await response.json()
        
        // Filter books uploaded by current teacher
        const teacherBooks = allBooks.filter(book => 
          book.uploadedBy === user.email
        )
        
        setUploadedBooks(teacherBooks)
        console.log(`📚 Loaded ${teacherBooks.length} books for ${user.email}`)
      } catch (error) {
        console.error('Error loading uploaded books:', error)
      }
    }

    fetchBooks()
  }, [user, navigate])

  const deleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete book')
        }
        
        // Update local state
        const updatedBooks = uploadedBooks.filter(book => book.id !== bookId)
        setUploadedBooks(updatedBooks)
        
        alert('Book deleted successfully!')
      } catch (error) {
        console.error('Error deleting book:', error)
        alert('Failed to delete book: ' + error.message)
      }
    }
  }

  if (!user || user.userType !== 'teacher') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/guide-books" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Manage Uploaded Books</h1>
                  <p className="text-sm text-gray-600">View and manage your uploaded books</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link to="/upload-books" className="btn btn-primary">
                Upload New Books
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {uploadedBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No uploaded books</h3>
            <p className="text-gray-500 mb-6">
              You haven't uploaded any books yet. Start by uploading your first book.
            </p>
            <Link to="/upload-books" className="btn btn-primary">
              Upload Books
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Uploaded Books ({uploadedBooks.length})
              </h2>
              <p className="text-gray-600">
                Manage your uploaded books. These books are visible to students based on their selected state, medium, and class.
              </p>
            </div>

            <div className="grid gap-6">
              {uploadedBooks.map((book) => (
                <div key={book.id} className="card">
                  <div className="flex items-start space-x-4">
                    {/* Book Icon */}
                    <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-indigo-600" />
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {book.subject}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Class {book.class}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {book.type}
                            </span>
                            {book.term && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                Term {book.term}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {book.state}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {book.medium === 'state' ? `${book.language} Medium` : 'English Medium'}
                            </span>
                          </div>

                          {book.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {book.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Size: {book.size}</span>
                            {book.publisher && <span>Publisher: {book.publisher}</span>}
                            {book.publishYear && <span>Year: {book.publishYear}</span>}
                            {book.isbn && <span>ISBN: {book.isbn}</span>}
                          </div>

                          <div className="text-xs text-gray-400 mt-2">
                            Original file: {book.originalFileName}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`${API_BASE_URL}/api/books/${encodeURIComponent(book.key)}`)
                                if (!response.ok) throw new Error('Failed to get book URL')
                                const data = await response.json()
                                window.open(data.url, '_blank')
                              } catch (error) {
                                console.error('View error:', error)
                                alert('Failed to open book: ' + error.message)
                              }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Book"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                console.log('📥 Downloading book:', book.title)
                                const apiUrl = `${API_BASE_URL}/api/books/${encodeURIComponent(book.key)}`
                                
                                const response = await fetch(apiUrl)
                                if (!response.ok) throw new Error('Failed to get download URL: ' + response.status)
                                
                                const data = await response.json()
                                const presignedUrl = data.url
                                
                                // Try blob approach first
                                try {
                                  const fileResponse = await fetch(presignedUrl)
                                  if (!fileResponse.ok) throw new Error('Blob fetch failed')
                                  
                                  const blob = await fileResponse.blob()
                                  const blobUrl = window.URL.createObjectURL(blob)
                                  const link = document.createElement('a')
                                  link.href = blobUrl
                                  link.download = book.originalFileName
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
                                  console.log('✅ Blob download completed')
                                } catch (blobError) {
                                  // Fallback: Open in new tab
                                  console.log('⚠️ Using fallback download method')
                                  const link = document.createElement('a')
                                  link.href = presignedUrl
                                  link.download = book.originalFileName
                                  link.target = '_blank'
                                  link.rel = 'noopener noreferrer'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  console.log('✅ Opened in new tab')
                                }
                              } catch (error) {
                                console.error('Download error:', error)
                                alert('Failed to download book: ' + error.message)
                              }
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Book"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteBook(book.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Book"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageBooks