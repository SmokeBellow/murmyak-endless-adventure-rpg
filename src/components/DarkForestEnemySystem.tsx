import { useCallback, useEffect, useState } from 'react';
import { Enemy, Player } from '@/types/gameTypes';

interface DarkForestEnemySystemProps {
  player: Player;
  onPlayerTakeDamage: (damage: number) => void;
  onBattleStart: (enemy: Enemy) => void;
  isInBattle?: boolean;
}

// Dark Forest obstacles (trees from DarkForestMap)
const forestObstacles = [
  // Border trees
  { x: 0, y: 0, w: 2000, h: 100 }, // Top border
  { x: 0, y: 0, w: 100, h: 2000 }, // Left border
  { x: 1900, y: 0, w: 100, h: 2000 }, // Right border
  { x: 0, y: 1900, w: 2000, h: 100 }, // Bottom border
  
  // Entrance path opening - top center for return to village
  { x: 900, y: 0, w: 200, h: 0 }, // Clear entrance at top
  
  // Scattered trees in forest
  { x: 200, y: 200, w: 80, h: 80 },
  { x: 350, y: 180, w: 60, h: 60 },
  { x: 450, y: 300, w: 70, h: 70 },
  { x: 600, y: 250, w: 90, h: 90 },
  { x: 800, y: 200, w: 75, h: 75 },
  { x: 1200, y: 180, w: 85, h: 85 },
  { x: 1400, y: 280, w: 65, h: 65 },
  { x: 1600, y: 220, w: 80, h: 80 },
  
  { x: 150, y: 500, w: 70, h: 70 },
  { x: 300, y: 450, w: 80, h: 80 },
  { x: 500, y: 400, w: 90, h: 90 },
  { x: 750, y: 480, w: 75, h: 75 },
  { x: 1000, y: 420, w: 85, h: 85 },
  { x: 1250, y: 470, w: 70, h: 70 },
  { x: 1500, y: 450, w: 80, h: 80 },
  { x: 1750, y: 500, w: 65, h: 65 },
  
  { x: 250, y: 800, w: 85, h: 85 },
  { x: 400, y: 750, w: 70, h: 70 },
  { x: 650, y: 800, w: 80, h: 80 },
  { x: 900, y: 750, w: 90, h: 90 },
  { x: 1150, y: 780, w: 75, h: 75 },
  { x: 1400, y: 720, w: 85, h: 85 },
  { x: 1650, y: 800, w: 70, h: 70 },
  
  { x: 180, y: 1200, w: 80, h: 80 },
  { x: 380, y: 1150, w: 75, h: 75 },
  { x: 580, y: 1200, w: 85, h: 85 },
  { x: 780, y: 1180, w: 70, h: 70 },
  { x: 1080, y: 1220, w: 80, h: 80 },
  { x: 1280, y: 1150, w: 90, h: 90 },
  { x: 1480, y: 1200, w: 75, h: 75 },
  { x: 1680, y: 1180, w: 65, h: 65 },
  
  { x: 300, y: 1500, w: 70, h: 70 },
  { x: 500, y: 1480, w: 85, h: 85 },
  { x: 700, y: 1520, w: 80, h: 80 },
  { x: 1000, y: 1500, w: 75, h: 75 },
  { x: 1200, y: 1480, w: 90, h: 90 },
  { x: 1400, y: 1520, w: 70, h: 70 },
  { x: 1600, y: 1500, w: 85, h: 85 },
];

