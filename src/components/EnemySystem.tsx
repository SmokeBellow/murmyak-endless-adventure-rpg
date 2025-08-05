import { useCallback, useEffect, useState } from 'react';
import { Enemy, Player } from '@/types/gameTypes';

interface EnemySystemProps {
  player: Player;
  onPlayerTakeDamage: (damage: number) => void;
  onBattleStart: (enemy: Enemy) => void;
}

export const useEnemySystem = ({ player, onPlayerTakeDamage, onBattleStart }: EnemySystemProps) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

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
        isDead: false
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
        isDead: false
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
        isDead: false
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
        isDead: false
      }
    ];

    setEnemies(initialEnemies);
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

          // Check if player is in attack range - start battle
          if (distanceToPlayer <= enemy.attackRange) {
            onBattleStart(enemy);
            return enemy;
          }
          
          // Check if player is in aggression range - chase player
          if (distanceToPlayer <= enemy.aggressionRange) {
            const dx = player.position.x - enemy.position.x;
            const dy = player.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const moveX = (dx / distance) * enemy.speed;
              const moveY = (dy / distance) * enemy.speed;
              
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
                  x: enemy.position.x + moveX,
                  y: enemy.position.y + moveY
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
              const newTarget = getRandomWanderPosition(enemy);
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
                    x: enemy.position.x + moveX,
                    y: enemy.position.y + moveY
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
  }, [player.position, getDistance, getRandomWanderPosition, onPlayerTakeDamage, onBattleStart]);

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
            isDead: false
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
            isDead: false
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
            health: 20,
            maxHealth: 20,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 80,
            wanderRadius: 30,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false
          },
          {
            id: 'rat-2',
            name: 'Крыса',
            type: 'rat',
            position: { x: 200, y: 500 },
            spawnPosition: { x: 200, y: 500 },
            targetPosition: { x: 200, y: 500 },
            isMoving: false,
            direction: 'down',
            health: 20,
            maxHealth: 20,
            damage: 5,
            speed: 1.2,
            attackRange: 40,
            aggressionRange: 80,
            wanderRadius: 30,
            lastAttack: 0,
            attackCooldown: 1500,
            isAttacking: false,
            isDead: false
          }
        ];
        
        const enemyToRespawn = originalEnemies.find(e => e.id === enemyId);
        if (enemyToRespawn) {
          console.log(`Respawning enemy ${enemyId}`);
          return [...prev, enemyToRespawn];
        }
        
        return prev;
      });
    }, 300000); // 5 minutes
  }, []);

  return { enemies, attackEnemy, removeEnemy };
};