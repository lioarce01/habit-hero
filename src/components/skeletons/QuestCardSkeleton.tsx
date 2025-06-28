import React from 'react';

export const QuestCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border-2 border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
            
            <div>
              {/* Quest Name */}
              <div className="bg-gray-700 rounded-lg h-5 w-48 mb-1"></div>
              {/* Quest Meta */}
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-gray-700 rounded-lg h-3 w-12"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="bg-gray-700 rounded-lg h-3 w-16"></div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2 mb-3">
            <div className="bg-gray-700 rounded-lg h-3 w-full"></div>
            <div className="bg-gray-700 rounded-lg h-3 w-3/4"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Difficulty Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-4 h-4 bg-gray-700 rounded"></div>
            ))}
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="bg-gray-700 rounded-lg h-4 w-12"></div>
          </div>

          {/* XP Reward */}
          <div className="bg-gray-700 rounded-lg h-4 w-16"></div>
        </div>

        {/* Complete Button */}
        <div className="bg-gray-700 rounded-lg h-9 w-20"></div>
      </div>
    </div>
  );
};