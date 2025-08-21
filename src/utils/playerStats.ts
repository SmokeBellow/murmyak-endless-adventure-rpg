import { Player } from '@/types/gameTypes';

// Расчет скорости передвижения на основе ловкости
export const calculateMovementSpeed = (agility: number): number => {
  const baseSpeed = 100; // базовая скорость анимации в мс
  const agilityBonus = Math.floor(agility * 2); // каждая единица ловкости дает 2% скорости
  return Math.max(50, baseSpeed - agilityBonus); // минимум 50мс, максимум ускорение
};

// Расчет шанса уворота на основе ловкости
export const calculateDodgeChance = (agility: number): number => {
  return Math.min(50, agility * 2); // максимум 50% шанс уворота, каждая единица ловкости дает 2%
};

// Расчет шанса критического урона на основе удачи
export const calculateCritChance = (luck: number): number => {
  return Math.min(25, luck * 1.5); // максимум 25% шанс крита, каждая единица удачи дает 1.5%
};

// Расчет шанса блокировки урона на основе силы
export const calculateBlockChance = (strength: number): number => {
  return Math.min(30, strength * 1); // максимум 30% шанс блока, каждая единица силы дает 1%
};

// Расчет регенерации здоровья на основе телосложения
export const calculateHealthRegen = (constitution: number): number => {
  return Math.floor(constitution * 0.2); // каждая единица телосложения дает 0.2 HP/сек
};

// Расчет регенерации маны на основе интеллекта
export const calculateManaRegen = (intelligence: number): number => {
  return Math.floor(intelligence * 0.15); // каждая единица интеллекта дает 0.15 MP/сек
};

// Проверка на уворот
export const rollDodge = (agility: number): boolean => {
  const dodgeChance = calculateDodgeChance(agility);
  return Math.random() * 100 < dodgeChance;
};

// Проверка на критический урон
export const rollCrit = (luck: number): boolean => {
  const critChance = calculateCritChance(luck);
  return Math.random() * 100 < critChance;
};

// Проверка на блокировку
export const rollBlock = (strength: number): boolean => {
  const blockChance = calculateBlockChance(strength);
  return Math.random() * 100 < blockChance;
};

// Расчет итогового урона с учетом критов и блоков
export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isBlocked: boolean;
  isDodged: boolean;
}

export const calculateDamage = (
  baseDamage: number, 
  attackerLuck: number, 
  defenderAgility: number, 
  defenderStrength: number
): DamageResult => {
  // Проверка на уворот
  if (rollDodge(defenderAgility)) {
    return {
      damage: 0,
      isCrit: false,
      isBlocked: false,
      isDodged: true
    };
  }

  // Проверка на критический урон
  const isCrit = rollCrit(attackerLuck);
  let finalDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

  // Проверка на блокировку
  const isBlocked = rollBlock(defenderStrength);
  if (isBlocked) {
    finalDamage = Math.floor(finalDamage * 0.5); // блок снижает урон на 50%
  }

  return {
    damage: Math.max(1, finalDamage), // минимум 1 урон
    isCrit,
    isBlocked,
    isDodged: false
  };
};