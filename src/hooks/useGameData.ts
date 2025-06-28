import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from './useAuth';

export const useGameData = () => {
  const { user } = useAuth();
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
  } = useGameStore();

  useEffect(() => {
    if (!user) return;

    // Initialize data
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
    profileLoading,
    quests,
    questsLoading,
    todayCompletions,
    completionsLoading,
    isQuestCompletedToday,
    loading: profileLoading || questsLoading || completionsLoading,
  };
};