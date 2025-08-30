import { Skill } from '@/types/gameTypes';

export const availableSkills: Skill[] = [
  {
    id: 'power_strike',
    name: 'Мощный удар',
    description: 'Наносит увеличенный урон противнику',
    manaCost: 15,
    damage: 25,
    icon: '/sword.png',
    unlocked: true,
    cooldown: 2
  },
  {
    id: 'heal',
    name: 'Исцеление',
    description: 'Восстанавливает здоровье',
    manaCost: 20,
    damage: 0, // Это лечение, не урон
    icon: '/healthpotion.png',
    unlocked: false,
    cooldown: 3
  },
  {
    id: 'fire_slash',
    name: 'Огненный удар',
    description: 'Мощная атака огнем',
    manaCost: 25,
    damage: 35,
    icon: '/torch.png',
    unlocked: false,
    cooldown: 4
  },
  {
    id: 'heavy_strike',
    name: 'Тяжелый удар',
    description: 'Станит противника на 1 ход с вероятностью 80%',
    manaCost: 20,
    damage: 20,
    icon: '/old_sword.png',
    unlocked: false,
    cooldown: 5
  },
  {
    id: 'sand_in_eyes',
    name: 'Песок в глаза',
    description: 'Ослепляет противника на 1 ход, снижая его уворот',
    manaCost: 15,
    damage: 10,
    icon: '/trash_nail.png',
    unlocked: false,
    cooldown: 3
  },
  {
    id: 'fury_cut',
    name: 'Яростный порез',
    description: 'Накладывает кровотечение на 2 хода с вероятностью 80% (5% здоровья за ход)',
    manaCost: 25,
    damage: 15,
    icon: '/sword.png',
    unlocked: false,
    cooldown: 4
  }
];

export const getSkillById = (id: string): Skill | undefined => {
  return availableSkills.find(skill => skill.id === id);
};