export interface Hero {
  name: string;
  class: 'warrior' | 'mage' | 'paladin' | 'ranger';
  level: number;
  xp: number;
  xpToNext: number;
  stats: {
    power: number;
    wisdom: number;
    vitality: number;
    spirit: number;
  };
  titles: string[];
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3;
  statType: 'power' | 'wisdom' | 'vitality' | 'spirit';
  streak: number;
  completedToday: boolean;
  lastCompleted: string | null;
  totalCompletions: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type HeroClass = {
  name: string;
  description: string;
  color: string;
  icon: string;
  primaryStat: keyof Hero['stats'];
};