import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useAuth } from './useAuth';
import { useGameStore } from '../store/gameStore';

type QuestInsert = Database['public']['Tables']['quests']['Insert'];

export const useQuestActions = () => {
  const { user } = useAuth();
  const { profile, updateProfile, updateQuest, addTodayCompletion } = useGameStore();
  const [loading, setLoading] = useState(false);

  const calculateQuestXP = (difficulty: number, streak: number): number => {
    const baseXP = difficulty * 25;
    const streakMultiplier = Math.min(1 + (streak * 0.1), 2.5);
    return Math.floor(baseXP * streakMultiplier);
  };

  const calculateStatGain = (difficulty: number): number => {
    return difficulty;
  };

  const calculateLevelFromXP = (totalXP: number): number => {
    if (totalXP < 100) return 1;
    
    let level = 1;
    let xpRequired = 100;
    let currentXP = totalXP;
    
    while (currentXP >= xpRequired) {
      currentXP -= xpRequired;
      level++;
      xpRequired = Math.floor(100 * Math.pow(1.5, level - 2));
    }
    
    return level - 1;
  };

  const addQuest = async (questData: Omit<QuestInsert, 'user_id'>) => {
    if (!user) throw new Error('No user found');

    setLoading(true);
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

      return { data, error: null };
    } catch (error) {
      console.error('Error adding quest:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const completeQuest = async (questId: string, difficulty: number, statType: string, currentStreak: number) => {
    if (!user || !profile) throw new Error('No user or profile found');

    setLoading(true);

    try {
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
      const newLevel = calculateLevelFromXP(newTotalXP);
      
      const statUpdates = {
        total_xp: newTotalXP,
        level: newLevel,
        [`${statType}_stat`]: (profile[`${statType}_stat` as keyof typeof profile] as number) + statGain,
      };

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update(statUpdates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state immediately (real-time subscription will also update it)
      updateProfile(statUpdates);
      addTodayCompletion(questId);

      // Update quest in local state
      updateQuest(questId, {
        current_streak: newStreak,
        best_streak: Math.max(newStreak, currentStreak),
        total_completions: (profile as any).total_completions + 1,
      });

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
    loading,
    addQuest,
    completeQuest,
  };
};