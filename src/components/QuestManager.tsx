import React, { useState } from 'react';
import { Sword, Book, Heart, Leaf, X, Plus } from 'lucide-react';
import { useQuests } from '../hooks/useQuests';

interface QuestManagerProps {
  onClose: () => void;
  onQuestAdded: () => void;
}

const statTypes = [
  { key: 'power', name: 'Power', icon: Sword, color: 'red' },
  { key: 'wisdom', name: 'Wisdom', icon: Book, color: 'blue' },
  { key: 'vitality', name: 'Vitality', icon: Heart, color: 'green' },
  { key: 'spirit', name: 'Spirit', icon: Leaf, color: 'purple' }
];

const difficultyLevels = [
  { value: 1, name: 'Novice', description: 'Easy daily habit' },
  { value: 2, name: 'Adept', description: 'Moderate challenge' },
  { value: 3, name: 'Master', description: 'Legendary feat' }
];

export const QuestManager: React.FC<QuestManagerProps> = ({ onClose, onQuestAdded }) => {
  const [questName, setQuestName] = useState('');
  const [questDescription, setQuestDescription] = useState('');
  const [selectedStat, setSelectedStat] = useState<string>('power');
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const { addQuest } = useQuests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questName.trim() || !questDescription.trim() || loading) return;

    setLoading(true);

    try {
      const { error } = await addQuest({
        name: questName.trim(),
        description: questDescription.trim(),
        stat_type: selectedStat as any,
        difficulty: selectedDifficulty
      });

      if (error) {
        console.error('Error adding quest:', error);
        return;
      }

      onQuestAdded();
      onClose();
    } catch (error) {
      console.error('Error adding quest:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Create New Quest</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center 
              justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quest Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Quest Name
            </label>
            <input
              type="text"
              value={questName}
              onChange={(e) => setQuestName(e.target.value)}
              placeholder="The Dawn Meditation Ritual..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 
                focus:ring-opacity-50 transition-colors"
              required
            />
          </div>

          {/* Quest Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Quest Description
            </label>
            <textarea
              value={questDescription}
              onChange={(e) => setQuestDescription(e.target.value)}
              placeholder="Embark on a journey of mindfulness for 10 minutes each morning..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 
                focus:ring-opacity-50 transition-colors resize-none"
              required
            />
          </div>

          {/* Stat Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Primary Stat
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statTypes.map(stat => {
                const StatIcon = stat.icon;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => setSelectedStat(stat.key)}
                    className={`p-4 rounded-lg border-2 transition-all text-left
                      ${selectedStat === stat.key
                        ? `border-${stat.color}-500 bg-${stat.color}-600 bg-opacity-20 text-white`
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <StatIcon className={`w-5 h-5 text-${stat.color}-400`} />
                      <span className="font-semibold">{stat.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Difficulty Level
            </label>
            <div className="space-y-2">
              {difficultyLevels.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSelectedDifficulty(level.value as 1 | 2 | 3)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left
                    ${selectedDifficulty === level.value
                      ? 'border-yellow-500 bg-yellow-600 bg-opacity-20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{level.name}</div>
                      <div className="text-sm opacity-75">{level.description}</div>
                    </div>
                    <div className="text-yellow-400 font-semibold">
                      +{level.value * 25} XP
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 
                transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!questName.trim() || !questDescription.trim() || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 
                text-white rounded-lg hover:from-yellow-400 hover:to-orange-400 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold
                transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Quest
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};