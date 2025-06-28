import React, { useState } from 'react';
import { Sword, Book, Heart, Leaf, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';

const heroClasses = {
  warrior: {
    name: 'Warrior',
    description: 'Master of physical prowess and strength',
    color: 'red',
    icon: 'Sword',
    primaryStat: 'power'
  },
  mage: {
    name: 'Mage',
    description: 'Seeker of knowledge and wisdom',
    color: 'blue', 
    icon: 'Book',
    primaryStat: 'wisdom'
  },
  paladin: {
    name: 'Paladin',
    description: 'Guardian of health and vitality',
    color: 'yellow',
    icon: 'Heart',
    primaryStat: 'vitality'
  },
  ranger: {
    name: 'Ranger',
    description: 'Master of lifestyle and spirit',
    color: 'green',
    icon: 'Leaf',
    primaryStat: 'spirit'
  }
};

const iconMap = {
  Sword,
  Book, 
  Heart,
  Leaf
};

interface HeroCreationProps {
  onHeroCreated: () => void;
}

export const HeroCreation: React.FC<HeroCreationProps> = ({ onHeroCreated }) => {
  const [heroName, setHeroName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { createProfile } = useGameStore();

  const handleClassSelect = (classKey: string) => {
    setSelectedClass(classKey);
    setShowNameInput(true);
  };

  const handleCreateHero = async () => {
    if (!heroName.trim() || !selectedClass || loading || !user) return;

    setLoading(true);

    try {
      console.log('Creating hero profile:', { name: heroName.trim(), hero_class: selectedClass });
      
      const { data, error } = await createProfile({
        name: heroName.trim(),
        hero_class: selectedClass as any,
      }, user.id);

      if (error) {
        console.error('Error creating hero:', error);
        return;
      }

      console.log('Hero created successfully:', data);
      
      // Small delay to ensure the profile is properly set in the store
      setTimeout(() => {
        onHeroCreated();
      }, 100);
      
    } catch (error) {
      console.error('Error creating hero:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassColorClasses = (classKey: string) => {
    const colors = {
      warrior: 'from-red-600 to-red-800 border-red-500 text-red-100',
      mage: 'from-blue-600 to-blue-800 border-blue-500 text-blue-100',
      paladin: 'from-yellow-600 to-yellow-800 border-yellow-500 text-yellow-100',
      ranger: 'from-green-600 to-green-800 border-green-500 text-green-100'
    };
    return colors[classKey as keyof typeof colors] || 'from-gray-600 to-gray-800 border-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-yellow-400 mr-4 animate-pulse" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              HABIT HERO
            </h1>
            <Sparkles className="w-12 h-12 text-yellow-400 ml-4 animate-pulse" />
          </div>
          <p className="text-xl text-gray-300 mb-2">Transform Your Life Into An Epic Adventure</p>
          <p className="text-gray-400">Choose your path, young hero...</p>
        </div>

        {!showNameInput ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(heroClasses).map(([key, heroClass]) => {
              const IconComponent = iconMap[heroClass.icon as keyof typeof iconMap];
              return (
                <div
                  key={key}
                  onClick={() => handleClassSelect(key)}
                  className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-br ${getClassColorClasses(key)} 
                    cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl 
                    p-8 text-center group`}
                >
                  <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10">
                    <IconComponent className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">🗡️ {heroClass.name}</h3>
                    <p className="text-sm opacity-90 mb-4">{heroClass.description}</p>
                    <div className="text-xs opacity-75">
                      Primary Stat: <span className="font-semibold capitalize">{heroClass.primaryStat}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-30 rounded-xl transition-opacity"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className={`rounded-xl border-2 bg-gradient-to-br ${getClassColorClasses(selectedClass)} p-8 text-center mb-8`}>
              <div className="text-2xl font-bold mb-4">
                🗡️ {heroClasses[selectedClass as keyof typeof heroClasses].name} Chosen!
              </div>
              <p className="text-sm opacity-90">{heroClasses[selectedClass as keyof typeof heroClasses].description}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Name Your Hero</h3>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="Enter your heroic name..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                    placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 
                    focus:ring-opacity-50 transition-colors text-center text-lg"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && heroName.trim()) {
                      handleCreateHero();
                    }
                  }}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setSelectedClass('');
                    setHeroName('');
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 
                    transition-colors font-semibold disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateHero}
                  disabled={!heroName.trim() || loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 
                    text-white rounded-lg hover:from-yellow-400 hover:to-orange-400 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold
                    transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Begin Quest!'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};