export const useDarkForestEnemySystem = ({ player, onPlayerTakeDamage, onBattleStart, isInBattle = false }: DarkForestEnemySystemProps) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  // Helper: check if a point is inside any tree/obstacle
  const isPointInWall = (px: number, py: number) => {
    for (const r of forestObstacles) {
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return true;
    }
    return false;
  };

  // Helper: find nearest safe position near a point
  const findSafePositionNear = (x: number, y: number) => {
    if (!isPointInWall(x, y)) return { x, y };
    const step = 10;
    const maxRadius = 300;
    for (let radius = step; radius <= maxRadius; radius += step) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const px = Math.max(120, Math.min(1880, Math.round(x + Math.cos(angle) * radius)));
        const py = Math.max(120, Math.min(1880, Math.round(y + Math.sin(angle) * radius)));
        if (!isPointInWall(px, py)) return { x: px, y: py };
      }
    }
    return { x: 1000, y: 1000 };
  };

  // Initialize Dark Forest enemies
  useEffect(() => {
    const initialEnemies: Enemy[] = [
      // Темные волки
      {
        id: 'dark-wolf-1',
        name: 'Темный волк',
        type: 'wolf',
        position: { x: 400, y: 300 },
        spawnPosition: { x: 400, y: 300 },
        targetPosition: { x: 400, y: 300 },
        isMoving: false,
        direction: 'down',
        health: 45,
        maxHealth: 45,
        damage: 12,
        speed: 2.0,
        attackRange: 60,
        aggressionRange: 120,
        wanderRadius: 80,
        lastAttack: 0,
        attackCooldown: 1800,
        isAttacking: false,
        isDead: false,
        damageReduction: 2
      },
      {
        id: 'dark-wolf-2',
        name: 'Темный волк',
        type: 'wolf',
        position: { x: 1300, y: 500 },
        spawnPosition: { x: 1300, y: 500 },
        targetPosition: { x: 1300, y: 500 },
        isMoving: false,
        direction: 'down',
        health: 45,
        maxHealth: 45,
        damage: 12,
        speed: 2.0,
        attackRange: 60,
        aggressionRange: 120,
        wanderRadius: 80,
        lastAttack: 0,
        attackCooldown: 1800,
        isAttacking: false,
        isDead: false,
        damageReduction: 2
      },
      {
        id: 'dark-wolf-3',
        name: 'Темный волк',
        type: 'wolf',
        position: { x: 700, y: 1100 },
        spawnPosition: { x: 700, y: 1100 },
        targetPosition: { x: 700, y: 1100 },
        isMoving: false,
        direction: 'down',
        health: 45,
        maxHealth: 45,
        damage: 12,
        speed: 2.0,
        attackRange: 60,
        aggressionRange: 120,
        wanderRadius: 80,
        lastAttack: 0,
        attackCooldown: 1800,
        isAttacking: false,
        isDead: false,
        damageReduction: 2
      },
      // Лесные духи
      {
        id: 'forest-spirit-1',
        name: 'Лесной дух',
        type: 'spirit',
        position: { x: 800, y: 600 },
        spawnPosition: { x: 800, y: 600 },
        targetPosition: { x: 800, y: 600 },
        isMoving: false,
        direction: 'down',
        health: 35,
        maxHealth: 35,
        damage: 15,
        speed: 1.8,
        attackRange: 70,
        aggressionRange: 100,
        wanderRadius: 60,
        lastAttack: 0,
        attackCooldown: 2500,
        isAttacking: false,
        isDead: false,
        damageReduction: 5
      },
      {
        id: 'forest-spirit-2',
        name: 'Лесной дух',
        type: 'spirit',
        position: { x: 1500, y: 800 },
        spawnPosition: { x: 1500, y: 800 },
        targetPosition: { x: 1500, y: 800 },
        isMoving: false,
        direction: 'down',
        health: 35,
        maxHealth: 35,
        damage: 15,
        speed: 1.8,
        attackRange: 70,
        aggressionRange: 100,
        wanderRadius: 60,
        lastAttack: 0,
        attackCooldown: 2500,
        isAttacking: false,
        isDead: false,
        damageReduction: 5
      },
      // Древние пауки
      {
        id: 'ancient-spider-1',
        name: 'Древний паук',
        type: 'spider',
        position: { x: 500, y: 900 },
        spawnPosition: { x: 500, y: 900 },
        targetPosition: { x: 500, y: 900 },
        isMoving: false,
        direction: 'down',
        health: 55,
        maxHealth: 55,
        damage: 18,
        speed: 1.5,
        attackRange: 80,
        aggressionRange: 150,
        wanderRadius: 70,
        lastAttack: 0,
        attackCooldown: 3000,
        isAttacking: false,
        isDead: false,
        damageReduction: 8
      },
      {
        id: 'ancient-spider-2',
        name: 'Древний паук',
        type: 'spider',
        position: { x: 1100, y: 1300 },
        spawnPosition: { x: 1100, y: 1300 },
        targetPosition: { x: 1100, y: 1300 },
        isMoving: false,
        direction: 'down',
        health: 55,
        maxHealth: 55,
        damage: 18,
        speed: 1.5,
        attackRange: 80,
        aggressionRange: 150,
        wanderRadius: 70,
        lastAttack: 0,
        attackCooldown: 3000,
        isAttacking: false,
        isDead: false,
        damageReduction: 8
      }
    ];

    setEnemies(initialEnemies.map(e => ({
      ...e,
      position: findSafePositionNear(e.position.x, e.position.y),
      spawnPosition: findSafePositionNear(e.spawnPosition.x, e.spawnPosition.y),
      targetPosition: findSafePositionNear(e.targetPosition.x, e.targetPosition.y)
    })));
  }, []);

  // Helper: check line of sight between two points (no trees blocking)
  const hasLineOfSight = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;

    let x = from.x;
    let y = from.y;

    const maxSteps = Math.max(dx, dy);
    for (let i = 0; i <= maxSteps; i++) {
      // Check if current point is in a tree
      if (isPointInWall(x, y)) {
        return false; // Line of sight blocked
      }

      // If we reached the target, line of sight is clear
      if (x === to.x && y === to.y) {
        return true;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return true; // No trees found on the line
  }, []);

  // Calculate distance between two points
  const getDistance = useCallback((pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }, []);

  // Get random position within wander radius
  const getRandomWanderPosition = useCallback((enemy: Enemy) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * enemy.wanderRadius;
    
    return {
      x: enemy.spawnPosition.x + Math.cos(angle) * distance,
      y: enemy.spawnPosition.y + Math.sin(angle) * distance
    };
  }, []);

  // Enemy AI update loop
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          if (enemy.isDead) return enemy;

          const distanceToPlayer = getDistance(enemy.position, player.position);

          // Check if player is in attack range AND has line of sight - start battle (only if not already in battle)
          if (distanceToPlayer <= enemy.attackRange && !isInBattle && hasLineOfSight(enemy.position, player.position)) {
            onBattleStart(enemy);
            return enemy;
          }
          
          // Check if player is in aggression range AND has line of sight - chase player
          if (distanceToPlayer <= enemy.aggressionRange && hasLineOfSight(enemy.position, player.position)) {
            const dx = player.position.x - enemy.position.x;
            const dy = player.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const moveX = (dx / distance) * enemy.speed;
              const moveY = (dy / distance) * enemy.speed;
              
              // Collision-aware movement (axis separated)
              let nextX = enemy.position.x;
              let nextY = enemy.position.y;
              const tryX = nextX + moveX;
              if (!isPointInWall(tryX, nextY)) nextX = tryX;
              const tryY = nextY + moveY;
              if (!isPointInWall(nextX, tryY)) nextY = tryY;
              
              // Update direction based on movement
              let direction = enemy.direction;
              if (Math.abs(moveX) > Math.abs(moveY)) {
                direction = moveX > 0 ? 'right' : 'left';
              } else {
                direction = moveY > 0 ? 'down' : 'up';
              }
              
              return {
                ...enemy,
                position: {
                  x: nextX,
                  y: nextY
                },
                direction,
                isMoving: true,
                isAttacking: false
              };
            }
          } else {
            // Wander around spawn point
            const distanceToTarget = getDistance(enemy.position, enemy.targetPosition);
            
            // If reached target or no target, pick new wander position
            if (distanceToTarget < 5 || (!enemy.isMoving && Math.random() < 0.01)) {
              const rnd = getRandomWanderPosition(enemy);
              const newTarget = findSafePositionNear(rnd.x, rnd.y);
              return {
                ...enemy,
                targetPosition: newTarget,
                isMoving: true,
                isAttacking: false
              };
            }
            
            // Move toward target position
            if (enemy.isMoving) {
              const dx = enemy.targetPosition.x - enemy.position.x;
              const dy = enemy.targetPosition.y - enemy.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                const moveX = (dx / distance) * (enemy.speed * 0.5); // Slower wandering
                const moveY = (dy / distance) * (enemy.speed * 0.5);
                
                // Collision-aware movement (axis separated)
                let nextX = enemy.position.x;
                let nextY = enemy.position.y;
                const tryX = nextX + moveX;
                if (!isPointInWall(tryX, nextY)) nextX = tryX;
                const tryY = nextY + moveY;
                if (!isPointInWall(nextX, tryY)) nextY = tryY;
                
                // Update direction based on movement
                let direction = enemy.direction;
                if (Math.abs(moveX) > Math.abs(moveY)) {
                  direction = moveX > 0 ? 'right' : 'left';
                } else {
                  direction = moveY > 0 ? 'down' : 'up';
                }
                
                return {
                  ...enemy,
                  position: {
                    x: nextX,
                    y: nextY
                  },
                  direction,
                  isAttacking: false
                };
              }
            }
          }

          return enemy;
        })
      );
    }, 50); // Update every 50ms for smooth movement

    return () => clearInterval(updateInterval);
  }, [player.position, getDistance, getRandomWanderPosition, hasLineOfSight, onBattleStart, isInBattle]);

  const attackEnemy = useCallback((enemyId: string, damage: number) => {
    setEnemies(prev => 
      prev.map(enemy => {
        if (enemy.id === enemyId) {
          const newHealth = Math.max(0, enemy.health - damage);
          return {
            ...enemy,
            health: newHealth,
            isDead: newHealth <= 0
          };
        }
        return enemy;
      })
    );
  }, []);

  const removeEnemy = useCallback((enemyId: string) => {
    setEnemies(prev => prev.filter(enemy => enemy.id !== enemyId));
    
    // Respawn after 5 minutes (300000ms)
    setTimeout(() => {
      setEnemies(prev => {
        // Check if enemy is already respawned
        if (prev.find(e => e.id === enemyId)) return prev;
        
        // Find original enemy data by id and respawn it
        const originalEnemies: Enemy[] = [
          {
            id: 'dark-wolf-1',
            name: 'Темный волк',
            type: 'wolf',
            position: { x: 400, y: 300 },
            spawnPosition: { x: 400, y: 300 },
            targetPosition: { x: 400, y: 300 },
            isMoving: false,
            direction: 'down',
            health: 45,
            maxHealth: 45,
            damage: 12,
            speed: 2.0,
            attackRange: 60,
            aggressionRange: 120,
            wanderRadius: 80,
            lastAttack: 0,
            attackCooldown: 1800,
            isAttacking: false,
            isDead: false,
            damageReduction: 2
          },
          {
            id: 'dark-wolf-2',
            name: 'Темный волк',
            type: 'wolf',
            position: { x: 1300, y: 500 },
            spawnPosition: { x: 1300, y: 500 },
            targetPosition: { x: 1300, y: 500 },
            isMoving: false,
            direction: 'down',
            health: 45,
            maxHealth: 45,
            damage: 12,
            speed: 2.0,
            attackRange: 60,
            aggressionRange: 120,
            wanderRadius: 80,
            lastAttack: 0,
            attackCooldown: 1800,
            isAttacking: false,
            isDead: false,
            damageReduction: 2
          },
          {
            id: 'dark-wolf-3',
            name: 'Темный волк',
            type: 'wolf',
            position: { x: 700, y: 1100 },
            spawnPosition: { x: 700, y: 1100 },
            targetPosition: { x: 700, y: 1100 },
            isMoving: false,
            direction: 'down',
            health: 45,
            maxHealth: 45,
            damage: 12,
            speed: 2.0,
            attackRange: 60,
            aggressionRange: 120,
            wanderRadius: 80,
            lastAttack: 0,
            attackCooldown: 1800,
            isAttacking: false,
            isDead: false,
            damageReduction: 2
          },
          {
            id: 'forest-spirit-1',
            name: 'Лесной дух',
            type: 'spirit',
            position: { x: 800, y: 600 },
            spawnPosition: { x: 800, y: 600 },
            targetPosition: { x: 800, y: 600 },
            isMoving: false,
            direction: 'down',
            health: 35,
            maxHealth: 35,
            damage: 15,
            speed: 1.8,
            attackRange: 70,
            aggressionRange: 100,
            wanderRadius: 60,
            lastAttack: 0,
            attackCooldown: 2500,
            isAttacking: false,
            isDead: false,
            damageReduction: 5
          },
          {
            id: 'forest-spirit-2',
            name: 'Лесной дух',
            type: 'spirit',
            position: { x: 1500, y: 800 },
            spawnPosition: { x: 1500, y: 800 },
            targetPosition: { x: 1500, y: 800 },
            isMoving: false,
            direction: 'down',
            health: 35,
            maxHealth: 35,
            damage: 15,
            speed: 1.8,
            attackRange: 70,
            aggressionRange: 100,
            wanderRadius: 60,
            lastAttack: 0,
            attackCooldown: 2500,
            isAttacking: false,
            isDead: false,
            damageReduction: 5
          },
          {
            id: 'ancient-spider-1',
            name: 'Древний паук',
            type: 'spider',
            position: { x: 500, y: 900 },
            spawnPosition: { x: 500, y: 900 },
            targetPosition: { x: 500, y: 900 },
            isMoving: false,
            direction: 'down',
            health: 55,
            maxHealth: 55,
            damage: 18,
            speed: 1.5,
            attackRange: 80,
            aggressionRange: 150,
            wanderRadius: 70,
            lastAttack: 0,
            attackCooldown: 3000,
            isAttacking: false,
            isDead: false,
            damageReduction: 8
          },
          {
            id: 'ancient-spider-2',
            name: 'Древний паук',
            type: 'spider',
            position: { x: 1100, y: 1300 },
            spawnPosition: { x: 1100, y: 1300 },
            targetPosition: { x: 1100, y: 1300 },
            isMoving: false,
            direction: 'down',
            health: 55,
            maxHealth: 55,
            damage: 18,
            speed: 1.5,
            attackRange: 80,
            aggressionRange: 150,
            wanderRadius: 70,
            lastAttack: 0,
            attackCooldown: 3000,
            isAttacking: false,
            isDead: false,
            damageReduction: 8
          }
        ];
        
        const originalEnemy = originalEnemies.find(e => e.id === enemyId);
        if (originalEnemy) {
          const respawnedEnemy = {
            ...originalEnemy,
            position: findSafePositionNear(originalEnemy.position.x, originalEnemy.position.y),
            spawnPosition: findSafePositionNear(originalEnemy.spawnPosition.x, originalEnemy.spawnPosition.y),
            targetPosition: findSafePositionNear(originalEnemy.targetPosition.x, originalEnemy.targetPosition.y),
            health: originalEnemy.maxHealth,
            isDead: false
          };
          
          return [...prev, respawnedEnemy];
        }
        
        return prev;
      });
    }, 300000); // 5 minutes
  }, []);

  return { enemies, attackEnemy, removeEnemy };
};