import { Hero, Quest } from '../types';

export const calculateXPToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateQuestXP = (difficulty: number, streak: number): number => {
  const baseXP = difficulty * 25;
  const streakMultiplier = Math.min(1 + (streak * 0.1), 2.5);
  return Math.floor(baseXP * streakMultiplier);
};

export const calculateStatGain = (difficulty: number): number => {
  return difficulty;
};

export const checkLevelUp = (hero: Hero): { leveledUp: boolean; newLevel: number } => {
  const requiredXP = calculateXPToNextLevel(hero.level);
  if (hero.xp >= requiredXP) {
    return { leveledUp: true, newLevel: hero.level + 1 };
  }
  return { leveledUp: false, newLevel: hero.level };
};

export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 2.5;
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
};

export const getTitleForLevel = (level: number): string => {
  if (level >= 50) return 'Legendary Hero';
  if (level >= 40) return 'Epic Champion';
  if (level >= 30) return 'Master Adventurer';
  if (level >= 20) return 'Veteran Quest-Walker';
  if (level >= 10) return 'Seasoned Explorer';
  if (level >= 5) return 'Brave Wanderer';
  return 'Novice Hero';
};

export const getClassColor = (heroClass: string): string => {
  const colors = {
    warrior: 'red',
    mage: 'blue',
    paladin: 'yellow',
    ranger: 'green'
  };
  return colors[heroClass as keyof typeof colors] || 'gray';
};