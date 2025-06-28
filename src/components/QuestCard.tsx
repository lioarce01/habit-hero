import React, { useState, useEffect } from 'react';
import { Database } from '../lib/database.types';
import { Sword, Book, Heart, Leaf, Star, Flame, CheckCircle2 } from 'lucide-react';
import { useQuestCompletions } from '../hooks/useQuestCompletions';

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

const statColors = {
  power: 'red',
  wisdom: 'blue', 
  vitality: 'green',
  spirit: 'purple'
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const { isQuestCompletedToday, completeQuest } = useQuestCompletions();

  const StatIcon = statIcons[quest.stat_type];
  const statColor = statColors[quest.stat_type];

  // Check if quest is completed today using the hook
  const isCompleted = isQuestCompletedToday(quest.id);

  const handleComplete = async () => {
    if (isCompleted || loading) return;

    setLoading(true);
    try {
      await completeQuest(quest.id, quest.difficulty, quest.stat_type, quest.current_streak);
      onComplete(); // This will trigger a refetch in the parent component
    } catch (error) {
      console.error('Error completing quest:', error);
      // You could add a toast notification here for better UX
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
    <div className={`rounded-xl border-2 p-6 transition-all duration-300 transform hover:scale-105 shadow-lg
      ${isCompleted 
        ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-500 opacity-75' 
        : `bg-gradient-to-r from-gray-800 to-gray-900 border-${statColor}-500 hover:border-${statColor}-400 hover:shadow-${statColor}-500/25`
      }`}>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full bg-${statColor}-600 bg-opacity-20 border border-${statColor}-500 
              flex items-center justify-center`}>
              <StatIcon className={`w-5 h-5 text-${statColor}-400`} />
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
            className={`px-6 py-2 bg-gradient-to-r from-${statColor}-600 to-${statColor}-700 
              text-white rounded-lg hover:from-${statColor}-500 hover:to-${statColor}-600 
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
  );
};