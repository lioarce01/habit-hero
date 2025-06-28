import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-700 rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-700 rounded-lg h-3 w-1/2"></div>
    </div>
  );
};