import { Skill } from '@/types/gameTypes';

export const availableSkills: Skill[] = [
  {
    id: 'power_strike',
    name: 'Мощный удар',
    description: 'Наносит увеличенный урон противнику',
    manaCost: 15,
    damage: 25,
    icon: '/sword.png',
    unlocked: true
  },
  {
    id: 'heal',
    name: 'Исцеление',
    description: 'Восстанавливает здоровье',
    manaCost: 20,
    damage: 0, // Это лечение, не урон
    icon: '/healthpotion.png',
    unlocked: false
  },
  {
    id: 'fire_slash',
    name: 'Огненный удар',
    description: 'Мощная атака огнем',
    manaCost: 25,
    damage: 35,
    icon: '/torch.png',
    unlocked: false
  }
];

export const getSkillById = (id: string): Skill | undefined => {
  return availableSkills.find(skill => skill.id === id);
};