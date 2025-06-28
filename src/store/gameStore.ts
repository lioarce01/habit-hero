import { create } from 'zustand';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Quest = Database['public']['Tables']['quests']['Row'];
type QuestInsert = Database['public']['Tables']['quests']['Insert'];
type UserProfileInsert = Database['public']['Tables']['users']['Insert'];

interface GameState {
  // User Profile
  profile: UserProfile | null;
  profileLoading: boolean;
  
  // Quests
  quests: Quest[];
  questsLoading: boolean;
  
  // Quest Completions (today)
  todayCompletions: Set<string>;
  completionsLoading: boolean;
  
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setQuests: (quests: Quest[]) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  addQuest: (quest: Quest) => void;
  setTodayCompletions: (completions: Set<string>) => void;
  addTodayCompletion: (questId: string) => void;
  
  // Loading states
  setProfileLoading: (loading: boolean) => void;
  setQuestsLoading: (loading: boolean) => void;
  setCompletionsLoading: (loading: boolean) => void;
  
  // Reset store
  resetStore: () => void;
  
  // Computed values
  isQuestCompletedToday: (questId: string) => boolean;
  
  // Database operations
  createProfile: (profileData: Omit<UserProfileInsert, 'id'>, userId: string) => Promise<{ data: UserProfile | null; error: any }>;
  createQuest: (questData: Omit<QuestInsert, 'user_id'>, userId: string) => Promise<{ data: Quest | null; error: any }>;
  completeQuest: (questId: string, difficulty: number, statType: string, currentStreak: number, userId: string) => Promise<any>;
  
  // Data fetching
  fetchProfile: (userId: string) => Promise<void>;
  fetchQuests: (userId: string) => Promise<void>;
  fetchTodayCompletions: (userId: string) => Promise<void>;
  initializeUserData: (userId: string) => Promise<void>;
  refreshData: (userId: string) => Promise<void>;
}

const calculateQuestXP = (difficulty: number, streak: number): number => {
  const baseXP = difficulty * 25;
  const streakMultiplier = Math.min(1 + (streak * 0.1), 2.5);
  return Math.floor(baseXP * streakMultiplier);
};

const calculateStatGain = (difficulty: number): number => {
  return difficulty;
};

// Fixed level calculation - this was the main issue
const calculateLevelFromXP = (totalXP: number): number => {
  if (totalXP < 100) return 1;
  
  let level = 1;
  let xpUsed = 0;
  
  while (true) {
    const xpNeededForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1));
    
    if (xpUsed + xpNeededForNextLevel > totalXP) {
      break;
    }
    
    xpUsed += xpNeededForNextLevel;
    level++;
  }
  
  return level;
};

// Helper function to calculate XP needed for a specific level
const calculateXPNeededForLevel = (level: number): number => {
  if (level <= 1) return 0;
  
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(100 * Math.pow(1.5, i - 1));
  }
  
  return totalXP;
};

