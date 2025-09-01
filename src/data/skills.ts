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
    cooldown: 2,
    class: 'warrior',
    level: 1
  },
  {
    id: 'heal',
    name: 'Исцеление',
    description: 'Восстанавливает здоровье',
    manaCost: 20,
    damage: 0, // Это лечение, не урон
    icon: '/healthpotion.png',
    unlocked: false,
    cooldown: 3,
    class: 'warrior',
    level: 1
  },
  {
    id: 'fire_slash',
    name: 'Огненный удар',
    description: 'Мощная атака огнем',
    manaCost: 25,
    damage: 35,
    icon: '/torch.png',
    unlocked: false,
    cooldown: 4,
    class: 'warrior',
    level: 1
  },
  {
    id: 'heavy_strike',
    name: 'Тяжелый удар',
    description: 'Станит противника на 1 ход с вероятностью 80%',
    manaCost: 20,
    damage: 20,
    icon: '/old_sword.png',
    unlocked: false,
    cooldown: 5,
    class: 'warrior',
    level: 1
  },
  {
    id: 'sand_in_eyes',
    name: 'Песок в глаза',
    description: 'Ослепляет противника на 1 ход, снижая его уворот',
    manaCost: 15,
    damage: 10,
    icon: '/trash_nail.png',
    unlocked: false,
    cooldown: 3,
    class: 'rogue',
    level: 1
  },
  {
    id: 'fury_cut',
    name: 'Яростный порез',
    description: 'Накладывает кровотечение на 2 хода с вероятностью 80% (5% здоровья за ход)',
    manaCost: 25,
    damage: 15,
    icon: '/sword.png',
    unlocked: false,
    cooldown: 4,
    class: 'rogue',
    level: 1
  },
  {
    id: 'fire_burst',
    name: 'Огненный всполох',
    description: 'Наносит урон огнем и поджигает противника на 2 хода с вероятностью 80%. Подожженная цель получает на 10% больше урона от огня',
    manaCost: 30,
    damage: 20,
    icon: '/torch.png',
    unlocked: false,
    cooldown: 4,
    class: 'mage',
    level: 1
  },
  {
    id: 'frost_chains',
    name: 'Морозные цепи',
    description: 'Замораживает цель, снижая шанс уклонения',
    manaCost: 25,
    damage: 15,
    icon: '/trash_rare_gem.png',
    unlocked: false,
    cooldown: 3,
    class: 'mage',
    level: 1
  },
  {
    id: 'mana_spark',
    name: 'Искра маны',
    description: 'Восстанавливает часть маны и усиливает магией следующую атаку',
    manaCost: 0,
    damage: 0,
    icon: '/trash_gem.png',
    unlocked: false,
    cooldown: 2,
    class: 'mage',
    level: 1
  },
  {
    id: 'shadow_veil',
    name: 'Вуаль тьмы',
    description: 'Увеличивает шанс уклонения игрока на 40% на 2 хода',
    manaCost: 20,
    damage: 0,
    icon: '/bat.png',
    unlocked: false,
    cooldown: 5,
    class: 'rogue',
    level: 1
  },
  {
    id: 'powerful_strike',
    name: 'Мощный удар',
    description: 'Наносит урон и оглушает противника с вероятностью 80% на 1 ход',
    manaCost: 20,
    damage: 30,
    icon: '/sword.png',
    unlocked: false,
    cooldown: 3,
    class: 'warrior',
    level: 1
  },
  {
    id: 'defensive_stance',
    name: 'Глухая оборона',
    description: 'Снижает урон по игроку на 2 хода на 40%, но снижает урон игрока на 2 хода на 20%',
    manaCost: 25,
    damage: 0,
    icon: '/shield_empty.png',
    unlocked: false,
    cooldown: 6,
    class: 'warrior',
    level: 1
  },
  {
    id: 'battle_cry',
    name: 'Боевой клич',
    description: 'Повышает урон игрока на 30% на один ход',
    manaCost: 15,
    damage: 0,
    icon: '/helmet_empty.png',
    unlocked: false,
    cooldown: 4,
    class: 'warrior',
    level: 1
  }
];

export const getSkillById = (id: string): Skill | undefined => {
  return availableSkills.find(skill => skill.id === id);
};