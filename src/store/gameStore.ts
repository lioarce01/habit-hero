import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Quest = Database['public']['Tables']['quests']['Row'];
type QuestCompletion = Database['public']['Tables']['quest_completions']['Row'];

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
  
  // Initialize data
  initializeUserData: (userId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToProfile: (userId: string) => () => void;
  subscribeToQuests: (userId: string) => () => void;
  subscribeToCompletions: (userId: string) => () => void;
}

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
    setProfile: (profile) => set({ profile }),
    
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
    setProfileLoading: (loading) => set({ profileLoading: loading }),
    setQuestsLoading: (loading) => set({ questsLoading: loading }),
    setCompletionsLoading: (loading) => set({ completionsLoading: loading }),
    
    // Reset store
    resetStore: () => set({
      profile: null,
      profileLoading: false,
      quests: [],
      questsLoading: false,
      todayCompletions: new Set(),
      completionsLoading: false,
    }),
    
    // Computed values
    isQuestCompletedToday: (questId) => get().todayCompletions.has(questId),
    
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
        .channel('profile-changes')
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
            if (payload.eventType === 'UPDATE' && payload.new) {
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
        .channel('quests-changes')
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
        .channel('completions-changes')
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