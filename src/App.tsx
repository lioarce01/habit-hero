import React from 'react';
import { AuthForm } from './components/AuthForm';
import { HeroCreation } from './components/HeroCreation';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { useGameData } from './hooks/useGameData';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { profile, profileLoading } = useGameData();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your epic adventure...</p>
        </div>
      </div>
    );
  }

  // Show auth form if no user
  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  // Show loading while fetching profile (only after user is confirmed)
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Preparing your hero...</p>
        </div>
      </div>
    );
  }

  // Show hero creation if no profile exists
  if (!profile) {
    return <HeroCreation onHeroCreated={() => {}} />;
  }

  // Show dashboard if everything is ready
  return <Dashboard />;
}

export default App;