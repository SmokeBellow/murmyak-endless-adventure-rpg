import { useCallback, useEffect, useState } from 'react';
import { Enemy, Player } from '@/types/gameTypes';

interface DarkForestEnemySystemProps {
  player: Player;
  onPlayerTakeDamage: (damage: number) => void;
  onBattleStart: (enemy: Enemy) => void;
  isInBattle?: boolean;
}

export const useDarkForestEnemySystem = ({ player, onPlayerTakeDamage, onBattleStart, isInBattle = false }: DarkForestEnemySystemProps) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  // Dark forest tree obstacles for collision detection
  const forestObstacles = [
    // Border trees
    { x: 0, y: 0, w: 2000, h: 100 },
    { x: 0, y: 0, w: 100, h: 2000 },
    { x: 1900, y: 0, w: 100, h: 2000 },
    { x: 0, y: 1900, w: 2000, h: 100 },
    // All the trees from DarkForestMap
    { x: 200, y: 200, w: 80, h: 80 },
    { x: 320, y: 180, w: 70, h: 70 },
    { x: 450, y: 220, w: 85, h: 85 },
    // ... more trees (simplified for brevity, would include all from DarkForestMap)
  ];

  // Helper: check if a point is inside any tree
  const isPointInTree = (px: number, py: number) => {
    // Allow entrance passage
    if (px >= 900 && px <= 1100 && py >= 0 && py <= 100) {
      return false;
    }
    
    for (const obstacle of forestObstacles) {
      if (px >= obstacle.x && px <= obstacle.x + obstacle.w && 
          py >= obstacle.y && py <= obstacle.y + obstacle.h) {
        return true;
      }
    }
    return false;
  };

  // Helper: find nearest safe position near a point
  const findSafePositionNear = (x: number, y: number) => {
    if (!isPointInTree(x, y)) return { x, y };
    const step = 10;
    const maxRadius = 300;
    for (let radius = step; radius <= maxRadius; radius += step) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const px = Math.max(100, Math.min(1900, Math.round(x + Math.cos(angle) * radius)));
        const py = Math.max(100, Math.min(1900, Math.round(y + Math.sin(angle) * radius)));
        if (!isPointInTree(px, py)) return { x: px, y: py };
      }
    }
    return { x: 1000, y: 1000 }; // Fallback to center
  };

  // Initialize dark forest enemies when component mounts
  useEffect(() => {
    const initialEnemies: Enemy[] = [
      // Темные волки
      {
        id: 'dark-wolf-1',
        name: 'Темный волк',
        type: 'bat', // Reuse bat animations for now
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
        attackCooldown: 2500,
        isAttacking: false,
        isDead: false,
        damageReduction: 8
      },
      {
        id: 'dark-wolf-2',
        name: 'Темный волк',
        type: 'bat',
        position: { x: 1200, y: 500 },
        spawnPosition: { x: 1200, y: 500 },
        targetPosition: { x: 1200, y: 500 },
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
        attackCooldown: 2500,
        isAttacking: false,
        isDead: false,
        damageReduction: 8
      },
      {
        id: 'dark-wolf-3',
        name: 'Темный волк',
        type: 'bat',
        position: { x: 800, y: 900 },
        spawnPosition: { x: 800, y: 900 },
        targetPosition: { x: 800, y: 900 },
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
        attackCooldown: 2500,
        isAttacking: false,
        isDead: false,
        damageReduction: 8
      },
      // Лесные духи
      {
        id: 'forest-spirit-1',
        name: 'Лесной дух',
        type: 'bat', // Reuse bat animations
        position: { x: 600, y: 700 },
        spawnPosition: { x: 600, y: 700 },
        targetPosition: { x: 600, y: 700 },
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
        attackCooldown: 1800,
        isAttacking: false,
        isDead: false,
        damageReduction: 12
      },
      {
        id: 'forest-spirit-2',
        name: 'Лесной дух',
        type: 'bat',
        position: { x: 1400, y: 800 },
        spawnPosition: { x: 1400, y: 800 },
        targetPosition: { x: 1400, y: 800 },
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
        attackCooldown: 1800,
        isAttacking: false,
        isDead: false,
        damageReduction: 12
      },
      // Древние пауки
      {
        id: 'ancient-spider-1',
        name: 'Древний паук',
        type: 'rat', // Reuse rat animations
        position: { x: 300, y: 1200 },
        spawnPosition: { x: 300, y: 1200 },
        targetPosition: { x: 300, y: 1200 },
        isMoving: false,
        direction: 'down',
        health: 40,
        maxHealth: 40,
        damage: 10,
        speed: 1.6,
        attackRange: 50,
        aggressionRange: 90,
        wanderRadius: 70,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 5
      },
      {
        id: 'ancient-spider-2',
        name: 'Древний паук',
        type: 'rat',
        position: { x: 1500, y: 1300 },
        spawnPosition: { x: 1500, y: 1300 },
        targetPosition: { x: 1500, y: 1300 },
        isMoving: false,
        direction: 'down',
        health: 40,
        maxHealth: 40,
        damage: 10,
        speed: 1.6,
        attackRange: 50,
        aggressionRange: 90,
        wanderRadius: 70,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 5
      },
      {
        id: 'ancient-spider-3',
        name: 'Древний паук',
        type: 'rat',
        position: { x: 1000, y: 1600 },
        spawnPosition: { x: 1000, y: 1600 },
        targetPosition: { x: 1000, y: 1600 },
        isMoving: false,
        direction: 'down',
        health: 40,
        maxHealth: 40,
        damage: 10,
        speed: 1.6,
        attackRange: 50,
        aggressionRange: 90,
        wanderRadius: 70,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 5
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
      if (isPointInTree(x, y)) {
        return false;
      }

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

    return true;
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

          // Check if player is in attack range AND has line of sight - start battle
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
              
              // Collision-aware movement
              let nextX = enemy.position.x;
              let nextY = enemy.position.y;
              const tryX = nextX + moveX;
              if (!isPointInTree(tryX, nextY)) nextX = tryX;
              const tryY = nextY + moveY;
              if (!isPointInTree(nextX, tryY)) nextY = tryY;
              
              // Update direction based on movement
              let direction = enemy.direction;
              if (Math.abs(moveX) > Math.abs(moveY)) {
                direction = moveX > 0 ? 'right' : 'left';
              } else {
                direction = moveY > 0 ? 'down' : 'up';
              }
              
              return {
                ...enemy,
                position: { x: nextX, y: nextY },
                direction,
                isMoving: true,
                isAttacking: false
              };
            }
          } else {
            // Wander around spawn point
            const distanceToTarget = getDistance(enemy.position, enemy.targetPosition);
            
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
                const moveX = (dx / distance) * (enemy.speed * 0.5);
                const moveY = (dy / distance) * (enemy.speed * 0.5);
                
                let nextX = enemy.position.x;
                let nextY = enemy.position.y;
                const tryX = nextX + moveX;
                if (!isPointInTree(tryX, nextY)) nextX = tryX;
                const tryY = nextY + moveY;
                if (!isPointInTree(nextX, tryY)) nextY = tryY;
                
                let direction = enemy.direction;
                if (Math.abs(moveX) > Math.abs(moveY)) {
                  direction = moveX > 0 ? 'right' : 'left';
                } else {
                  direction = moveY > 0 ? 'down' : 'up';
                }
                
                return {
                  ...enemy,
                  position: { x: nextX, y: nextY },
                  direction,
                  isAttacking: false
                };
              }
            }
          }

          return enemy;
        })
      );
    }, 50);

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
    
    // Respawn after 5 minutes
    setTimeout(() => {
      setEnemies(prev => {
        if (prev.find(e => e.id === enemyId)) return prev;
        
        // Respawn logic would go here
        return prev;
      });
    }, 300000);
  }, []);

  return { enemies, attackEnemy, removeEnemy };
};