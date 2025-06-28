import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from './useAuth';

export const useGameData = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    profileLoading,
    quests,
    questsLoading,
    todayCompletions,
    completionsLoading,
    initializeUserData,
    subscribeToProfile,
    subscribeToQuests,
    subscribeToCompletions,
    isQuestCompletedToday,
    resetStore,
  } = useGameStore();

  useEffect(() => {
    if (!user) {
      // Reset store when user logs out
      resetStore();
      return;
    }

    // Initialize data when user is available
    initializeUserData(user.id);

    // Set up real-time subscriptions
    const unsubscribeProfile = subscribeToProfile(user.id);
    const unsubscribeQuests = subscribeToQuests(user.id);
    const unsubscribeCompletions = subscribeToCompletions(user.id);

    // Cleanup subscriptions
    return () => {
      unsubscribeProfile();
      unsubscribeQuests();
      unsubscribeCompletions();
    };
  }, [user?.id]);

  return {
    profile,
    profileLoading: authLoading || profileLoading,
    quests,
    questsLoading,
    todayCompletions,
    completionsLoading,
    isQuestCompletedToday,
    loading: authLoading || profileLoading || questsLoading || completionsLoading,
  };
};