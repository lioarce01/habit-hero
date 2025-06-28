import React, { useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { HeroCreation } from './components/HeroCreation';
import { Dashboard } from './components/Dashboard';
import { BoltBadge } from './components/BoltBadge';
import { useAuth } from './hooks/useAuth';
import { useGameData } from './hooks/useGameData';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { profile, profileLoading } = useGameData();

  // Debug logging
  useEffect(() => {
    console.log('App state:', { 
      user: user?.id, 
      authLoading, 
      profile: profile?.name, 
      profileLoading 
    });
  }, [user, authLoading, profile, profileLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <BoltBadge />
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-orange-400 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-semibold">Loading your epic adventure...</p>
            <p className="text-gray-400 text-sm">Preparing the realm for your return</p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth form if no user
  if (!user) {
    return (
      <>
        <BoltBadge />
        <AuthForm onSuccess={() => {}} />
      </>
    );
  }

  // Show loading while fetching profile (only after user is confirmed)
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <BoltBadge />
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-semibold">Preparing your hero...</p>
            <p className="text-gray-400 text-sm">Gathering your legendary equipment</p>
          </div>
        </div>
      </div>
    );
  }

  // Show hero creation if no profile exists
  if (!profile) {
    return (
      <>
        <BoltBadge />
        <HeroCreation onHeroCreated={() => {
          console.log('Hero creation completed, should redirect to dashboard');
          // The App component will automatically re-render when the profile is set in the store
        }} />
      </>
    );
  }

  // Show dashboard if everything is ready
  return (
    <>
      <BoltBadge />
      <Dashboard />
    </>
  );
}

export default App;