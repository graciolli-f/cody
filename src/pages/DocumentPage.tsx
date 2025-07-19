import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, FileText, User, LogOut, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDocumentStore } from '../stores/documentStore'
import DocumentEditor from '../components/DocumentEditor'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const { user, signOut } = useAuthStore()
  const { 
    currentDocument, 
    loading, 
    error, 
    fetchDocument, 
    updateDocument
  } = useDocumentStore()

  // Load document
  useEffect(() => {
    if (id) {
      fetchDocument(id)
    }
  }, [id, fetchDocument])

  // Set local state when document loads
  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title)
      setContent(currentDocument.content)
    }
  }, [currentDocument])

  // Auto-save function
  const saveDocument = useCallback(async (newTitle?: string, newContent?: string) => {
    if (!id || !currentDocument) return
    
    const titleToSave = newTitle ?? title
    const contentToSave = newContent ?? content
    
    // Only save if there are changes
    if (titleToSave === currentDocument.title && contentToSave === currentDocument.content) {
      return
    }

    setIsSaving(true)
    try {
      await updateDocument(id, {
        title: titleToSave,
        content: contentToSave
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setIsSaving(false)
    }
  }, [id, currentDocument, title, content, updateDocument])

  // Auto-save effect - save after user stops typing
  useEffect(() => {
    if (!currentDocument) return

    const timeoutId = setTimeout(() => {
      saveDocument()
    }, 1000) // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId)
  }, [title, content, saveDocument, currentDocument])

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
    if (title.trim() === '') {
      setTitle(currentDocument?.title || 'Untitled')
    }
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setTitle(currentDocument?.title || 'Untitled')
      setIsEditingTitle(false)
    }
  }

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved'
    
    const now = new Date()
    const diffMs = now.getTime() - lastSaved.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    
    if (diffSeconds < 30) return 'Saved just now'
    if (diffMinutes === 0) return `Saved ${diffSeconds} seconds ago`
    if (diffMinutes === 1) return 'Saved 1 minute ago'
    if (diffMinutes < 60) return `Saved ${diffMinutes} minutes ago`
    
    return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading document</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
          <p className="text-gray-600 mb-4">The document you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={handleTitleKeyPress}
                    className="text-lg font-semibold text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none min-w-0"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    title="Click to edit title"
                  >
                    {title || 'Untitled'}
                  </h1>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    {formatLastSaved()}
                  </>
                )}
              </div>
              
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

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your document..."
        />
      </main>
    </div>
  )
} 