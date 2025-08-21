import { useCallback, useEffect, useState } from 'react';
import { Enemy, Player } from '@/types/gameTypes';
import { minesObstaclesThick as minesObstacles } from '@/maps/minesLayout';
interface EnemySystemProps {
  player: Player;
  onPlayerTakeDamage: (damage: number) => void;
  onBattleStart: (enemy: Enemy) => void;
  isInBattle?: boolean;
}

export const useEnemySystem = ({ player, onPlayerTakeDamage, onBattleStart, isInBattle = false }: EnemySystemProps) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  // Helper: check if a point is inside any wall (mines)
  const isPointInWall = (px: number, py: number) => {
    for (const r of minesObstacles) {
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
        const px = Math.max(40, Math.min(1960, Math.round(x + Math.cos(angle) * radius)));
        const py = Math.max(40, Math.min(1960, Math.round(y + Math.sin(angle) * radius)));
        if (!isPointInWall(px, py)) return { x: px, y: py };
      }
    }
    return { x: 140, y: 140 };
  };

  // Initialize enemies when component mounts
  useEffect(() => {
    const initialEnemies: Enemy[] = [
      // Летучие мыши
      {
        id: 'bat-1',
        name: 'Летучая мышь',
        type: 'bat',
        position: { x: 300, y: 300 },
        spawnPosition: { x: 300, y: 300 },
        targetPosition: { x: 300, y: 300 },
        isMoving: false,
        direction: 'down',
        health: 30,
        maxHealth: 30,
        damage: 8,
        speed: 1.5,
        attackRange: 50,
        aggressionRange: 100,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 3
      },
      {
        id: 'bat-2',
        name: 'Летучая мышь',
        type: 'bat',
        position: { x: 500, y: 600 },
        spawnPosition: { x: 500, y: 600 },
        targetPosition: { x: 500, y: 600 },
        isMoving: false,
        direction: 'down',
        health: 30,
        maxHealth: 30,
        damage: 8,
        speed: 1.5,
        attackRange: 50,
        aggressionRange: 100,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 3
      },
      {
        id: 'bat-3',
        name: 'Летучая мышь',
        type: 'bat',
        position: { x: 1200, y: 800 },
        spawnPosition: { x: 1200, y: 800 },
        targetPosition: { x: 1200, y: 800 },
        isMoving: false,
        direction: 'down',
        health: 30,
        maxHealth: 30,
        damage: 8,
        speed: 1.5,
        attackRange: 50,
        aggressionRange: 100,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 3
      },
      {
        id: 'bat-4',
        name: 'Летучая мышь',
        type: 'bat',
        position: { x: 1500, y: 400 },
        spawnPosition: { x: 1500, y: 400 },
        targetPosition: { x: 1500, y: 400 },
        isMoving: false,
        direction: 'down',
        health: 30,
        maxHealth: 30,
        damage: 8,
        speed: 1.5,
        attackRange: 50,
        aggressionRange: 100,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 3
      },
      {
        id: 'bat-5',
        name: 'Летучая мышь',
        type: 'bat',
        position: { x: 900, y: 1200 },
        spawnPosition: { x: 900, y: 1200 },
        targetPosition: { x: 900, y: 1200 },
        isMoving: false,
        direction: 'down',
        health: 30,
        maxHealth: 30,
        damage: 8,
        speed: 1.5,
        attackRange: 50,
        aggressionRange: 100,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 2000,
        isAttacking: false,
        isDead: false,
        damageReduction: 3
      },
      // Крысы
      {
        id: 'rat-1',
        name: 'Крыса',
        type: 'rat',
        position: { x: 700, y: 400 },
        spawnPosition: { x: 700, y: 400 },
        targetPosition: { x: 700, y: 400 },
        isMoving: false,
        direction: 'down',
        health: 25,
        maxHealth: 25,
        damage: 5,
        speed: 1.2,
        attackRange: 40,
        aggressionRange: 70,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 1500,
        isAttacking: false,
        isDead: false,
        damageReduction: 0
      },
      {
        id: 'rat-2',
        name: 'Крыса',
        type: 'rat',
        position: { x: 800, y: 700 },
        spawnPosition: { x: 800, y: 700 },
        targetPosition: { x: 800, y: 700 },
        isMoving: false,
        direction: 'down',
        health: 25,
        maxHealth: 25,
        damage: 5,
        speed: 1.2,
        attackRange: 40,
        aggressionRange: 70,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 1500,
        isAttacking: false,
        isDead: false,
        damageReduction: 0
      },
      {
        id: 'rat-3',
        name: 'Крыса',
        type: 'rat',
        position: { x: 1300, y: 600 },
        spawnPosition: { x: 1300, y: 600 },
        targetPosition: { x: 1300, y: 600 },
        isMoving: false,
        direction: 'down',
        health: 25,
        maxHealth: 25,
        damage: 5,
        speed: 1.2,
        attackRange: 40,
        aggressionRange: 70,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 1500,
        isAttacking: false,
        isDead: false,
        damageReduction: 0
      },
      {
        id: 'rat-4',
        name: 'Крыса',
        type: 'rat',
        position: { x: 400, y: 900 },
        spawnPosition: { x: 400, y: 900 },
        targetPosition: { x: 400, y: 900 },
        isMoving: false,
        direction: 'down',
        health: 25,
        maxHealth: 25,
        damage: 5,
        speed: 1.2,
        attackRange: 40,
        aggressionRange: 70,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 1500,
        isAttacking: false,
        isDead: false,
        damageReduction: 0
      },
      {
        id: 'rat-5',
        name: 'Крыса',
        type: 'rat',
        position: { x: 1600, y: 1000 },
        spawnPosition: { x: 1600, y: 1000 },
        targetPosition: { x: 1600, y: 1000 },
        isMoving: false,
        direction: 'down',
        health: 25,
        maxHealth: 25,
        damage: 5,
        speed: 1.2,
        attackRange: 40,
        aggressionRange: 70,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 1500,
        isAttacking: false,
        isDead: false,
        damageReduction: 0
      },
      {
        id: 'rat-6',
        name: 'Крыса',
        type: 'rat',
        position: { x: 1100, y: 1400 },
        spawnPosition: { x: 1100, y: 1400 },
        targetPosition: { x: 1100, y: 1400 },
        isMoving: false,
        direction: 'down',
        health: 25,
        maxHealth: 25,
        damage: 5,
        speed: 1.2,
        attackRange: 40,
        aggressionRange: 70,
        wanderRadius: 50,
        lastAttack: 0,
        attackCooldown: 1500,
        isAttacking: false,
        isDead: false,
        damageReduction: 0
      }
    ];

    setEnemies(initialEnemies.map(e => ({
      ...e,
      position: findSafePositionNear(e.position.x, e.position.y),
      spawnPosition: findSafePositionNear(e.spawnPosition.x, e.spawnPosition.y),
      targetPosition: findSafePositionNear(e.targetPosition.x, e.targetPosition.y)
    })));
  }, []);

  // Helper: check line of sight between two points (no walls blocking)
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
      // Check if current point is in a wall
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

    return true; // No walls found on the line
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
          const now = Date.now();

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
  }, [player.position, getDistance, getRandomWanderPosition, hasLineOfSight, onPlayerTakeDamage, onBattleStart, isInBattle]);

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
            id: 'bat-1',
            name: 'Летучая мышь',
            type: 'bat',
            position: { x: 300, y: 300 },
            spawnPosition: { x: 300, y: 300 },
            targetPosition: { x: 300, y: 300 },
            isMoving: false,
            direction: 'down',
            health: 30,
            maxHealth: 30,
            damage: 8,
            speed: 1.5,
            attackRange: 50,
            aggressionRange: 100,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 2000,
            isAttacking: false,
            isDead: false,
            damageReduction: 3
          },
          {
            id: 'bat-2',
            name: 'Летучая мышь',
            type: 'bat',
            position: { x: 500, y: 600 },
            spawnPosition: { x: 500, y: 600 },
            targetPosition: { x: 500, y: 600 },
            isMoving: false,
            direction: 'down',
            health: 30,
            maxHealth: 30,
            damage: 8,
            speed: 1.5,
            attackRange: 50,
            aggressionRange: 100,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 2000,
            isAttacking: false,
            isDead: false,
            damageReduction: 3
          // ... keep existing bat-3, bat-4, bat-5 enemies
          // Replace all with damageReduction: 3 for bats, 0 for rats
          },
          {
            id: 'bat-3',
            name: 'Летучая мышь',
            type: 'bat',
            position: { x: 1200, y: 800 },
            spawnPosition: { x: 1200, y: 800 },
            targetPosition: { x: 1200, y: 800 },
            isMoving: false,
            direction: 'down',
            health: 30,
            maxHealth: 30,
            damage: 8,
            speed: 1.5,
            attackRange: 50,
            aggressionRange: 100,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 2000,
            isAttacking: false,
            isDead: false,
            damageReduction: 3
          },
          {
            id: 'bat-4',
            name: 'Летучая мышь',
            type: 'bat',
            position: { x: 1500, y: 400 },
            spawnPosition: { x: 1500, y: 400 },
            targetPosition: { x: 1500, y: 400 },
            isMoving: false,
            direction: 'down',
            health: 30,
            maxHealth: 30,
            damage: 8,
            speed: 1.5,
            attackRange: 50,
            aggressionRange: 100,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 2000,
            isAttacking: false,
            isDead: false,
            damageReduction: 3
          },
          {
            id: 'bat-5',
            name: 'Летучая мышь',
            type: 'bat',
            position: { x: 900, y: 1200 },
            spawnPosition: { x: 900, y: 1200 },
            targetPosition: { x: 900, y: 1200 },
            isMoving: false,
            direction: 'down',
            health: 30,
            maxHealth: 30,
            damage: 8,
            speed: 1.5,
            attackRange: 50,
            aggressionRange: 100,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 2000,
            isAttacking: false,
            isDead: false,
            damageReduction: 3
          },
          {
            id: 'rat-1',
            name: 'Крыса',
            type: 'rat',
            position: { x: 700, y: 400 },
            spawnPosition: { x: 700, y: 400 },
            targetPosition: { x: 700, y: 400 },
            isMoving: false,
            direction: 'down',
            health: 25,
            maxHealth: 25,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 70,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false,
            damageReduction: 0
          },
          {
            id: 'rat-2',
            name: 'Крыса',
            type: 'rat',
            position: { x: 800, y: 700 },
            spawnPosition: { x: 800, y: 700 },
            targetPosition: { x: 800, y: 700 },
            isMoving: false,
            direction: 'down',
            health: 25,
            maxHealth: 25,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 70,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false,
            damageReduction: 0
          },
          {
            id: 'rat-3',
            name: 'Крыса',
            type: 'rat',
            position: { x: 1300, y: 600 },
            spawnPosition: { x: 1300, y: 600 },
            targetPosition: { x: 1300, y: 600 },
            isMoving: false,
            direction: 'down',
            health: 25,
            maxHealth: 25,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 70,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false,
            damageReduction: 0
          },
          {
            id: 'rat-4',
            name: 'Крыса',
            type: 'rat',
            position: { x: 400, y: 900 },
            spawnPosition: { x: 400, y: 900 },
            targetPosition: { x: 400, y: 900 },
            isMoving: false,
            direction: 'down',
            health: 25,
            maxHealth: 25,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 70,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false,
            damageReduction: 0
          },
          {
            id: 'rat-5',
            name: 'Крыса',
            type: 'rat',
            position: { x: 1600, y: 1000 },
            spawnPosition: { x: 1600, y: 1000 },
            targetPosition: { x: 1600, y: 1000 },
            isMoving: false,
            direction: 'down',
            health: 25,
            maxHealth: 25,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 70,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false,
            damageReduction: 0
          },
          {
            id: 'rat-6',
            name: 'Крыса',
            type: 'rat',
            position: { x: 1100, y: 1400 },
            spawnPosition: { x: 1100, y: 1400 },
            targetPosition: { x: 1100, y: 1400 },
            isMoving: false,
            direction: 'down',
            health: 25,
            maxHealth: 25,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 70,
            wanderRadius: 50,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false,
            damageReduction: 0
          }
        ];
        
        const enemyToRespawn = originalEnemies.find(e => e.id === enemyId);
        if (enemyToRespawn) {
          console.log(`Respawning enemy ${enemyId}`);
          const adjusted = {
            ...enemyToRespawn,
            position: findSafePositionNear(enemyToRespawn.position.x, enemyToRespawn.position.y),
            spawnPosition: findSafePositionNear(enemyToRespawn.spawnPosition.x, enemyToRespawn.spawnPosition.y),
            targetPosition: findSafePositionNear(enemyToRespawn.targetPosition.x, enemyToRespawn.targetPosition.y)
          } as Enemy;
          return [...prev, adjusted];
        }
        
        return prev;
      });
    }, 300000); // 5 minutes
  }, []);

  return { enemies, attackEnemy, removeEnemy };
};