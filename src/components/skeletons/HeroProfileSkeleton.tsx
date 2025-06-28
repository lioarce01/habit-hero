import React from 'react';

export const HeroProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-2xl animate-pulse">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-700 mr-4 flex-shrink-0"></div>
        
        {/* Name and Title */}
        <div className="flex-1">
          <div className="bg-gray-700 rounded-lg h-6 w-48 mb-2"></div>
          <div className="bg-gray-700 rounded-lg h-4 w-32"></div>
        </div>
        
        {/* Level */}
        <div className="text-right">
          <div className="bg-gray-700 rounded-lg h-8 w-12 mb-1"></div>
          <div className="bg-gray-700 rounded-lg h-3 w-10"></div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="bg-gray-700 rounded-lg h-4 w-20"></div>
          <div className="bg-gray-700 rounded-lg h-3 w-16"></div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3"></div>
        <div className="bg-gray-700 rounded-lg h-3 w-32 mt-1"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <div className="bg-gray-600 rounded-lg h-4 w-16"></div>
              </div>
              <div className="bg-gray-600 rounded-lg h-5 w-8"></div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};