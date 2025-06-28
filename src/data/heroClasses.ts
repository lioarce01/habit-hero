import { HeroClass } from '../types';

export const heroClasses: Record<string, HeroClass> = {
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