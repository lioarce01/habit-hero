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
      users: {
        Row: {
          id: string
          name: string
          hero_class: 'warrior' | 'mage' | 'paladin' | 'ranger'
          level: number
          total_xp: number
          power_stat: number
          wisdom_stat: number
          vitality_stat: number
          spirit_stat: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          hero_class: 'warrior' | 'mage' | 'paladin' | 'ranger'
          level?: number
          total_xp?: number
          power_stat?: number
          wisdom_stat?: number
          vitality_stat?: number
          spirit_stat?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          hero_class?: 'warrior' | 'mage' | 'paladin' | 'ranger'
          level?: number
          total_xp?: number
          power_stat?: number
          wisdom_stat?: number
          vitality_stat?: number
          spirit_stat?: number
          created_at?: string
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          difficulty: 1 | 2 | 3
          stat_type: 'power' | 'wisdom' | 'vitality' | 'spirit'
          current_streak: number
          best_streak: number
          total_completions: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          difficulty: 1 | 2 | 3
          stat_type: 'power' | 'wisdom' | 'vitality' | 'spirit'
          current_streak?: number
          best_streak?: number
          total_completions?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          difficulty?: 1 | 2 | 3
          stat_type?: 'power' | 'wisdom' | 'vitality' | 'spirit'
          current_streak?: number
          best_streak?: number
          total_completions?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quest_completions: {
        Row: {
          id: string
          quest_id: string
          user_id: string
          completed_at: string
          xp_gained: number
          created_at: string
        }
        Insert: {
          id?: string
          quest_id: string
          user_id: string
          completed_at?: string
          xp_gained: number
          created_at?: string
        }
        Update: {
          id?: string
          quest_id?: string
          user_id?: string
          completed_at?: string
          xp_gained?: number
          created_at?: string
        }
      }
    }
  }
}