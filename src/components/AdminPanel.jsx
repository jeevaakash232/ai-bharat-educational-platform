import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Eye, Download, Users, BarChart3 } from 'lucide-react'
import { getAllBooks } from '../data/booksData'

const AdminPanel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('books')

  if (!user || user.userType !== 'teacher') {
    navigate('/dashboard')
    return null
  }

  const allBooks = getAllBooks()
  const stats = {
    totalBooks: allBooks.length,
    textbooks: allBooks.filter(b => b.type === 'textbook').length,
    guides: allBooks.filter(b => b.type === 'guide').length,
    totalDownloads: 1250, // Mock data
    activeStudents: 45 // Mock data
  }

  const tabs = [
    { id: 'books', name: 'Manage Books', icon: BookOpen },
    { id: 'stats', name: 'Statistics', icon: BarChart3 },
    { id: 'students', name: 'Students', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-sm text-gray-600">Manage books and monitor platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid-3 mb-8">
          <div className="card text-center">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalBooks}</h3>
            <p className="text-gray-600">Total Books</p>
          </div>
          
          <div className="card text-center">
            <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalDownloads}</h3>
            <p className="text-gray-600">Downloads</p>
          </div>
          
          <div className="card text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">{stats.activeStudents}</h3>
            <p className="text-gray-600">Active Students</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Books Management Tab */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Books Management</h2>
              <Link to="/upload-books" className="btn btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Book</span>
              </Link>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject/Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allBooks.slice(0, 10).map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">by {book.author}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{book.subject}</div>
                          <div className="text-sm text-gray-500">Class {book.class}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            book.type === 'textbook' ? 'bg-blue-100 text-blue-800' :
                            book.type === 'guide' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {book.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {book.size}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={book.viewUrl}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Statistics</h2>
            
            <div className="grid-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Book Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Textbooks</span>
                    <span className="font-semibold">{stats.textbooks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(stats.textbooks / stats.totalBooks) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Reference Guides</span>
                    <span className="font-semibold">{stats.guides}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.guides / stats.totalBooks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Usage Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Downloads</span>
                    <span className="font-semibold text-green-600">{stats.totalDownloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Students</span>
                    <span className="font-semibold text-blue-600">{stats.activeStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Books per Student</span>
                    <span className="font-semibold text-purple-600">
                      {(stats.totalBooks / stats.activeStudents).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Management</h2>
            
            <div className="card">
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Student Management</h3>
                <p className="text-gray-500 mb-6">
                  Advanced student management features will be available in the full version.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• View student progress and activity</p>
                  <p>• Monitor book downloads and usage</p>
                  <p>• Generate performance reports</p>
                  <p>• Manage student accounts and permissions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPanel