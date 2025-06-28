import React, { useState } from 'react';
import { Database } from '../lib/database.types';
import { Sword, Book, Heart, Leaf, Star, Flame, CheckCircle2, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';

type Quest = Database['public']['Tables']['quests']['Row'];

interface QuestCardProps {
  quest: Quest;
  onComplete: () => void;
}

const statIcons = {
  power: Sword,
  wisdom: Book,
  vitality: Heart,
  spirit: Leaf
};

const getStatColorClasses = (statType: string) => {
  const colorClasses = {
    power: {
      bg: 'bg-red-600',
      bgOpacity: 'bg-red-600 bg-opacity-20',
      border: 'border-red-500',
      text: 'text-red-400',
      gradient: 'from-red-600 to-red-700',
      hoverGradient: 'hover:from-red-500 hover:to-red-600',
      borderHover: 'hover:border-red-400',
      shadow: 'hover:shadow-red-500/25'
    },
    wisdom: {
      bg: 'bg-blue-600',
      bgOpacity: 'bg-blue-600 bg-opacity-20',
      border: 'border-blue-500',
      text: 'text-blue-400',
      gradient: 'from-blue-600 to-blue-700',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-600',
      borderHover: 'hover:border-blue-400',
      shadow: 'hover:shadow-blue-500/25'
    },
    vitality: {
      bg: 'bg-green-600',
      bgOpacity: 'bg-green-600 bg-opacity-20',
      border: 'border-green-500',
      text: 'text-green-400',
      gradient: 'from-green-600 to-green-700',
      hoverGradient: 'hover:from-green-500 hover:to-green-600',
      borderHover: 'hover:border-green-400',
      shadow: 'hover:shadow-green-500/25'
    },
    spirit: {
      bg: 'bg-purple-600',
      bgOpacity: 'bg-purple-600 bg-opacity-20',
      border: 'border-purple-500',
      text: 'text-purple-400',
      gradient: 'from-purple-600 to-purple-700',
      hoverGradient: 'hover:from-purple-500 hover:to-purple-600',
      borderHover: 'hover:border-purple-400',
      shadow: 'hover:shadow-purple-500/25'
    }
  };
  return colorClasses[statType as keyof typeof colorClasses] || colorClasses.power;
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<any>(null);
  
  const { user } = useAuth();
  const { completeQuest, isQuestCompletedToday } = useGameStore();

  const StatIcon = statIcons[quest.stat_type];
  const colorClasses = getStatColorClasses(quest.stat_type);

  // Check if quest is completed today using the store
  const isCompleted = isQuestCompletedToday(quest.id);

  const handleComplete = async () => {
    if (isCompleted || loading || !user) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await completeQuest(quest.id, quest.difficulty, quest.stat_type, quest.current_streak, user.id);
      
      console.log('Quest completion result:', result);
      
      // Show level up animation if leveled up
      if (result.leveledUp) {
        setLevelUpData(result);
        setShowLevelUp(true);
        
        // Hide level up notification after 3 seconds
        setTimeout(() => {
          setShowLevelUp(false);
          setLevelUpData(null);
        }, 3000);
      }
      
      onComplete(); // Optional callback for parent component
    } catch (error: any) {
      console.error('Error completing quest:', error);
      setError(error.message || 'Failed to complete quest');
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuestXP = (difficulty: number, streak: number): number => {
    const baseXP = difficulty * 25;
    const streakMultiplier = Math.min(1 + (streak * 0.1), 2.5);
    return Math.floor(baseXP * streakMultiplier);
  };

  const getStreakMultiplier = (streak: number): number => {
    if (streak >= 30) return 2.5;
    if (streak >= 14) return 2.0;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  };

  const xpReward = calculateQuestXP(quest.difficulty, quest.current_streak);
  const streakMultiplier = getStreakMultiplier(quest.current_streak);

  const getDifficultyStars = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < quest.difficulty 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-500'
        }`}
      />
    ));
  };

  const getDifficultyLabel = () => {
    const labels = { 1: 'Novice', 2: 'Adept', 3: 'Master' };
    return labels[quest.difficulty];
  };

  return (
    <>
      <div className={`rounded-xl border-2 p-6 transition-all duration-300 transform hover:scale-105 shadow-lg relative
        ${isCompleted 
          ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-500 opacity-75' 
          : `bg-gradient-to-r from-gray-800 to-gray-900 ${colorClasses.border} ${colorClasses.borderHover} ${colorClasses.shadow}`
        }`}>
        
        {/* Level Up Notification */}
        {showLevelUp && levelUpData && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl 
            border-2 border-yellow-400 flex items-center justify-center z-10 animate-pulse">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-spin" />
              <div className="text-2xl font-bold text-yellow-400 mb-1">LEVEL UP!</div>
              <div className="text-lg text-white">Level {levelUpData.newLevel}</div>
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full ${colorClasses.bgOpacity} ${colorClasses.border} 
                flex items-center justify-center`}>
                <StatIcon className={`w-5 h-5 ${colorClasses.text}`} />
              </div>
              
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                  {quest.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 capitalize">{quest.stat_type}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-xs text-gray-400">{getDifficultyLabel()}</span>
                </div>
              </div>
            </div>
            
            {quest.description && (
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                {quest.description}
              </p>
            )}

            {error && (
              <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-2 mb-3">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
          </div>

          {isCompleted && (
            <CheckCircle2 className="w-8 h-8 text-green-400 ml-4 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Difficulty */}
            <div className="flex items-center gap-1">
              {getDifficultyStars()}
            </div>

            {/* Streak */}
            {quest.current_streak > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">
                  {quest.current_streak} day{quest.current_streak !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* XP Reward */}
            <div className="text-sm text-yellow-400 font-semibold">
              +{xpReward} XP
              {streakMultiplier > 1 && (
                <span className="text-xs text-yellow-300 ml-1">
                  (x{streakMultiplier.toFixed(1)})
                </span>
              )}
            </div>
          </div>

          {!isCompleted && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className={`px-6 py-2 bg-gradient-to-r ${colorClasses.gradient} 
                text-white rounded-lg ${colorClasses.hoverGradient} 
                transition-all transform hover:scale-105 font-semibold shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Complete'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};