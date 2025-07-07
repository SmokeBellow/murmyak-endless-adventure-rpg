export interface Player {
  name: string;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  isMoving: boolean;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  experience: number;
  level: number;
  coins: number;
  inventory: Item[];
  equipment: Equipment;
  questProgress: {
    visitedMerchant: boolean;
    usedFountain: boolean;
  };
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
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
  type: 'merchant' | 'elder' | 'blacksmith';
  dialogue: string[];
  quests?: Quest[];
  shop?: Item[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'active' | 'completed' | 'locked';
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

export type GameScreen = 'intro' | 'game';
export type MenuType = 'none' | 'inventory' | 'equipment' | 'quests' | 'trade';