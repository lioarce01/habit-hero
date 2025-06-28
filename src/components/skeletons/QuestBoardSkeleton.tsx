import React from 'react';
import { QuestCardSkeleton } from './QuestCardSkeleton';
import { Scroll } from 'lucide-react';

export const QuestBoardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scroll className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Daily Quests</h2>
        </div>
        
        <div className="bg-gray-700 rounded-lg h-10 w-28 animate-pulse"></div>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((index) => (
          <QuestCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};