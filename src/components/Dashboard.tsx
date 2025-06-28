import React, { useState } from 'react';
import { HeroProfile } from './HeroProfile';
import { QuestBoard } from './QuestBoard';
import { QuestManager } from './QuestManager';
import { useGameData } from '../hooks/useGameData';
import { useAuth } from '../hooks/useAuth';
import { LogOut, BarChart3 } from 'lucide-react';

type ActiveTab = 'quests' | 'progress';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quests');
  const [showQuestManager, setShowQuestManager] = useState(false);
  
  const { signOut } = useAuth();
  const { profile, quests, loading } = useGameData();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleQuestAdded = () => {
    // No need to manually refetch - real-time subscriptions handle this
    setShowQuestManager(false);
  };

  const handleQuestComplete = () => {
    // No need to manually refetch - real-time subscriptions handle this
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your epic adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 
              bg-clip-text text-transparent mb-2">
              HABIT HERO
            </h1>
            <p className="text-gray-400">Your Epic Adventure Continues...</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 
              text-gray-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Hero Profile */}
        <div className="mb-8">
          <HeroProfile profile={profile} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{quests.length}</div>
            <div className="text-sm text-gray-400">Active Quests</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{profile.level}</div>
            <div className="text-sm text-gray-400">Hero Level</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{profile.total_xp}</div>
            <div className="text-sm text-gray-400">Total Experience</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1 mb-8">
          <button
            onClick={() => setActiveTab('quests')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
              activeTab === 'quests'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            ⚔️ Quests
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Progress
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'quests' && (
            <QuestBoard
              quests={quests}
              onAddQuest={() => setShowQuestManager(true)}
              onQuestComplete={handleQuestComplete}
            />
          )}
          
          {activeTab === 'progress' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-400 mb-4">Progress Overview</h3>
              <p className="text-gray-500">Coming soon! Track your epic journey with detailed statistics.</p>
            </div>
          )}
        </div>

        {/* Quest Manager Modal */}
        {showQuestManager && (
          <QuestManager
            onQuestAdded={handleQuestAdded}
            onClose={() => setShowQuestManager(false)}
          />
        )}
      </div>
    </div>
  );
};