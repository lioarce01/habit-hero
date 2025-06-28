import React from 'react';
import { Database } from '../lib/database.types';
import { QuestCard } from './QuestCard';
import { Scroll, Plus } from 'lucide-react';

type Quest = Database['public']['Tables']['quests']['Row'];

interface QuestBoardProps {
  quests: Quest[];
  onAddQuest: () => void;
  onQuestComplete: () => void;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ 
  quests, 
  onAddQuest,
  onQuestComplete
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scroll className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Daily Quests</h2>
        </div>
        
        <button
          onClick={onAddQuest}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 
            text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all 
            transform hover:scale-105 font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Quest
        </button>
      </div>

      {quests.length > 0 ? (
        <div className="grid gap-4">
          {quests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onQuestComplete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Scroll className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Quests Available</h3>
          <p className="text-gray-500 mb-6">Create your first epic quest to begin your adventure!</p>
          <button
            onClick={onAddQuest}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white 
              rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all 
              transform hover:scale-105 font-semibold"
          >
            Create First Quest
          </button>
        </div>
      )}
    </div>
  );
};