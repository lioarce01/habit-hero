import React from 'react';
import { HeroProfileSkeleton } from './HeroProfileSkeleton';
import { QuestBoardSkeleton } from './QuestBoardSkeleton';
import { LogOut, BarChart3, RefreshCw } from 'lucide-react';

export const DashboardSkeleton: React.FC = () => {
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
          
          <div className="flex items-center gap-2">
            <div className="bg-gray-700 rounded-lg h-10 w-10 animate-pulse"></div>
            <div className="bg-gray-700 rounded-lg h-10 w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Hero Profile Skeleton */}
        <div className="mb-8">
          <HeroProfileSkeleton />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center animate-pulse">
              <div className="bg-gray-700 rounded-lg h-8 w-12 mx-auto mb-2"></div>
              <div className="bg-gray-700 rounded-lg h-4 w-20 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1 mb-8">
          <div className="flex-1 py-3 px-4 rounded-md bg-blue-600 text-white font-semibold">
            ⚔️ Quests
          </div>
          <div className="flex-1 py-3 px-4 rounded-md text-gray-400 font-semibold flex items-center justify-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Progress
          </div>
        </div>

        {/* Quest Board Skeleton */}
        <div className="min-h-[400px]">
          <QuestBoardSkeleton />
        </div>
      </div>
    </div>
  );
};