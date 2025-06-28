import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useAuth } from './useAuth';

type Quest = Database['public']['Tables']['quests']['Row'];
type QuestInsert = Database['public']['Tables']['quests']['Insert'];
type QuestUpdate = Database['public']['Tables']['quests']['Update'];

interface QuestFilters {
  status?: 'all' | 'active' | 'completed-today' | 'incomplete-today';
  difficulty?: 1 | 2 | 3 | null;
  statType?: 'power' | 'wisdom' | 'vitality' | 'spirit' | null;
  minStreak?: number;
}

export const useQuests = (filters: QuestFilters = {}) => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuests();
    } else {
      setQuests([]);
      setLoading(false);
    }
  }, [user, filters]);

  const fetchQuests = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status === 'active') {
        query = query.eq('is_active', true);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      if (filters.statType) {
        query = query.eq('stat_type', filters.statType);
      }
      
      if (filters.minStreak && filters.minStreak > 0) {
        query = query.gte('current_streak', filters.minStreak);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuests(data || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuest = async (questData: Omit<QuestInsert, 'user_id'>) => {
    if (!user) throw new Error('No user found');

    try {
      const { data, error } = await supabase
        .from('quests')
        .insert({
          user_id: user.id,
          ...questData,
        })
        .select()
        .single();

      if (error) throw error;

      setQuests(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding quest:', error);
      return { data: null, error };
    }
  };

  const updateQuest = async (questId: string, updates: QuestUpdate) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .update(updates)
        .eq('id', questId)
        .select()
        .single();

      if (error) throw error;

      setQuests(prev => prev.map(q => q.id === questId ? data : q));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating quest:', error);
      return { data: null, error };
    }
  };

  const deleteQuest = async (questId: string) => {
    try {
      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId);

      if (error) throw error;

      setQuests(prev => prev.filter(q => q.id !== questId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting quest:', error);
      return { error };
    }
  };

  return {
    quests,
    loading,
    addQuest,
    updateQuest,
    deleteQuest,
    refetch: fetchQuests,
  };
};