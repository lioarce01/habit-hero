import React from 'react';
import { AuthForm } from './components/AuthForm';
import { HeroCreation } from './components/HeroCreation';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { useUserProfile } from './hooks/useUserProfile';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your epic adventure...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  if (!profile) {
    return <HeroCreation onHeroCreated={() => {}} />;
  }

  return <Dashboard profile={profile} />;
}

export default App;