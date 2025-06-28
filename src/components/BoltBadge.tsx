import React from 'react';

export const BoltBadge: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-105 hover:rotate-3 duration-300"
        title="Powered by Bolt.new"
      >
        <img
          src="/white_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-16 h-16 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
        />
      </a>
    </div>
  );
};