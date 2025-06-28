import React from 'react';
import { Quest, Hero } from '../types';
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react';

interface ProgressOverviewProps {
  hero: Hero;
  quests: Quest[];
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ hero, quests }) => {
  const completedToday = quests.filter(q => q.completedToday).length;
  const totalQuests = quests.length;
  const completionRate = totalQuests > 0 ? (completedToday / totalQuests) * 100 : 0;
  
  const longestStreak = quests.length > 0 ? Math.max(...quests.map(q => q.streak)) : 0;
  const totalCompletions = quests.reduce((sum, q) => sum + q.totalCompletions, 0);
  
  const activeStreaks = quests.filter(q => q.streak > 0).length;

  const stats = [
    {
      icon: Target,
      label: 'Daily Progress',
      value: `${completedToday}/${totalQuests}`,
      subValue: `${completionRate.toFixed(0)}% Complete`,
      color: 'blue'
    },
    {
      icon: TrendingUp,
      label: 'Longest Streak',
      value: longestStreak,
      subValue: 'days',
      color: 'orange'
    },
    {
      icon: Trophy,
      label: 'Total Victories',
      value: totalCompletions,
      subValue: 'quests completed',
      color: 'yellow'
    },
    {
      icon: Calendar,
      label: 'Active Streaks',
      value: activeStreaks,
      subValue: 'ongoing quests',
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Progress Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center 
                hover:bg-gray-750 transition-colors"
            >
              <div className={`w-12 h-12 rounded-full bg-${stat.color}-600 bg-opacity-20 
                border border-${stat.color}-500 flex items-center justify-center mx-auto mb-4`}>
                <StatIcon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              
              <div className="text-sm text-gray-400 mb-2">
                {stat.label}
              </div>
              
              <div className="text-xs text-gray-500">
                {stat.subValue}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Achievements */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🏆 Recent Achievements
        </h3>
        
        <div className="space-y-3">
          {hero.level >= 5 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-600 bg-opacity-20 rounded-lg border border-yellow-500">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                🏆
              </div>
              <div>
                <div className="font-semibold text-yellow-400">Level {hero.level} Achieved!</div>
                <div className="text-sm text-yellow-300">You've become a true adventurer</div>
              </div>
            </div>
          )}
          
          {longestStreak >= 7 && (
            <div className="flex items-center gap-3 p-3 bg-orange-600 bg-opacity-20 rounded-lg border border-orange-500">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                🔥
              </div>
              <div>
                <div className="font-semibold text-orange-400">Streak Master!</div>
                <div className="text-sm text-orange-300">Maintained a {longestStreak}-day streak</div>
              </div>
            </div>
          )}
          
          {totalCompletions >= 10 && (
            <div className="flex items-center gap-3 p-3 bg-green-600 bg-opacity-20 rounded-lg border border-green-500">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                ⚔️
              </div>
              <div>
                <div className="font-semibold text-green-400">Quest Veteran!</div>
                <div className="text-sm text-green-300">Completed {totalCompletions} total quests</div>
              </div>
            </div>
          )}
          
          {(hero.level < 5 && longestStreak < 7 && totalCompletions < 10) && (
            <div className="text-center py-6 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>Complete more quests to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};