export const useGameStore = create<GameState>()((set, get) => ({
  // Initial state
  profile: null,
  profileLoading: false,
  quests: [],
  questsLoading: false,
  todayCompletions: new Set(),
  completionsLoading: false,

  // Actions
  setProfile: (profile) => {
    console.log('Setting profile in store:', profile?.name);
    set({ profile });
  },
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  
  setQuests: (quests) => set({ quests }),
  
  updateQuest: (questId, updates) => set((state) => ({
    quests: state.quests.map(quest => 
      quest.id === questId ? { ...quest, ...updates } : quest
    )
  })),
  
  addQuest: (quest) => set((state) => ({
    quests: [quest, ...state.quests]
  })),
  
  setTodayCompletions: (completions) => set({ todayCompletions: completions }),
  
  addTodayCompletion: (questId) => set((state) => ({
    todayCompletions: new Set([...state.todayCompletions, questId])
  })),
  
  // Loading states
  setProfileLoading: (loading) => {
    console.log('Setting profile loading:', loading);
    set({ profileLoading: loading });
  },
  setQuestsLoading: (loading) => set({ questsLoading: loading }),
  setCompletionsLoading: (loading) => set({ completionsLoading: loading }),
  
  // Reset store
  resetStore: () => {
    console.log('Resetting store');
    set({
      profile: null,
      profileLoading: false,
      quests: [],
      questsLoading: false,
      todayCompletions: new Set(),
      completionsLoading: false,
    });
  },
  
  // Computed values
  isQuestCompletedToday: (questId) => get().todayCompletions.has(questId),
  
  // Data fetching methods
  fetchProfile: async (userId) => {
    const { setProfileLoading } = get();
    setProfileLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Fetched profile:', data?.name);
      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  },

  fetchQuests: async (userId) => {
    const { setQuestsLoading } = get();
    setQuestsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quests:', error);
        throw error;
      }

      console.log('Fetched quests:', data?.length);
      set({ quests: data || [] });
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setQuestsLoading(false);
    }
  },

  fetchTodayCompletions: async (userId) => {
    const { setCompletionsLoading } = get();
    setCompletionsLoading(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('quest_completions')
        .select('quest_id')
        .eq('user_id', userId)
        .eq('completed_at', today);

      if (error) {
        console.error('Error fetching completions:', error);
        throw error;
      }

      const completedIds = new Set(data?.map(c => c.quest_id) || []);
      console.log('Fetched today completions:', completedIds.size);
      set({ todayCompletions: completedIds });
    } catch (error) {
      console.error('Error fetching completions:', error);
    } finally {
      setCompletionsLoading(false);
    }
  },

  // Initialize all user data
  initializeUserData: async (userId) => {
    const { fetchProfile, fetchQuests, fetchTodayCompletions } = get();
    
    console.log('Initializing user data for:', userId);
    
    // Fetch all data in parallel
    await Promise.all([
      fetchProfile(userId),
      fetchQuests(userId),
      fetchTodayCompletions(userId)
    ]);
  },

  // Refresh all data
  refreshData: async (userId) => {
    const { fetchProfile, fetchQuests, fetchTodayCompletions } = get();
    
    console.log('Refreshing data for:', userId);
    
    // Fetch all data in parallel
    await Promise.all([
      fetchProfile(userId),
      fetchQuests(userId),
      fetchTodayCompletions(userId)
    ]);
  },
  
  // Database operations
  createProfile: async (profileData, userId) => {
    console.log('Creating profile in store:', profileData, userId);
    
    try {
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      // If profile already exists, return it and set it in store
      if (existingProfile) {
        console.log('Profile already exists, returning existing profile:', existingProfile);
        set({ profile: existingProfile });
        return { data: existingProfile, error: null };
      }

      // Create new profile if it doesn't exist
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating profile:', error);
        
        // If it's a duplicate key error, try to fetch the existing profile
        if (error.code === '23505') {
          console.log('Duplicate key error, fetching existing profile...');
          const { data: existingData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (fetchError) {
            throw fetchError;
          }
          
          console.log('Found existing profile after duplicate error:', existingData);
          set({ profile: existingData });
          return { data: existingData, error: null };
        }
        
        throw error;
      }

      console.log('Profile created successfully in database:', data);
      
      // Immediately update the store
      set({ profile: data });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
  },

  createQuest: async (questData, userId) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .insert({
          user_id: userId,
          ...questData,
        })
        .select()
        .single();

      if (error) throw error;

      const { addQuest } = get();
      addQuest(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating quest:', error);
      return { data: null, error };
    }
  },

  completeQuest: async (questId, difficulty, statType, currentStreak, userId) => {
    const { profile, updateProfile, addTodayCompletion, updateQuest } = get();
    
    if (!profile) throw new Error('No profile found');

    try {
      // Check if already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCompletion } = await supabase
        .from('quest_completions')
        .select('id')
        .eq('quest_id', questId)
        .eq('user_id', userId)
        .eq('completed_at', today)
        .maybeSingle();

      if (existingCompletion) {
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
          user_id: userId,
          xp_gained: xpGain,
        });

      if (completionError) throw completionError;

      // Get current quest data to calculate new totals
      const { data: currentQuest, error: questFetchError } = await supabase
        .from('quests')
        .select('total_completions, best_streak')
        .eq('id', questId)
        .single();

      if (questFetchError) throw questFetchError;

      // Update quest streak and total completions
      const newTotalCompletions = currentQuest.total_completions + 1;
      const newBestStreak = Math.max(newStreak, currentQuest.best_streak);

      const { error: questError } = await supabase
        .from('quests')
        .update({
          current_streak: newStreak,
          best_streak: newBestStreak,
          total_completions: newTotalCompletions,
        })
        .eq('id', questId);

      if (questError) throw questError;

      // Calculate new user stats
      const newTotalXP = profile.total_xp + xpGain;
      const oldLevel = profile.level;
      const newLevel = calculateLevelFromXP(newTotalXP);
      
      console.log('Level calculation:', {
        oldXP: profile.total_xp,
        xpGain,
        newTotalXP,
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel
      });
      
      const statUpdates = {
        total_xp: newTotalXP,
        level: newLevel,
        [`${statType}_stat`]: (profile[`${statType}_stat` as keyof typeof profile] as number) + statGain,
      };

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update(statUpdates)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state immediately
      updateProfile(statUpdates);
      addTodayCompletion(questId);
      updateQuest(questId, {
        current_streak: newStreak,
        best_streak: newBestStreak,
        total_completions: newTotalCompletions,
      });

      const leveledUp = newLevel > oldLevel;

      console.log('Quest completed successfully:', {
        questId,
        xpGain,
        statGain,
        newStreak,
        newLevel,
        leveledUp
      });

      return {
        xpGain,
        statGain,
        newStreak,
        leveledUp,
        newLevel,
        oldLevel,
      };
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  },
}));