import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType, LocationType, Enemy, BattleState, BattleResult } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { addItemsToInventory, removeItemFromInventory, getTotalItemQuantity, getSellPrice } from '@/utils/inventory';
import { X } from 'lucide-react';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import InventoryMenu from './InventoryMenu';
import EquipmentMenu from './EquipmentMenu';
import QuestMenu from './QuestMenu';
import StatsMenu from './StatsMenu';
import NPCDialogue from './NPCDialogue';
import VisualNovelDialogue from './VisualNovelDialogue';
import TradeMenu from './TradeMenu';
import VirtualJoystick from './VirtualJoystick';
import CoalMining from './CoalMining';
import OreMining from './OreMining';
import QuestRewardModal from './QuestRewardModal';
import LoadingScreen from './LoadingScreen';
import { useEnemySystem } from './EnemySystem';
import { minesObstacles } from '@/maps/minesLayout';
import { BattleScreen } from './BattleScreen';
import { BattleVictory } from './BattleVictory';
import { BattleDefeat } from './BattleDefeat';

const RPGGame = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [gameScreen, setGameScreen] = useState<GameScreen>('game');
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [damageTexts, setDamageTexts] = useState<any[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [showVisualNovel, setShowVisualNovel] = useState(false);
  const [showCoalMining, setShowCoalMining] = useState(false);
  const [showOreMining, setShowOreMining] = useState(false);
  const [questReward, setQuestReward] = useState<Quest | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationType>('village');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Resource nodes with regeneration
  const [resourceNodes, setResourceNodes] = useState({
    coal: {
      count: Math.floor(Math.random() * 4) + 1,
      lastRegen: Date.now()
    },
    ore: {
      count: Math.floor(Math.random() * 4) + 1,
      lastRegen: Date.now()
    }
  });

  // Initial game items
  const initialItems: Item[] = [
    {
      id: 'starter-sword',
      name: 'Ржавый меч',
      type: 'weapon',
      slot: 'weapon',
      stats: { damage: 5 },
      description: 'Старый ржавый меч начинающего воина',
      icon: '⚔️'
    },
    {
      id: 'leather-armor',
      name: 'Кожаная броня',
      type: 'armor',
      slot: 'chest',
      stats: { armor: 3 },
      description: 'Простая кожаная броня',
      icon: '/leatherarmor.png'
    },
    {
      id: 'health-potion',
      name: 'Зелье здоровья',
      type: 'consumable',
      description: 'Восстанавливает 50 единиц здоровья',
      icon: '/healthpotion.png',
      stackable: true,
      maxStack: 10,
      quantity: 1
    }
  ];

  // Calculate unallocated points based on level
  const calculateUnallocatedPoints = (level: number): number => {
    let points = level - 1; // 1 point per level after level 1
    points += Math.floor(level / 10) * 5; // 5 bonus points every 10 levels
    return points;
  };

  // Player state
  const [player, setPlayer] = useState<Player>({
    name: 'Герой',
    position: { x: 600, y: 400 }, // Safe position away from buildings
    targetPosition: { x: 600, y: 400 },
    isMoving: false,
    direction: 'down', // Add direction tracking
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    experience: 0,
    level: 1,
    coins: 50,
    inventory: initialItems,
    equipment: {
      head: null,
      chest: null,
      legs: null,
      weapon: null,
      shield: null
    },
    stats: {
      strength: 5,
      agility: 5,
      intelligence: 5,
      constitution: 5,
      luck: 5
    },
    unallocatedPoints: 0,
    questProgress: {
      visitedMerchant: false,
      usedFountain: false,
      talkedToMerchant: false,
      talkedToBlacksmith: false
    }
  });

  // NPCs
  const [npcs] = useState<NPC[]>([
    {
      id: 'merchant',
      name: 'Торговец Марк',
      position: { x: 1070, y: 530 }, // Moved near the corrected house position
      type: 'merchant',
      dialogue: [
        'Добро пожаловать в мою лавку!',
        'У меня есть отличные товары для смелых путешественников.',
        'Возвращайтесь, когда найдёте что-то интересное!'
      ],
      shop: [
        {
          id: 'iron-sword',
          name: 'Железный меч',
          type: 'weapon',
          slot: 'weapon',
          stats: { damage: 12 },
          description: 'Прочный железный меч',
          icon: '/sword.png',
          price: 25
        },
        {
          id: 'steel-armor',
          name: 'Стальная броня',
          type: 'armor',
          slot: 'chest',
          stats: { armor: 8 },
          description: 'Прочная стальная броня',
          icon: '/steelarmor.png',
          price: 40
        },
        {
          id: 'mana-potion',
          name: 'Зелье маны',
          type: 'consumable',
          description: 'Восстанавливает 30 единиц маны',
          icon: '🔮',
          price: 10
        }
      ]
    },
    {
      id: 'elder',
      name: 'Староста Эдвин',
      position: { x: 820, y: 490 }, // Moved near buildings area
      type: 'elder',
      dialogue: [
        'Приветствую тебя, молодой искатель приключений!',
        'Наша деревня нуждается в твоей помощи.',
        'Готов ли ты принять вызов?'
      ],
      quests: [
        {
          id: 'village-introduction',
          title: 'Знакомство с деревней',
          description: 'Поговори со всеми жителями деревни, чтобы познакомиться с ними.',
          status: 'available',
          giver: 'elder',
          repeatable: false,
          objectives: [
            { description: 'Поговори с торговцем', completed: false },
            { description: 'Поговори с кузнецом', completed: false }
          ],
          rewards: {
            experience: 100,
            coins: 30
          }
        },
        {
          id: 'find-blacksmith',
          title: 'Найти кузнеца',
          description: 'В деревне есть кузнец, который может помочь тебе. Найди его!',
          status: 'locked',
          giver: 'blacksmith',
          repeatable: false,
          objectives: [
            { description: 'Найди и поговори с кузнецом', completed: false }
          ],
          rewards: {
            experience: 10
          }
        }
      ]
    },
    {
      id: 'blacksmith',
      name: 'Кузнец Гром',
      position: { x: 780, y: 540 }, // Moved near blacksmith forge
      type: 'blacksmith',
      dialogue: [
        'Добро пожаловать в мою кузницу!',
        'Мне нужны материалы для работы.',
        'Принеси мне уголь, и я выкую тебе отличное оружие!'
      ],
      quests: [
        {
          id: 'find-coal',
          title: 'Поиск угля',
          description: 'Кузнецу нужен уголь для работы. Найди его в лесу за деревней.',
          status: 'locked',
          giver: 'blacksmith',
          repeatable: false,
          objectives: [
            { description: 'Найди уголь в лесу', completed: false },
            { description: 'Вернись к кузнецу с углем', completed: false }
          ],
          rewards: {
            experience: 75,
            items: [{
              id: 'forged-iron-sword',
              name: 'Кованый железный меч',
              type: 'weapon',
              slot: 'weapon',
              stats: { damage: 18 },
              description: 'Превосходный меч, выкованный мастером',
              icon: '⚔️'
            }]
          }
        },
        {
          id: 'ore-mining',
          title: 'Добыть руду',
          description: 'Найди 3 куска руды в заброшенных шахтах для кузнеца.',
          status: 'available',
          giver: 'blacksmith',
          repeatable: false,
          objectives: [
            { description: 'Найти 3 куска руды в заброшенных шахтах (0/3)', completed: false },
            { description: 'Вернись к кузнецу с рудой', completed: false }
          ],
          rewards: {
            experience: 100,
            items: [{
              id: 'iron-sword',
              name: 'Железный меч',
              type: 'weapon',
              slot: 'weapon',
              stats: { damage: 15 },
              description: 'Качественный железный меч',
              icon: '/sword.png'
            }]
          }
        }
      ]
    }
  ]);

  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);

  // Handle player taking damage from enemies
  const handlePlayerTakeDamage = useCallback((damage: number) => {
    setPlayer(prev => {
      const newHealth = Math.max(0, prev.health - damage);
      if (newHealth === 0) {
        toast({
          title: "Вы погибли!",
          description: "Вы были повержены противником",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Получен урон!",
          description: `Вы потеряли ${damage} здоровья`,
          variant: "destructive"
        });
      }
      return {
        ...prev,
        health: newHealth
      };
    });
  }, [toast]);

  // Battle system
  const handleBattleStart = useCallback((enemy: Enemy) => {
    // Don't start battle if already in battle or not in abandoned mines
    if (battleState || gameScreen === 'battle' || currentLocation !== 'abandoned-mines') return;
    
    console.log('Starting battle with', enemy.name, 'health:', enemy.health);
    
    setBattleState({
      player,
      enemy,
      location: currentLocation,
      playerAction: null,
      turn: 'player',
      skillCooldown: 0
    });
    setGameScreen('battle');
    setBattleLog([`Бой с ${enemy.name} начинается!`]);
    setDamageTexts([]);
  }, [player, currentLocation, battleState, gameScreen]);

  const handleBattleEnd = useCallback(() => {
    setBattleState(null);
    setBattleResult(null);
    setGameScreen('game');
    setBattleLog([]);
    setDamageTexts([]);
  }, []);

  const addDamageText = useCallback((amount: number, target: 'player' | 'enemy', type: 'damage' | 'heal' | 'defend' | 'skill' = 'damage') => {
    const id = Date.now().toString() + Math.random().toString();
    setDamageTexts(prev => [...prev, { id, amount, target, type }]);
    
    // Remove damage text after animation
    setTimeout(() => {
      setDamageTexts(prev => prev.filter(dt => dt.id !== id));
    }, 2000);
  }, []);

  const addBattleLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev, message]);
  }, []);

  const handleBattleAttack = useCallback(() => {
    if (!battleState || battleState.turn !== 'player') return;
    
    console.log('Battle attack started, enemy health:', battleState.enemy.health);
    
    // Store all battle data before any state updates
    const currentBattleState = battleState;
    const enemyName = currentBattleState.enemy.name;
    const enemyDamage = currentBattleState.enemy.damage;
    const currentEnemyHealth = currentBattleState.enemy.health;
    const currentPlayerHealth = player.health;
    
    // Player attacks enemy
    const weaponDamage = player.equipment.weapon?.stats?.damage || 10;
    const totalDamage = Math.floor(weaponDamage * (0.8 + Math.random() * 0.4));
    
    const newEnemyHealth = Math.max(0, currentEnemyHealth - totalDamage);
    
    console.log('Damage dealt:', totalDamage, 'New enemy health:', newEnemyHealth);
    
    addDamageText(totalDamage, 'enemy', 'damage');
    addBattleLog(`Вы атакуете ${enemyName} и наносите ${totalDamage} урона!`);
    
    if (newEnemyHealth <= 0) {
      // Enemy defeated
      addBattleLog(`${enemyName} повержен!`);
      
      // Generate battle result
      const experienceGained = Math.floor(Math.random() * 20) + 10;
      const coinsGained = Math.floor(Math.random() * 10) + 5;
      const lootItems: Item[] = [];
      
      // Random loot chance
      if (Math.random() < 0.3) { // 30% chance for loot
        lootItems.push({
          id: 'health-potion',
          name: 'Зелье здоровья',
          type: 'consumable',
          description: 'Восстанавливает 50 единиц здоровья',
          icon: '/healthpotion.png',
          stackable: true,
          maxStack: 10
        });
      }
      
      setBattleResult({
        victory: true,
        experienceGained,
        coinsGained,
        lootItems
      });
      
      setTimeout(() => {
        setGameScreen('battle-victory');
        setPlayer(prev => ({
          ...prev,
          experience: prev.experience + experienceGained,
          coins: prev.coins + coinsGained,
          inventory: addItemsToInventory(prev.inventory, lootItems)
        }));
      }, 1500);
      return;
    }
    
    // Update battle state with new enemy health IMMEDIATELY
    setBattleState(prev => {
      const newState = prev ? {
        ...prev,
        enemy: { ...prev.enemy, health: newEnemyHealth },
        turn: 'enemy' as const,
        skillCooldown: Math.max(0, (prev.skillCooldown || 0) - 1)
      } : null;
      console.log('Updated battle state, new enemy health:', newState?.enemy.health);
      return newState;
    });
    
    // Enemy attacks after delay
    setTimeout(() => {
      console.log('Enemy counterattack');
      
      setPlayer(prev => {
        const newPlayerHealth = Math.max(0, prev.health - enemyDamage);
        console.log('Player health before:', prev.health, 'damage:', enemyDamage, 'after:', newPlayerHealth);
        return {
          ...prev,
          health: newPlayerHealth
        };
      });
      
      addDamageText(enemyDamage, 'player', 'damage');
      addBattleLog(`${enemyName} атакует вас и наносит ${enemyDamage} урона!`);
      
      // Check if player is defeated using a ref to get current health
      setTimeout(() => {
        setPlayer(current => {
          if (current.health <= 0) {
            addBattleLog("Вы падаете без сознания...");
            setTimeout(() => {
              setGameScreen('battle-defeat');
            }, 1500);
          }
          return current;
        });
      }, 100);
      
      setBattleState(prev => prev ? {
        ...prev,
        turn: 'player' as const
      } : null);
    }, 1000);
  }, [battleState, player.equipment.weapon, player.health, addDamageText, addBattleLog]);

  const handleBattleSkill = useCallback(() => {
    if (!battleState || battleState.turn !== 'player') return;

    const SKILL_MANA_COST = 15;
    if (player.mana < SKILL_MANA_COST) {
      addBattleLog('Недостаточно маны для использования умения!');
      return;
    }
    if ((battleState.skillCooldown || 0) > 0) {
      addBattleLog(`Умение недоступно. Откат: ${battleState.skillCooldown} атак(и).`);
      return;
    }

    const currentEnemyHealth = battleState.enemy.health;
    const enemyName = battleState.enemy.name;
    const enemyDamage = battleState.enemy.damage;

    // Consume mana
    setPlayer(prev => ({ ...prev, mana: Math.max(0, prev.mana - SKILL_MANA_COST) }));

    // Skill damage: stronger than basic attack
    const weaponDamage = player.equipment.weapon?.stats?.damage || 10;
    const totalDamage = Math.floor(weaponDamage * 1.8 * (0.9 + Math.random() * 0.2));

    const newEnemyHealth = Math.max(0, currentEnemyHealth - totalDamage);
    addDamageText(totalDamage, 'enemy', 'skill');
    addBattleLog(`Вы используете особое умение и наносите ${totalDamage} урона ${enemyName}!`);

    if (newEnemyHealth <= 0) {
      addBattleLog(`${enemyName} повержен!`);
      const experienceGained = Math.floor(Math.random() * 20) + 15;
      const coinsGained = Math.floor(Math.random() * 10) + 5;
      const lootItems: Item[] = [];
      if (Math.random() < 0.3) {
        lootItems.push({
          id: 'health-potion',
          name: 'Зелье здоровья',
          type: 'consumable',
          description: 'Восстанавливает 50 единиц здоровья',
          icon: '/healthpotion.png',
          stackable: true,
          maxStack: 10
        });
      }
      setBattleResult({ victory: true, experienceGained, coinsGained, lootItems });
      setTimeout(() => {
        setGameScreen('battle-victory');
        setPlayer(prev => ({
          ...prev,
          experience: prev.experience + experienceGained,
          coins: prev.coins + coinsGained,
          inventory: addItemsToInventory(prev.inventory, lootItems)
        }));
      }, 1500);
      return;
    }

    // Update enemy health, set cooldown to 3, turn to enemy
    setBattleState(prev => prev ? {
      ...prev,
      enemy: { ...prev.enemy, health: newEnemyHealth },
      playerAction: 'skill',
      turn: 'enemy',
      skillCooldown: 3
    } : null);

    // Enemy counterattack
    setTimeout(() => {
      setPlayer(prev => {
        const newPlayerHealth = Math.max(0, prev.health - enemyDamage);
        return { ...prev, health: newPlayerHealth };
      });
      addDamageText(enemyDamage, 'player', 'damage');
      addBattleLog(`${enemyName} атакует вас и наносит ${enemyDamage} урона!`);

      setTimeout(() => {
        setPlayer(current => {
          if (current.health <= 0) {
            addBattleLog('Вы падаете без сознания...');
            setTimeout(() => setGameScreen('battle-defeat'), 1500);
          }
          return current;
        });
      }, 100);

      setBattleState(prev => prev ? { ...prev, turn: 'player' } : null);
    }, 1000);
  }, [battleState, player.equipment.weapon, player.mana, addDamageText, addBattleLog]);

  const handleBattleUseItem = useCallback((item: Item) => {
    if (!battleState || battleState.turn !== 'player') return;
    
    // Use item logic
    if (item.name === 'Зелье здоровья') {
      const healAmount = 50;
      setPlayer(prev => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + healAmount),
        inventory: removeItemFromInventory(prev.inventory, item.id, 1)
      }));
      
      addDamageText(healAmount, 'player', 'heal');
      addBattleLog(`Вы используете ${item.name} и восстанавливаете ${healAmount} здоровья!`);
    }
    
    // Enemy's turn
    setBattleState(prev => prev ? {
      ...prev,
      turn: 'enemy'
    } : null);
    
    setTimeout(() => {
      const enemyDamage = battleState.enemy.damage;
      const newPlayerHealth = Math.max(0, player.health - enemyDamage);
      
      setPlayer(prev => ({
        ...prev,
        health: newPlayerHealth
      }));
      
      setBattleState(prev => prev ? {
        ...prev,
        turn: 'player'
      } : null);
      
      addDamageText(enemyDamage, 'player', 'damage');
      addBattleLog(`${battleState.enemy.name} атакует и наносит ${enemyDamage} урона!`);
      
      // Check if player is defeated
      if (newPlayerHealth <= 0) {
        addBattleLog("Вы падаете без сознания...");
        setTimeout(() => {
          setGameScreen('battle-defeat');
        }, 1500);
      }
    }, 1000);
  }, [battleState, addDamageText, addBattleLog, player.health]);

  // Handle battle flee - can be used at any time
  const handleBattleFlee = useCallback(() => {
    if (!battleState) return;
    
    // Prevent multiple flee attempts
    if (battleState.playerAction === 'fleeing') return;
    
    console.log('Attempting to flee from battle');
    addBattleLog("Вы пытаетесь сбежать...");
    
    // Mark as fleeing to prevent multiple attempts
    setBattleState(prev => prev ? {
      ...prev,
      playerAction: 'fleeing'
    } : null);
    
    // 70% chance to successfully flee
    if (Math.random() < 0.7) {
      addBattleLog("Вы успешно сбегаете из боя!");
      setTimeout(() => {
        console.log('Successfully fled, ending battle');
        
        // Move player to a safe position away from enemies
        if (currentLocation === 'abandoned-mines') {
          // Move to entrance area of mines (safe zone)
          setPlayer(prev => ({
            ...prev,
            position: { x: 200, y: 200 },
            targetPosition: { x: 200, y: 200 }
          }));
        }
        
        handleBattleEnd();
      }, 1000);
    } else {
      addBattleLog("Побег не удался! Враг атакует!");
      
      // Store enemy info before state updates
      const currentBattleState = battleState;
      const enemyName = currentBattleState.enemy.name;
      const enemyDamage = currentBattleState.enemy.damage;
      const currentPlayerHealth = player.health;
      
      // Enemy gets a free attack
      setTimeout(() => {
        console.log('Failed flee, enemy attacks');
        const newPlayerHealth = Math.max(0, currentPlayerHealth - enemyDamage);
        
        setPlayer(prev => ({
          ...prev,
          health: newPlayerHealth
        }));
        
        addDamageText(enemyDamage, 'player', 'damage');
        addBattleLog(`${enemyName} атакует и наносит ${enemyDamage} урона!`);
        
        // Check if player is defeated
        if (newPlayerHealth <= 0) {
          addBattleLog("Вы падаете без сознания...");
          setTimeout(() => {
            setGameScreen('battle-defeat');
          }, 1500);
          return;
        }
        
        // Set turn back to player and reset action
        setBattleState(prev => prev ? {
          ...prev,
          turn: 'player',
          playerAction: null
        } : null);
      }, 1000);
    }
  }, [battleState, handleBattleEnd, addBattleLog, addDamageText, player.health]);

  // Handle battle defeat
  const handleBattleDefeat = useCallback(() => {
    // Reset player health and teleport to village
    setPlayer(prev => ({
      ...prev,
      health: Math.floor(prev.maxHealth * 0.5), // Half health after defeat
      position: { x: 820, y: 490 }, // Elder's position in village
      targetPosition: { x: 820, y: 490 }
    }));
    
    setCurrentLocation('village');
    handleBattleEnd();
    
    // Show recovery message
    setTimeout(() => {
      toast({
        title: "Восстановление",
        description: "Вы приходите в себя в доме старосты",
        duration: 3000
      });
    }, 500);
  }, [handleBattleEnd, toast]);

  // Enemy system (only in abandoned mines)
  const { enemies, attackEnemy, removeEnemy } = useEnemySystem({
    player,
    onPlayerTakeDamage: currentLocation === 'abandoned-mines' ? handlePlayerTakeDamage : () => {},
    onBattleStart: handleBattleStart,
    isInBattle: gameScreen === 'battle' || battleState !== null
  });

  // Handle battle victory
  const handleBattleVictory = useCallback(() => {
    // Remove defeated enemy from the map and schedule respawn
    if (battleState) {
      removeEnemy(battleState.enemy.id);
    }
    handleBattleEnd();
  }, [handleBattleEnd, battleState, removeEnemy]);

  // Handle enemy attack
  const handleEnemyClick = useCallback((enemy: Enemy) => {
    if (enemy.isDead) return;
    
    // Calculate player's total damage
    const weaponDamage = player.equipment.weapon?.stats?.damage || 5;
    const totalDamage = Math.floor(weaponDamage * (0.8 + Math.random() * 0.4)); // Random variance
    
    attackEnemy(enemy.id, totalDamage);
    
    toast({
      title: "Атака!",
      description: `Вы нанесли ${totalDamage} урона ${enemy.name}`,
    });
  }, [player.equipment.weapon, attackEnemy, toast]);

  // Regeneration effect
  useEffect(() => {
    const regenInterval = setInterval(() => {
      setPlayer(prev => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + 1),
        mana: Math.min(prev.maxMana, prev.mana + 1)
      }));
    }, 3000);

    return () => clearInterval(regenInterval);
  }, []);

  // Handle stat point allocation
  const handleAllocatePoint = useCallback((stat: keyof Player['stats']) => {
    if (player.unallocatedPoints <= 0) return;

    setPlayer(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: prev.stats[stat] + 1
      },
      unallocatedPoints: prev.unallocatedPoints - 1
    }));

    toast({
      title: "Характеристика улучшена!",
      description: `Увеличена характеристика: ${stat === 'strength' ? 'Сила' : stat === 'agility' ? 'Ловкость' : stat === 'intelligence' ? 'Интеллект' : stat === 'constitution' ? 'Телосложение' : 'Удача'}`,
    });
  }, [player.unallocatedPoints, toast]);

  // Update player stats when leveling up
  useEffect(() => {
    const experienceForLevel = player.level * 100;
    if (player.experience >= experienceForLevel) {
      const newLevel = Math.floor(player.experience / 100) + 1;
      const levelGained = newLevel - player.level;
      
      if (levelGained > 0) {
        const basePoints = levelGained; // 1 point per level
        const bonusPoints = Math.floor(newLevel / 10) * 5 - Math.floor(player.level / 10) * 5; // Bonus points for reaching level milestones
        const totalPoints = basePoints + bonusPoints;
        
        setPlayer(prev => ({
          ...prev,
          level: newLevel,
          unallocatedPoints: prev.unallocatedPoints + totalPoints,
          maxHealth: prev.maxHealth + (prev.stats.constitution * 2), // Constitution affects health
          maxMana: prev.maxMana + (prev.stats.intelligence * 1), // Intelligence affects mana
        }));

        toast({
          title: "Повышение уровня!",
          description: `Уровень ${newLevel}! Получено ${totalPoints} очков характеристик.`,
        });
      }
    }
  }, [player.experience, player.level, player.stats.constitution, player.stats.intelligence, toast]);

  // Resource nodes regeneration
  useEffect(() => {
    const resourceRegenInterval = setInterval(() => {
      setResourceNodes(prev => {
        const now = Date.now();
        const REGEN_TIME = 5 * 60 * 1000; // 5 minutes
        
        return {
          coal: {
            count: now - prev.coal.lastRegen >= REGEN_TIME 
              ? Math.floor(Math.random() * 4) + 1 
              : prev.coal.count,
            lastRegen: now - prev.coal.lastRegen >= REGEN_TIME ? now : prev.coal.lastRegen
          },
          ore: {
            count: now - prev.ore.lastRegen >= REGEN_TIME 
              ? Math.floor(Math.random() * 4) + 1 
              : prev.ore.count,
            lastRegen: now - prev.ore.lastRegen >= REGEN_TIME ? now : prev.ore.lastRegen
          }
        };
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(resourceRegenInterval);
  }, []);

  const handlePlayerMove = useCallback((newPosition: { x: number; y: number }) => {
    setPlayer(prev => ({
      ...prev,
      position: newPosition,
      targetPosition: newPosition
    }));
  }, []);

  // Collision detection
  const isColliding = useCallback((x: number, y: number) => {
    if (currentLocation === 'village') {
      // Merchant house collision - exact match with visual house (300,300 -> 500,450)
      if (x >= 300 && x <= 500 && y >= 300 && y <= 450) {
        return true;
      }
    } else if (currentLocation === 'abandoned-mines') {
      // Mines labyrinth collision: points inside any wall rectangle are blocked
      for (const r of minesObstacles) {
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
          return true;
        }
      }
    }
    return false;
  }, [currentLocation]);

  const handleJoystickMove = useCallback((direction: { x: number; y: number } | null) => {
    if (!direction) {
      setPlayer(prev => ({ ...prev, isMoving: false }));
      return;
    }

    const moveSpeed = 2.5; // Slightly increased speed
    
    setPlayer(prev => {
      const { x, y } = prev.position;
      
      // Calculate new position with smoother increments
      let newX = x + (direction.x * moveSpeed);
      let newY = y + (direction.y * moveSpeed);
      
      // Boundary constraints
      newX = Math.max(40, Math.min(1960, newX));
      newY = Math.max(40, Math.min(1960, newY));
      
      // Collision detection - check if movement is blocked
      if (isColliding(newX, newY)) {
        return prev; // Don't move if would collide
      }
      
      // Determine player direction based on movement
      let playerDirection = prev.direction;
      if (Math.abs(direction.x) > Math.abs(direction.y)) {
        // Horizontal movement is dominant
        playerDirection = direction.x > 0 ? 'right' : 'left';
      } else if (direction.y !== 0) {
        // Vertical movement
        playerDirection = direction.y < 0 ? 'up' : 'down';
      }
      
      return {
        ...prev,
        position: { x: newX, y: newY },
        targetPosition: { x: newX, y: newY },
        isMoving: true,
        direction: playerDirection
      };
    });
  }, [currentLocation]);

  const handleNPCInteract = useCallback((npc: NPC) => {
    console.log('handleNPCInteract called with:', npc.name);
    console.log('Current player position:', player.position);
    console.log('NPC position:', npc.position);
    setSelectedNPC(npc);
    
    // Mark merchant as visited for quest progress and update village introduction quest
    if (npc.type === 'merchant') {
      setPlayer(prev => ({
        ...prev,
        questProgress: {
          ...prev.questProgress,
          visitedMerchant: true,
          talkedToMerchant: true
        }
      }));
      
      // Update village introduction quest objective
      const villageQuest = quests.find(q => q.id === 'village-introduction' && q.status === 'active');
      if (villageQuest) {
        const updatedObjectives = villageQuest.objectives.map(obj => 
          obj.description === 'Поговори с торговцем' ? { ...obj, completed: true } : obj
        );
        const updatedQuest = { ...villageQuest, objectives: updatedObjectives };
        setQuests(prev => [...prev.filter(q => q.id !== villageQuest.id), updatedQuest]);
      }
    }
    
    // Handle blacksmith interaction
    if (npc.type === 'blacksmith') {
      setPlayer(prev => ({
        ...prev,
        questProgress: {
          ...prev.questProgress,
          talkedToBlacksmith: true
        }
      }));

      // Update village introduction quest objective
      const villageQuest = quests.find(q => q.id === 'village-introduction' && q.status === 'active');
      if (villageQuest) {
        const updatedObjectives = villageQuest.objectives.map(obj => 
          obj.description === 'Поговори с кузнецом' ? { ...obj, completed: true } : obj
        );
        const updatedQuest = { ...villageQuest, objectives: updatedObjectives };
        setQuests(prev => [...prev.filter(q => q.id !== villageQuest.id), updatedQuest]);
      }

      const findBlacksmithQuest = quests.find(q => q.id === 'find-blacksmith' && q.status === 'active');
      if (findBlacksmithQuest) {
        const updatedObjectives = findBlacksmithQuest.objectives.map(obj => ({ ...obj, completed: true }));
        const updatedQuest = { ...findBlacksmithQuest, objectives: updatedObjectives };
        setQuests(prev => [...prev.filter(q => q.id !== findBlacksmithQuest.id), updatedQuest]);
      }
      
      // Handle coal quest completion
      const coalQuest = quests.find(q => q.id === 'find-coal' && q.status === 'active');
      const hasCoal = getTotalItemQuantity(player.inventory, 'Уголь') > 0;
      
      if (coalQuest && hasCoal) {
        // Remove coal from inventory
        setPlayer(prev => ({
          ...prev,
          inventory: removeItemFromInventory(prev.inventory, 'coal', 1)
        }));
        
        // Update quest objective
        const updatedObjectives = coalQuest.objectives.map(obj => 
          obj.description === 'Вернись к кузнецу с углем' ? { ...obj, completed: true } : obj
        );
        const updatedQuest = { ...coalQuest, objectives: updatedObjectives };
        setQuests(prev => [...prev.filter(q => q.id !== coalQuest.id), updatedQuest]);
      }

      // Handle ore quest completion
      const oreQuest = quests.find(q => q.id === 'ore-mining' && q.status === 'active');
      const oreCount = getTotalItemQuantity(player.inventory, 'Железная руда');
      
      if (oreQuest && oreCount >= 3) {
        // Remove 3 ore from inventory
        setPlayer(prev => ({
          ...prev,
          inventory: removeItemFromInventory(prev.inventory, 'ore', 3)
        }));
        
        // Update quest objective
        const updatedObjectives = oreQuest.objectives.map(obj => 
          obj.description === 'Вернись к кузнецу с рудой' ? { ...obj, completed: true } : obj
        );
        const updatedQuest = { ...oreQuest, objectives: updatedObjectives };
        setQuests(prev => [...prev.filter(q => q.id !== oreQuest.id), updatedQuest]);
      }
    }
    
    // Note: Quests are now completed manually through the dialogue system
  }, [quests, npcs, setPlayer, player.inventory]);

  const handleEquipItem = useCallback((item: Item) => {
    if (!item.slot) return;

    setPlayer(prev => {
      const newEquipment = { ...prev.equipment };
      let newInventory = removeItemFromInventory(prev.inventory, item.id, 1);
      
      // If there's already an item in this slot, move it to inventory
      if (newEquipment[item.slot]) {
        newInventory = addItemsToInventory(newInventory, [newEquipment[item.slot]!]);
      }
      
      newEquipment[item.slot] = { ...item, quantity: 1 };

      return {
        ...prev,
        equipment: newEquipment,
        inventory: newInventory
      };
    });

    // Item equipped silently
  }, []);

  const handleAcceptQuest = useCallback((quest: Quest) => {
    const updatedQuest = { ...quest, status: 'active' as const };
    setQuests(prev => [...prev.filter(q => q.id !== quest.id), updatedQuest]);
    
    setSelectedNPC(null);
    
    // Quest accepted silently
  }, []);

  const handleCompleteQuest = useCallback((quest: Quest) => {
    console.log('Completing quest:', quest.id);
    
    // Complete the quest
    const completedQuest = {
      ...quest,
      status: 'completed' as const
    };
    setQuests(prev => [...prev.filter(q => q.id !== quest.id), completedQuest]);
    setCompletedQuestIds(prev => {
      const newIds = [...prev, quest.id];
      console.log('Updated completed quest IDs:', newIds);
      return newIds;
    });
    
    // Give rewards
    setPlayer(prev => ({
      ...prev,
      experience: prev.experience + quest.rewards.experience,
      coins: prev.coins + (quest.rewards.coins || 0),
      inventory: addItemsToInventory(prev.inventory, quest.rewards.items || [])
    }));
    
    // Show quest reward modal
    console.log('Setting quest reward modal for quest:', quest.id);
    setQuestReward(quest);
    
    // Handle quest chain unlocking
    if (quest.id === 'first-quest') {
      console.log('Attempting to unlock find-blacksmith quest');
      // Unlock find-blacksmith quest
      const elderNPC = npcs.find(n => n.id === 'elder');
      console.log('Elder NPC found:', elderNPC ? 'yes' : 'no');
      if (elderNPC) {
        const nextQuest = elderNPC.quests?.find(q => q.id === 'find-blacksmith');
        console.log('Next quest found:', nextQuest ? 'yes' : 'no');
        const questExists = quests.some(q => q.id === 'find-blacksmith');
        console.log('Quest already exists in quests array:', questExists);
        if (nextQuest && !questExists) {
          const unlockedQuest = { ...nextQuest, status: 'available' as const };
          console.log('Adding find-blacksmith quest to quests array');
          setQuests(prev => [...prev, unlockedQuest]);
        }
      }
    } else if (quest.id === 'find-blacksmith') {
      // Unlock coal quest
      const blacksmithNPC = npcs.find(n => n.id === 'blacksmith');
      if (blacksmithNPC) {
        const coalQuest = blacksmithNPC.quests?.find(q => q.id === 'find-coal');
        if (coalQuest) {
          const unlockedQuest = { ...coalQuest, status: 'available' as const };
          setQuests(prev => [...prev.filter(q => q.id !== coalQuest.id), unlockedQuest]);
        }
      }
    }
    
    setSelectedNPC(null);
  }, [npcs]);

  // Keyboard controls for desktop
  // Use refs to access current values for E key functionality
  const playerRef = useRef(player);
  const npcsRef = useRef(npcs);

  // Update refs when values change
  useEffect(() => {
    playerRef.current = player;
    npcsRef.current = npcs;
  }, [player, npcs]);

  useEffect(() => {
    if (isMobile) return;
    
    const pressedKeys = new Set<string>();

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedKeys.add(key);
      
      // E key for interaction (both English and Russian layout)
      if ((key === 'e' || key === 'у') && selectedNPC === null && activeMenu === 'none') {
        event.preventDefault();
        
        // Check if player is near any NPC (only in village)
        if (currentLocation === 'village') {
          const nearbyNPC = npcsRef.current.find(npc => {
            const distance = Math.sqrt(
              Math.pow(npc.position.x - playerRef.current.position.x, 2) + 
              Math.pow(npc.position.y - playerRef.current.position.y, 2)
            );
            return distance < 80;
          });
          
          if (nearbyNPC) {
            setSelectedNPC(nearbyNPC);
            setShowVisualNovel(true);
            return;
          }
          
          // Check if player is near fountain (only in village)
          const fountainDistance = Math.sqrt(
            Math.pow(400 - playerRef.current.position.x, 2) + 
            Math.pow(400 - playerRef.current.position.y, 2)
          );
          if (fountainDistance < 80) {
            handleFountainUse();
            return;
          }
        }
        
        // Check if player is near portal
        if (currentLocation === 'village') {
          const portalDistance = Math.sqrt(
            Math.pow(700 - playerRef.current.position.x, 2) + 
            Math.pow(300 - playerRef.current.position.y, 2)
          );
          if (portalDistance < 80) {
            handlePortalUse();
            return;
          }
        } else if (currentLocation === 'abandoned-mines') {
          // Check for coal mine
          const coalMineDistance = Math.sqrt(
            Math.pow(400 - playerRef.current.position.x, 2) + 
            Math.pow(400 - playerRef.current.position.y, 2)
          );
          if (coalMineDistance < 80) {
            handleCoalMineInteract();
            return;
          }
          
          // Check for ore mine
          const oreMineDistance = Math.sqrt(
            Math.pow(600 - playerRef.current.position.x, 2) + 
            Math.pow(500 - playerRef.current.position.y, 2)
          );
          if (oreMineDistance < 80) {
            handleOreMineInteract();
            return;
          }
          
          // Check for return portal
          const portalDistance = Math.sqrt(
            Math.pow(200 - playerRef.current.position.x, 2) + 
            Math.pow(400 - playerRef.current.position.y, 2)
          );
          if (portalDistance < 80) {
            handlePortalUse();
            return;
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedKeys.delete(key);
    };

    const movePlayer = () => {
      if (activeMenu !== 'none' || showCoalMining || showVisualNovel) return;
      
      const speed = 1.5;
      let deltaX = 0;
      let deltaY = 0;
      let newDirection = playerRef.current.direction;
      
      // Movement keys (English and Russian layout)
      if (pressedKeys.has('arrowup') || pressedKeys.has('w') || pressedKeys.has('ц')) {
        deltaY = -speed;
        newDirection = 'up';
      }
      if (pressedKeys.has('arrowdown') || pressedKeys.has('s') || pressedKeys.has('ы')) {
        deltaY = speed;
        newDirection = 'down';
      }
      if (pressedKeys.has('arrowleft') || pressedKeys.has('a') || pressedKeys.has('ф')) {
        deltaX = -speed;
        newDirection = 'left';
      }
      if (pressedKeys.has('arrowright') || pressedKeys.has('d') || pressedKeys.has('в')) {
        deltaX = speed;
        newDirection = 'right';
      }
      
      if (deltaX !== 0 || deltaY !== 0) {
        handleJoystickMove({ x: deltaX, y: deltaY });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    const moveInterval = setInterval(movePlayer, 16);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [isMobile, activeMenu, selectedNPC, handleJoystickMove]);

  const handleUnequipItem = useCallback((slot: keyof Equipment) => {
    const equippedItem = player.equipment[slot];
    if (!equippedItem) return;

    setPlayer(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [slot]: null
      },
      inventory: [...prev.inventory, equippedItem]
    }));

    // Item unequipped silently
  }, [player.equipment]);

const handleBuyItem = useCallback((item: Item) => {
    if (!item.price || player.coins < item.price) {
      return;
    }

    setPlayer(prev => ({
      ...prev,
      coins: prev.coins - item.price!,
      inventory: [...prev.inventory, item]
    }));

    // Item purchased silently
  }, [player.coins]);

  const handleSellItem = useCallback((item: Item) => {
    const price = getSellPrice(item);
    setPlayer(prev => ({
      ...prev,
      coins: prev.coins + price,
      inventory: removeItemFromInventory(prev.inventory, item.id, 1)
    }));

    // Item sold silently
  }, []);

  const handleTrade = useCallback(() => {
    setActiveMenu('trade');
    setSelectedNPC(null);
  }, []);

  const handleFountainUse = useCallback(() => {
    if (player.coins < 5) {
      toast({
        title: "Недостаточно монет",
        description: "Нужно 5 монет для использования фонтана",
        variant: "destructive"
      });
      return;
    }

    setPlayer(prev => ({
      ...prev,
      coins: prev.coins - 5,
      health: prev.maxHealth,
      mana: prev.maxMana,
      questProgress: {
        ...prev.questProgress,
        usedFountain: true
      }
    }));

    toast({
      title: "Фонтан исцеления",
      description: "Здоровье и мана полностью восстановлены!",
    });

    // Update first quest objective
    const firstQuest = quests.find(q => q.id === 'first-quest' && q.status === 'active');
    if (firstQuest) {
      const updatedObjectives = firstQuest.objectives.map(obj => 
        obj.description === 'Используй фонтан исцеления' ? { ...obj, completed: true } : obj
      );
      const updatedQuest = { ...firstQuest, objectives: updatedObjectives };
      setQuests(prev => [...prev.filter(q => q.id !== firstQuest.id), updatedQuest]);
    }
  }, [player.coins, quests, toast]);

  const handleCoalMineInteract = useCallback(() => {
    setShowCoalMining(true);
  }, []);

  const handleOreMineInteract = useCallback(() => {
    setShowOreMining(true);
  }, []);

  const handlePortalUse = useCallback(() => {
    setIsLoadingLocation(true);
    
    setTimeout(() => {
      if (currentLocation === 'village') {
        setCurrentLocation('abandoned-mines');
        setPlayer(prev => ({
          ...prev,
          position: { x: 200, y: 200 },
          targetPosition: { x: 200, y: 200 }
        }));
      } else {
        setCurrentLocation('village');
        setPlayer(prev => ({
          ...prev,
          position: { x: 600, y: 400 },
          targetPosition: { x: 600, y: 400 }
        }));
      }
      setIsLoadingLocation(false);
    }, 1500);
  }, [currentLocation]);

  const handleMineCoal = useCallback(() => {
    if (resourceNodes.coal.count <= 0) return;

    // Add coal to inventory
    const coal = {
      id: 'coal',
      name: 'Уголь',
      type: 'misc' as const,
      description: 'Высококачественный уголь для кузнечных работ',
      icon: '🪨',
      stackable: true,
      maxStack: 10
    };

    setPlayer(prev => ({
      ...prev,
      inventory: addItemsToInventory(prev.inventory, [coal])
    }));

    // Decrease resource count
    setResourceNodes(prev => ({
      ...prev,
      coal: {
        ...prev.coal,
        count: prev.coal.count - 1
      }
    }));

    // Update quest objective if exists
    const coalQuest = quests.find(q => q.id === 'find-coal' && q.status === 'active');
    if (coalQuest) {
      const updatedObjectives = coalQuest.objectives.map(obj => 
        obj.description === 'Найди уголь в лесу' ? { ...obj, completed: true } : obj
      );
      const updatedQuest = { ...coalQuest, objectives: updatedObjectives };
      setQuests(prev => [...prev.filter(q => q.id !== coalQuest.id), updatedQuest]);
    }
    
    setShowCoalMining(false);
    
    toast({
      title: "Добыча угля",
      description: "Вы добыли уголь!",
    });
  }, [resourceNodes.coal.count, quests, toast]);

  const handleMineOre = useCallback(() => {
    if (resourceNodes.ore.count <= 0) return;

    // Add ore to inventory
    const ore = {
      id: 'ore',
      name: 'Железная руда',
      type: 'misc' as const,
      description: 'Кусок железной руды высокого качества',
      icon: '⛏️',
      stackable: true,
      maxStack: 10
    };

    setPlayer(prev => ({
      ...prev,
      inventory: addItemsToInventory(prev.inventory, [ore])
    }));

    // Decrease resource count
    setResourceNodes(prev => ({
      ...prev,
      ore: {
        ...prev.ore,
        count: prev.ore.count - 1
      }
    }));

    // Update quest objective if exists
    const oreQuest = quests.find(q => q.id === 'ore-mining' && q.status === 'active');
    if (oreQuest) {
      const oreCount = getTotalItemQuantity(player.inventory, 'Железная руда') + 1; // +1 for the one we just added
      const updatedObjectives = oreQuest.objectives.map(obj => 
        obj.description.includes('Найти 3 куска руды') 
          ? { ...obj, description: `Найти 3 куска руды в заброшенных шахтах (${oreCount}/3)`, completed: oreCount >= 3 }
          : obj
      );
      const updatedQuest = { ...oreQuest, objectives: updatedObjectives };
      setQuests(prev => [...prev.filter(q => q.id !== oreQuest.id), updatedQuest]);
    }
    
    setShowOreMining(false);
    
    toast({
      title: "Добыча руды",
      description: "Вы добыли железную руду!",
    });
  }, [resourceNodes.ore.count, quests, player.inventory, toast]);

  // Render battle screens
  if (gameScreen === 'battle' && battleState) {
    return (
      <BattleScreen
        battleState={battleState}
        currentPlayer={player}
        onAttack={handleBattleAttack}
        onUseSkill={handleBattleSkill}
        onUseItem={handleBattleUseItem}
        onBattleEnd={handleBattleFlee}
        damageTexts={damageTexts}
        battleLog={battleLog}
      />
    );
  }

  if (gameScreen === 'battle-victory' && battleResult) {
    return (
      <BattleVictory
        experienceGained={battleResult.experienceGained}
        coinsGained={battleResult.coinsGained}
        lootItems={battleResult.lootItems}
        onContinue={handleBattleVictory}
      />
    );
  }

  if (gameScreen === 'battle-defeat') {
    return (
      <BattleDefeat
        onContinue={handleBattleDefeat}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        {/* World coordinates display */}
        <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded text-sm font-mono z-50 border border-white/20">
          <div className="text-green-400 font-bold">WORLD COORDINATES</div>
          <div>X: {Math.round(player.position.x)}</div>
          <div>Y: {Math.round(player.position.y)}</div>
          <div className="text-xs text-gray-300 mt-1">Location: {currentLocation}</div>
        </div>

        <PlayerStats player={player} />
      
          <GameMap
            player={player}
            npcs={npcs}
            enemies={currentLocation === 'abandoned-mines' ? enemies : []}
            onNPCInteract={handleNPCInteract}
            onEnemyClick={handleEnemyClick}
            onFountainUse={handleFountainUse}
            onCoalMineInteract={handleCoalMineInteract}
            currentLocation={currentLocation}
            onPortalUse={handlePortalUse}
          />

      {isMobile && (
        <VirtualJoystick
          onMove={handleJoystickMove}
          disabled={activeMenu !== 'none' || selectedNPC !== null}
        />
      )}

      {/* Sidebar Menu Trigger */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveMenu('sidebar')}
          className="bg-card/90 backdrop-blur-sm p-2"
          disabled={activeMenu !== 'none'}
        >
          <span className="flex flex-col space-y-1">
            <div className="w-4 h-0.5 bg-foreground"></div>
            <div className="w-4 h-0.5 bg-foreground"></div>
            <div className="w-4 h-0.5 bg-foreground"></div>
          </span>
        </Button>
      </div>

      {/* Sidebar Menu */}
      {activeMenu === 'sidebar' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex">
          <div className="w-2/3 h-full bg-card border-r border-border shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Меню</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveMenu('none')}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Menu Items */}
            <div className="flex-1 p-4 space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start text-left h-14 text-sm"
                onClick={() => {
                  setActiveMenu('inventory');
                }}
              >
                <span className="text-lg mr-3">🎒</span>
                Инвентарь
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-left h-14 text-sm"
                onClick={() => {
                  setActiveMenu('equipment');
                }}
              >
                <span className="text-lg mr-3">⚔️</span>
                Экипировка
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-left h-14 text-sm"
                onClick={() => {
                  setActiveMenu('quests');
                }}
              >
                <span className="text-lg mr-3">📜</span>
                Журнал квестов
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-left h-14 text-sm"
                onClick={() => {
                  setActiveMenu('stats');
                }}
              >
                <span className="text-lg mr-3">💪</span>
                Характеристики
                {player.unallocatedPoints > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {player.unallocatedPoints}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Empty area to close sidebar when clicked */}
          <div 
            className="flex-1 h-full"
            onClick={() => setActiveMenu('none')}
          />
        </div>
      )}

      {/* Visual Novel Dialogue */}
      {selectedNPC && showVisualNovel && (
        <VisualNovelDialogue
          npc={selectedNPC}
          hasActiveVillageQuest={quests.some(q => q.id === 'village-introduction' && q.status === 'active')}
          hasCompletedVillageQuest={completedQuestIds.includes('village-introduction')}
          onClose={() => {
            setSelectedNPC(null);
            setShowVisualNovel(false);
          }}
          onQuestAccept={(questId) => {
            // Create simple quest objects based on quest ID
            const questTemplates = {
              'village-defense': {
                id: 'village-defense',
                title: 'Защита деревни',
                description: 'Помочь старосте справиться с угрозой.',
                status: 'active' as const,
                giver: 'elder',
                repeatable: false,
                objectives: [
                  { description: 'Защитить деревню от зверей', completed: false }
                ],
                rewards: {
                  experience: 100,
                  coins: 50
                }
              },
              'wolf-pelts': {
                id: 'wolf-pelts',
                title: 'Шкуры волков',
                description: 'Добыть шкуры волков для торговца.',
                status: 'active' as const,
                giver: 'merchant',
                repeatable: false,
                objectives: [
                  { description: 'Принести шкуры волков', completed: false }
                ],
                rewards: {
                  experience: 75,
                  coins: 30
                }
              },
              'ore-mining': {
                id: 'ore-mining',
                title: 'Добыча руды',
                description: 'Добыть руду для кузнеца.',
                status: 'active' as const,
                giver: 'blacksmith',
                repeatable: false,
                objectives: [
                  { description: 'Добыть руду в шахте', completed: false }
                ],
                rewards: {
                  experience: 85,
                  coins: 40
                }
              }
            };

            const newQuest = questTemplates[questId];
            if (newQuest && !quests.some(q => q.id === questId)) {
              setQuests(prev => [...prev, newQuest]);
              toast({
                title: "Новый квест!",
                description: `Принят квест: ${newQuest.title}`,
              });
            }
          }}
        />
      )}

      {/* NPC Dialogue */}
      {selectedNPC && !showVisualNovel && (
        <NPCDialogue
          npc={selectedNPC}
          onClose={() => setSelectedNPC(null)}
          onAcceptQuest={handleAcceptQuest}
          onTrade={handleTrade}
          activeQuests={quests.filter(q => q.status === 'active')}
          onCompleteQuest={handleCompleteQuest}
          completedQuestIds={completedQuestIds}
          allQuests={quests}
        />
      )}

      {/* Menus */}
      {activeMenu === 'inventory' && (
        <InventoryMenu
          player={player}
          onClose={() => setActiveMenu('none')}
          onEquipItem={handleEquipItem}
        />
      )}

      {activeMenu === 'equipment' && (
        <EquipmentMenu
          player={player}
          onClose={() => setActiveMenu('none')}
          onUnequipItem={handleUnequipItem}
        />
      )}

      {activeMenu === 'quests' && (
        <QuestMenu
          quests={quests}
          onClose={() => setActiveMenu('none')}
        />
      )}

{activeMenu === 'trade' && (
        <TradeMenu
          player={player}
          merchant={npcs.find(npc => npc.type === 'merchant')!}
          onClose={() => setActiveMenu('none')}
          onBuyItem={handleBuyItem}
          onSellItem={handleSellItem}
        />
      )}

      {activeMenu === 'stats' && (
        <StatsMenu
          player={player}
          onClose={() => setActiveMenu('none')}
          onAllocatePoint={handleAllocatePoint}
        />
      )}

      {/* Coal Mining */}
      {showCoalMining && (
        <CoalMining
          onClose={() => setShowCoalMining(false)}
          onMineCoal={handleMineCoal}
          resourceCount={resourceNodes.coal.count}
        />
      )}

      {/* Ore Mining */}
      {showOreMining && (
        <OreMining
          onClose={() => setShowOreMining(false)}
          onMineOre={handleMineOre}
          resourceCount={resourceNodes.ore.count}
        />
      )}

      {/* Quest Reward Modal */}
      {questReward && (
        <QuestRewardModal
          quest={questReward}
          onClose={() => setQuestReward(null)}
        />
      )}

      {/* Loading Screen */}
      {isLoadingLocation && (
        <LoadingScreen 
          message={currentLocation === 'village' ? 'Переход в заброшенные шахты...' : 'Возвращение в деревню...'}
        />
      )}
    </div>
  );
};

export default RPGGame;