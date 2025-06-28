import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from './useAuth';

export const useGameData = () => {
  const { user, loading: authLoading } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);
  
  const {
    profile,
    profileLoading,
    quests,
    questsLoading,
    todayCompletions,
    completionsLoading,
    initializeUserData,
    isQuestCompletedToday,
    resetStore,
  } = useGameStore();

  useEffect(() => {
    const currentUserId = user?.id || null;
    const prevUserId = prevUserIdRef.current;

    // Only reset store if user actually changed (not just auth state events)
    if (prevUserId !== null && prevUserId !== currentUserId) {
      console.log('User changed, resetting store:', { prevUserId, currentUserId });
      resetStore();
    }

    // Update the ref
    prevUserIdRef.current = currentUserId;

    if (!user) {
      // Only reset if we had a user before
      if (prevUserId !== null) {
        resetStore();
      }
      return;
    }

    // Initialize data when user is available (only if we don't have data already)
    if (!profile && !profileLoading) {
      console.log('Initializing user data for:', user.id);
      initializeUserData(user.id);
    }
  }, [user?.id]); // Only depend on user ID, not the entire user object

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