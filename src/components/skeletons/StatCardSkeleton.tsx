import React from 'react';

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center animate-pulse">
      <div className="bg-gray-700 rounded-lg h-8 w-12 mx-auto mb-2"></div>
      <div className="bg-gray-700 rounded-lg h-4 w-20 mx-auto"></div>
    </div>
  );
};