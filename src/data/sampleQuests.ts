import { Quest } from '../types';

export const sampleQuests: Quest[] = [
  {
    id: '1',
    name: 'The Dawn Warrior Ritual',
    description: 'Rise with the sun and conquer 30 minutes of movement',
    difficulty: 2,
    statType: 'power',
    streak: 0,
    completedToday: false,
    lastCompleted: null,
    totalCompletions: 0
  },
  {
    id: '2', 
    name: 'Scroll of Ancient Knowledge',
    description: 'Study the sacred texts for 20 minutes',
    difficulty: 1,
    statType: 'wisdom',
    streak: 0,
    completedToday: false,
    lastCompleted: null,
    totalCompletions: 0
  },
  {
    id: '3',
    name: 'Elixir of Life Quest',
    description: 'Consume 8 glasses of the crystal clear potion',
    difficulty: 1,
    statType: 'vitality',
    streak: 0,
    completedToday: false,
    lastCompleted: null,
    totalCompletions: 0
  },
  {
    id: '4',
    name: 'Meditation of Inner Peace',
    description: 'Find tranquility through 10 minutes of mindful breathing',
    difficulty: 2,
    statType: 'spirit',
    streak: 0,
    completedToday: false,
    lastCompleted: null,
    totalCompletions: 0
  }
];