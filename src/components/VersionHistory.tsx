import React, { useState, useEffect } from 'react'
import { X, Clock, User, RotateCcw, Eye, AlertCircle } from 'lucide-react'
import { useDocumentStore } from '../stores/documentStore'
import { DocumentVersion } from '../lib/supabase'
import { 
  formatRelativeTime, 
  formatAbsoluteTime, 
  groupByDay, 
  sortDayLabels, 
  getChangeDescription 
} from '../lib/timeUtils'
import LoadingSpinner from './LoadingSpinner'

interface VersionHistoryProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

interface VersionItemProps {
  version: DocumentVersion
  onView: (version: DocumentVersion) => void
  onRestore: (version: DocumentVersion) => void
}

/**
 * Individual version item component
 */
const VersionItem: React.FC<VersionItemProps> = ({ version, onView, onRestore }) => {
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(version.created_at))

  // Update relative time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(version.created_at))
    }, 60000)

    return () => clearInterval(interval)
  }, [version.created_at])

  // Strip HTML tags and get text preview
  const getTextPreview = (htmlContent: string): string => {
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    const text = div.textContent || div.innerText || ''
    return text.slice(0, 100) + (text.length > 100 ? '...' : '')
  }

  return (
    <div className="group relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span title={formatAbsoluteTime(version.created_at)}>{relativeTime}</span>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(version)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View this version"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRestore(version)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Restore to this version"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center space-x-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{version.user_email}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{getChangeDescription(version.change_type)}</span>
        </div>
      </div>

      <div className="text-sm text-gray-800 font-medium mb-2">
        {version.title}
      </div>

      <div className="text-sm text-gray-600">
        {getTextPreview(version.content) || 'Empty document'}
      </div>
    </div>
  )
}

/**
 * Version History Modal Component
 */
export default function VersionHistory({ documentId, isOpen, onClose }: VersionHistoryProps) {
  const { versions, versionsLoading, error, fetchVersionHistory, restoreVersion } = useDocumentStore()
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  // Fetch version history when component opens
  useEffect(() => {
    if (isOpen && documentId) {
      fetchVersionHistory(documentId)
    }
  }, [isOpen, documentId, fetchVersionHistory])

  // Group versions by day
  const groupedVersions = groupByDay(versions)
  const sortedDayLabels = sortDayLabels(Object.keys(groupedVersions))

  const handleView = (version: DocumentVersion) => {
    setSelectedVersion(version)
  }

  const handleRestore = async (version: DocumentVersion) => {
    if (window.confirm('Are you sure you want to restore the document to this version? This action cannot be undone.')) {
      setIsRestoring(true)
      try {
        await restoreVersion(documentId, version.id)
        onClose() // Close modal after successful restore
      } catch (error) {
        console.error('Error restoring version:', error)
      } finally {
        setIsRestoring(false)
      }
    }
  }

  const handleClose = () => {
    setSelectedVersion(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose} />
      
      {/* Modal Content */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isRestoring && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center space-x-2 text-blue-700">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Restoring version...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Version List */}
          <div className="flex-1 overflow-y-auto">
            {versionsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No version history</h3>
                <p className="text-sm">Version history will appear here as you make changes to the document.</p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {sortedDayLabels.map(dayLabel => (
                  <div key={dayLabel}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 sticky top-0 bg-white py-1">
                      {dayLabel}
                    </h3>
                    <div className="space-y-3">
                      {groupedVersions[dayLabel].map(version => (
                        <VersionItem
                          key={version.id}
                          version={version}
                          onView={handleView}
                          onRestore={handleRestore}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version Preview Modal */}
      {selectedVersion && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-60" 
            onClick={() => setSelectedVersion(null)} 
          />
          <div className="fixed inset-4 bg-white rounded-lg shadow-2xl z-60 flex flex-col max-w-4xl mx-auto">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Version Preview</h3>
                <p className="text-sm text-gray-600">
                  {formatAbsoluteTime(selectedVersion.created_at)} • {selectedVersion.user_email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Version</span>
                </button>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedVersion.title}</h1>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
} 