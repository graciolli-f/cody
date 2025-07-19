import { create } from 'zustand'
import { supabase, User } from '../lib/supabase'
import type { AuthError } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        set({ 
          user: {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          },
          loading: false 
        })
      } else {
        set({ user: null, loading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_, session) => {
        if (session?.user) {
          set({ 
            user: {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at
            }
          })
        } else {
          set({ user: null })
        }
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        loading: false 
      })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        set({ 
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at
          },
          loading: false 
        })
      }
    } catch (error) {
      const authError = error as AuthError
      set({ 
        error: authError.message || 'Failed to sign in',
        loading: false 
      })
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        // Note: User might need to confirm email depending on Supabase settings
        set({ loading: false, error: null })
      }
    } catch (error) {
      const authError = error as AuthError
      set({ 
        error: authError.message || 'Failed to sign up',
        loading: false 
      })
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, error: null })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out'
      })
    }
  },

  clearError: () => set({ error: null })
})) 