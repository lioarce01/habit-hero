import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Quest = Database['public']['Tables']['quests']['Row'];
type QuestCompletion = Database['public']['Tables']['quest_completions']['Row'];
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
  
  // Initialize data
  initializeUserData: (userId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToProfile: (userId: string) => () => void;
  subscribeToQuests: (userId: string) => () => void;
  subscribeToCompletions: (userId: string) => () => void;
}

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

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
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
          .eq('id', userId);

        if (updateError) throw updateError;

        // Update local state immediately
        updateProfile(statUpdates);
        addTodayCompletion(questId);
        updateQuest(questId, {
          current_streak: newStreak,
          best_streak: Math.max(newStreak, currentStreak),
          total_completions: profile.total_completions + 1,
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
      }
    },
    
    // Initialize all user data
    initializeUserData: async (userId) => {
      const { setProfileLoading, setQuestsLoading, setCompletionsLoading } = get();
      
      try {
        console.log('Initializing user data for:', userId);
        
        // Set loading states
        setProfileLoading(true);
        setQuestsLoading(true);
        setCompletionsLoading(true);
        
        // Fetch all data in parallel
        const [profileResult, questsResult, completionsResult] = await Promise.all([
          supabase.from('users').select('*').eq('id', userId).maybeSingle(),
          supabase.from('quests').select('*').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false }),
          supabase.from('quest_completions').select('quest_id').eq('user_id', userId).eq('completed_at', new Date().toISOString().split('T')[0])
        ]);
        
        console.log('Profile result:', profileResult);
        console.log('Quests result:', questsResult);
        console.log('Completions result:', completionsResult);
        
        // Update state
        if (profileResult.data) {
          console.log('Setting profile from initialization:', profileResult.data.name);
          set({ profile: profileResult.data });
        } else {
          console.log('No profile found for user:', userId);
          set({ profile: null });
        }
        
        if (questsResult.data) {
          set({ quests: questsResult.data });
        }
        
        if (completionsResult.data) {
          const completedIds = new Set(completionsResult.data.map(c => c.quest_id));
          set({ todayCompletions: completedIds });
        }
        
      } catch (error) {
        console.error('Error initializing user data:', error);
      } finally {
        setProfileLoading(false);
        setQuestsLoading(false);
        setCompletionsLoading(false);
      }
    },
    
    // Real-time subscriptions
    subscribeToProfile: (userId) => {
      const subscription = supabase
        .channel(`profile-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log('Profile change received:', payload);
            if (payload.eventType === 'INSERT' && payload.new) {
              console.log('Profile inserted via real-time:', payload.new);
              set({ profile: payload.new as UserProfile });
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              console.log('Profile updated via real-time:', payload.new);
              set({ profile: payload.new as UserProfile });
            }
          }
        )
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    },
    
    subscribeToQuests: (userId) => {
      const subscription = supabase
        .channel(`quests-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quests',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Quest change received:', payload);
            const { updateQuest, addQuest, setQuests } = get();
            
            if (payload.eventType === 'INSERT' && payload.new) {
              addQuest(payload.new as Quest);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              updateQuest(payload.new.id, payload.new as Quest);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const quests = get().quests.filter(q => q.id !== payload.old.id);
              setQuests(quests);
            }
          }
        )
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    },
    
    subscribeToCompletions: (userId) => {
      const today = new Date().toISOString().split('T')[0];
      
      const subscription = supabase
        .channel(`completions-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'quest_completions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Completion change received:', payload);
            if (payload.new && payload.new.completed_at === today) {
              const { addTodayCompletion } = get();
              addTodayCompletion(payload.new.quest_id);
            }
          }
        )
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }))
);