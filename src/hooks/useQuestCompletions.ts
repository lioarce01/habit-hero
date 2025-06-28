import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';

type QuestCompletion = Database['public']['Tables']['quest_completions']['Row'];

export const useQuestCompletions = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [loading, setLoading] = useState(false);

  const getTodayCompletions = async (questId?: string) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('quest_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_at', new Date().toISOString().split('T')[0]);

      if (questId) {
        query = query.eq('quest_id', questId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching today completions:', error);
      return [];
    }
  };

  const isQuestCompletedToday = async (questId: string): Promise<boolean> => {
    const todayCompletions = await getTodayCompletions(questId);
    return todayCompletions.length > 0;
  };

  const calculateQuestXP = (difficulty: number, streak: number): number => {
    const baseXP = difficulty * 25;
    const streakMultiplier = Math.min(1 + (streak * 0.1), 2.5);
    return Math.floor(baseXP * streakMultiplier);
  };

  const calculateStatGain = (difficulty: number): number => {
    return difficulty;
  };

  const calculateXPToNextLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const completeQuest = async (questId: string, difficulty: number, statType: string, currentStreak: number) => {
    if (!user || !profile) throw new Error('No user or profile found');

    setLoading(true);

    try {
      // Check if already completed today
      const isCompleted = await isQuestCompletedToday(questId);
      if (isCompleted) {
        throw new Error('Quest already completed today');
      }

      // Calculate rewards
      const xpGain = calculateQuestXP(difficulty, currentStreak);
      const statGain = calculateStatGain(difficulty);
      const newStreak = currentStreak + 1;

      // Record completion
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert({
          quest_id: questId,
          user_id: user.id,
          xp_gained: xpGain,
        });

      if (completionError) throw completionError;

      // Update quest streak and total completions
      const { error: questError } = await supabase
        .from('quests')
        .update({
          current_streak: newStreak,
          best_streak: Math.max(newStreak, currentStreak),
          total_completions: supabase.sql`total_completions + 1`,
        })
        .eq('id', questId);

      if (questError) throw questError;

      // Calculate new user stats
      const newTotalXP = profile.total_xp + xpGain;
      const newLevel = Math.floor(Math.log(newTotalXP / 100 + 1) / Math.log(1.5)) + 1;
      
      const statUpdates = {
        total_xp: newTotalXP,
        level: newLevel,
        [`${statType}_stat`]: profile[`${statType}_stat` as keyof typeof profile] + statGain,
      };

      // Update user profile
      await updateProfile(statUpdates);

      return {
        xpGain,
        statGain,
        newStreak,
        leveledUp: newLevel > profile.level,
        newLevel,
      };
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    completions,
    loading,
    completeQuest,
    getTodayCompletions,
    isQuestCompletedToday,
  };
};