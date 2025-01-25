export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string
          status: '未読' | '読書中' | '読了'
          category: string | null
          cover_image: string | null
          notes: string | null
          last_read_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          author: string
          status: '未読' | '読書中' | '読了'
          category?: string | null
          cover_image?: string | null
          notes?: string | null
          last_read_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          status?: '未読' | '読書中' | '読了'
          category?: string | null
          cover_image?: string | null
          notes?: string | null
          last_read_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}