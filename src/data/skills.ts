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
  },
  {
    id: 'fire_burst',
    name: 'Огненный всполох',
    description: 'Наносит урон огнем и поджигает противника на 2 хода с вероятностью 80%. Подожженная цель получает на 10% больше урона от огня',
    manaCost: 30,
    damage: 20,
    icon: '/torch.png',
    unlocked: false,
    cooldown: 4
  },
  {
    id: 'frost_chains',
    name: 'Морозные цепи',
    description: 'Замораживает цель, снижая шанс уклонения',
    manaCost: 25,
    damage: 15,
    icon: '/trash_rare_gem.png',
    unlocked: false,
    cooldown: 3
  },
  {
    id: 'mana_spark',
    name: 'Искра маны',
    description: 'Восстанавливает часть маны и усиливает магией следующую атаку',
    manaCost: 0,
    damage: 0,
    icon: '/trash_gem.png',
    unlocked: false,
    cooldown: 2
  },
  {
    id: 'shadow_veil',
    name: 'Вуаль тьмы',
    description: 'Увеличивает шанс уклонения игрока на 40% на 2 хода',
    manaCost: 20,
    damage: 0,
    icon: '/bat.png',
    unlocked: false,
    cooldown: 5
  }
];

export const getSkillById = (id: string): Skill | undefined => {
  return availableSkills.find(skill => skill.id === id);
};