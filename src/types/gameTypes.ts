export interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  damage: number;
  icon: string;
  unlocked: boolean;
  cooldown: number; // Кулдаун в ходах
  class: 'warrior' | 'rogue' | 'mage'; // Класс умения
}

export interface PlayerStats {
  strength: number;
  agility: number;
  intelligence: number;
  constitution: number;
  luck: number;
}

export interface Player {
  name: string;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  isMoving: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  experience: number;
  level: number;
  coins: number;
  skillSlots: [string | null, string | null, string | null]; // 3 слота для умений
  skillCooldowns: { [skillId: string]: number }; // Отслеживание кулдаунов умений
  inventory: Item[];
  equipment: Equipment;
  stats: PlayerStats;
  unallocatedPoints: number;
  questProgress: {
    visitedMerchant: boolean;
    usedFountain: boolean;
    talkedToMerchant: boolean;
    talkedToBlacksmith: boolean;
    firstMerchantTalk: boolean;
    firstBlacksmithTalk: boolean;
  };
  skillUsageStats: {
    warrior: number;
    rogue: number;
    mage: number;
  };
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc' | 'skill';
  slot?: 'head' | 'chest' | 'legs' | 'weapon' | 'shield';
  stats?: {
    damage?: number;
    armor?: number;
    health?: number;
    mana?: number;
  };
  description: string;
  icon: string;
  price?: number;
  quantity?: number;
  stackable?: boolean;
  maxStack?: number;
  skillId?: string; // For skill items
}

export interface Equipment {
  head: Item | null;
  chest: Item | null;
  legs: Item | null;
  weapon: Item | null;
  shield: Item | null;
}

export interface NPC {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'merchant' | 'elder' | 'blacksmith' | 'mage' | 'scout' | 'guardian';
  dialogue: string[];
  quests?: Quest[];
  shop?: Item[];
  visible?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'active' | 'completed' | 'locked';
  repeatable?: boolean;
  giver: string; // NPC id who gives this quest
  objectives: {
    description: string;
    completed: boolean;
  }[];
  rewards: {
    experience: number;
    coins?: number;
    items?: Item[];
  };
}

export interface Enemy {
  id: string;
  name: string;
  type: 'bat' | 'rat';
  position: { x: number; y: number };
  spawnPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  isMoving: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  attackRange: number;
  aggressionRange: number;
  wanderRadius: number;
  lastAttack: number;
  attackCooldown: number;
  isAttacking: boolean;
  isDead: boolean;
  damageReduction: number; // Снижение урона в процентах (0-100)
}

export type GameScreen = 'intro' | 'game' | 'battle' | 'battle-victory' | 'battle-defeat';
export type MenuType = 'none' | 'inventory' | 'equipment' | 'quests' | 'trade' | 'sidebar' | 'stats' | 'skills';
export type LocationType = 'village' | 'abandoned-mines';

export interface BattleState {
  player: Player;
  enemy: Enemy;
  location: LocationType;
  playerAction: 'attack' | 'skill' | 'item' | 'fleeing' | null;
  turn: 'player' | 'enemy';
  skillCooldown: number;
}

export interface BattleResult {
  victory: boolean;
  experienceGained: number;
  coinsGained: number;
  lootItems: Item[];
}