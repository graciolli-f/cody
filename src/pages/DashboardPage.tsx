import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Trash2, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDocumentStore } from '../stores/documentStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { Document } from '../lib/supabase'

export default function DashboardPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const navigate = useNavigate()
  
  const { user, signOut } = useAuthStore()
  const { 
    documents, 
    loading, 
    error, 
    fetchDocuments, 
    createDocument, 
    deleteDocument, 
    clearError 
  } = useDocumentStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return
    
    try {
      const docId = await createDocument(newDocTitle.trim())
      setNewDocTitle('')
      setIsCreating(false)
      navigate(`/docs/${docId}`)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(docId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {user?.email}
              </div>
              <button
                onClick={signOut}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-red-700">{error}</div>
              <button
                onClick={clearError}
                className="text-red-700 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Create Document Section */}
        <div className="mb-8">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Document
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Document title..."
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleCreateDocument}
                disabled={!newDocTitle.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewDocTitle('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Documents List */}
        {loading && documents.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">Create your first document to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc: Document) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/docs/${doc.id}`)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                  </div>
                  <button
                    onClick={(e) => handleDeleteDocument(doc.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {doc.content ? doc.content.substring(0, 150) + '...' : 'Empty document'}
                </p>
                
                <div className="text-xs text-gray-500">
                  Updated {formatDate(doc.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 