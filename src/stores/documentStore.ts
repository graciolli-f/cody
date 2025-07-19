import { create } from 'zustand'
import { supabase, Document } from '../lib/supabase'

interface DocumentState {
  documents: Document[]
  currentDocument: Document | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchDocuments: () => Promise<void>
  fetchDocument: (id: string) => Promise<void>
  createDocument: (title: string) => Promise<string>
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  clearError: () => void
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      set({ documents: data || [], loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
        loading: false 
      })
    }
  },

  fetchDocument: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      set({ currentDocument: data, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch document',
        loading: false 
      })
    }
  },

  createDocument: async (title: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          content: '',
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Update documents list
      const currentDocs = get().documents
      set({ 
        documents: [data, ...currentDocs],
        loading: false 
      })

      return data.id
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create document',
        loading: false 
      })
      throw error
    }
  },

  updateDocument: async (id: string, updates: Partial<Document>) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      const currentDoc = get().currentDocument
      if (currentDoc && currentDoc.id === id) {
        set({ 
          currentDocument: { 
            ...currentDoc, 
            ...updates,
            updated_at: new Date().toISOString()
          }
        })
      }

      // Update documents list
      const currentDocs = get().documents
      set({
        documents: currentDocs.map(doc => 
          doc.id === id 
            ? { ...doc, ...updates, updated_at: new Date().toISOString() }
            : doc
        )
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update document'
      })
    }
  },

  deleteDocument: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      const currentDocs = get().documents
      set({ 
        documents: currentDocs.filter(doc => doc.id !== id),
        loading: false
      })

      // Clear current document if it was deleted
      const currentDoc = get().currentDocument
      if (currentDoc && currentDoc.id === id) {
        set({ currentDocument: null })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete document',
        loading: false 
      })
    }
  },

  clearError: () => set({ error: null })
})) 