import React from 'react';
import { Database } from '../lib/database.types';
import { Sword, Book, Heart, Leaf, Crown, Zap } from 'lucide-react';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface HeroProfileProps {
  profile: UserProfile;
}

const statIcons = {
  power: Sword,
  wisdom: Book,
  vitality: Heart,
  spirit: Leaf
};

const getClassIcon = (heroClass: string) => {
  const icons = {
    warrior: Sword,
    mage: Book,
    paladin: Heart,
    ranger: Leaf
  };
  return icons[heroClass as keyof typeof icons] || Sword;
};

const getTitleForLevel = (level: number): string => {
  if (level >= 50) return 'Legendary Hero';
  if (level >= 40) return 'Epic Champion';
  if (level >= 30) return 'Master Adventurer';
  if (level >= 20) return 'Veteran Quest-Walker';
  if (level >= 10) return 'Seasoned Explorer';
  if (level >= 5) return 'Brave Wanderer';
  return 'Novice Hero';
};

// Fixed XP calculation functions
const calculateXPNeededForLevel = (level: number): number => {
  if (level <= 1) return 0;
  
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(100 * Math.pow(1.5, i - 1));
  }
  
  return totalXP;
};

const calculateXPToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const HeroProfile: React.FC<HeroProfileProps> = ({ profile }) => {
  const ClassIcon = getClassIcon(profile.hero_class);
  
  // Fixed XP progress calculation
  const currentLevelXP = calculateXPNeededForLevel(profile.level);
  const nextLevelXP = calculateXPNeededForLevel(profile.level + 1);
  const xpInCurrentLevel = profile.total_xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const xpProgress = Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
  
  console.log('XP Progress calculation:', {
    level: profile.level,
    totalXP: profile.total_xp,
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpProgress
  });
  
  const getStatColor = (statType: string) => {
    const colors = {
      power: 'red',
      wisdom: 'blue',
      vitality: 'green',
      spirit: 'purple'
    };
    return colors[statType as keyof typeof colors] || 'gray';
  };

  const getClassColorClasses = () => {
    const colors = {
      warrior: 'from-red-600 to-red-800 border-red-500',
      mage: 'from-blue-600 to-blue-800 border-blue-500',
      paladin: 'from-yellow-600 to-yellow-800 border-yellow-500',
      ranger: 'from-green-600 to-green-800 border-green-500'
    };
    return colors[profile.hero_class] || 'from-gray-600 to-gray-800 border-gray-500';
  };

  const stats = {
    power: profile.power_stat,
    wisdom: profile.wisdom_stat,
    vitality: profile.vitality_stat,
    spirit: profile.spirit_stat
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-2xl">
      <div className="flex items-center mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getClassColorClasses()} 
          border-2 flex items-center justify-center mr-4 shadow-lg`}>
          <ClassIcon className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">{getTitleForLevel(profile.level)}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{profile.level}</div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Experience</span>
          </div>
          <span className="text-sm text-gray-400">
            {xpInCurrentLevel} / {xpNeededForNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Total XP: {profile.total_xp} | Next Level: {nextLevelXP} XP
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(stats).map(([statType, value]) => {
          const StatIcon = statIcons[statType as keyof typeof statIcons];
          const color = getStatColor(statType);
          
          return (
            <div key={statType} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatIcon className={`w-4 h-4 text-${color}-400`} />
                  <span className="text-sm text-gray-300 capitalize font-medium">{statType}</span>
                </div>
                <span className="font-bold text-white">{value}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-full bg-${color}-500 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};