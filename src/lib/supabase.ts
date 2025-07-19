import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Document {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  user_email?: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  title: string
  content: string
  change_type: 'created' | 'title_updated' | 'content_modified' | 'restored'
  user_id: string
  user_email?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
} 