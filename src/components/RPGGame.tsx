import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType, LocationType, Enemy, BattleState, BattleResult } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import InventoryMenu from './InventoryMenu';
import EquipmentMenu from './EquipmentMenu';
import QuestMenu from './QuestMenu';
import NPCDialogue from './NPCDialogue';
import VisualNovelDialogue from './VisualNovelDialogue';
import TradeMenu from './TradeMenu';
import VirtualJoystick from './VirtualJoystick';
import CoalMining from './CoalMining';
import OreMining from './OreMining';
import QuestRewardModal from './QuestRewardModal';
import LoadingScreen from './LoadingScreen';
import { useEnemySystem } from './EnemySystem';
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
      icon: '/healthpotion.png'
    }
  ];

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
    setBattleState({
      player,
      enemy,
      location: currentLocation,
      playerAction: null,
      turn: 'player'
    });
    setGameScreen('battle');
    setBattleLog([`Бой с ${enemy.name} начинается!`]);
    setDamageTexts([]);
  }, [player, currentLocation]);

  const handleBattleEnd = useCallback(() => {
    setBattleState(null);
    setBattleResult(null);
    setGameScreen('game');
    setBattleLog([]);
    setDamageTexts([]);
  }, []);

  const addDamageText = useCallback((amount: number, target: 'player' | 'enemy', type: 'damage' | 'heal' | 'defend' = 'damage') => {
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
    
    // Player attacks enemy
    const weaponDamage = player.equipment.weapon?.stats?.damage || 10;
    const totalDamage = Math.floor(weaponDamage * (0.8 + Math.random() * 0.4));
    
    const newEnemyHealth = Math.max(0, battleState.enemy.health - totalDamage);
    
    // Update battle state with new enemy health
    const updatedBattleState = {
      ...battleState,
      enemy: { ...battleState.enemy, health: newEnemyHealth }
    };
    
    setBattleState(updatedBattleState);
    addDamageText(totalDamage, 'enemy', 'damage');
    addBattleLog(`Вы атакуете ${battleState.enemy.name} и наносите ${totalDamage} урона!`);
    
    if (newEnemyHealth <= 0) {
      // Enemy defeated
      addBattleLog(`${battleState.enemy.name} повержен!`);
      
      // Generate battle result
      const experienceGained = Math.floor(Math.random() * 20) + 10;
      const coinsGained = Math.floor(Math.random() * 10) + 5;
      const lootItems: Item[] = [];
      
      // Random loot chance
      if (Math.random() < 0.3) { // 30% chance for loot
        lootItems.push({
          id: 'health-potion-' + Date.now(),
          name: 'Зелье здоровья',
          type: 'consumable',
          description: 'Восстанавливает 50 единиц здоровья',
          icon: '/healthpotion.png'
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
          inventory: [...prev.inventory, ...lootItems]
        }));
      }, 1500);
      return;
    }
    
    // Enemy's turn
    setBattleState(prev => prev ? {
      ...prev,
      turn: 'enemy'
    } : null);
    
    // Enemy attacks after delay
    setTimeout(() => {
      if (updatedBattleState) {
        const enemyDamage = updatedBattleState.enemy.damage;
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
        addBattleLog(`${updatedBattleState.enemy.name} атакует вас и наносит ${enemyDamage} урона!`);
        
        // Check if player is defeated
        if (newPlayerHealth <= 0) {
          addBattleLog("Вы падаете без сознания...");
          setTimeout(() => {
            setGameScreen('battle-defeat');
          }, 1500);
        }
      }
    }, 1000);
  }, [battleState, handleBattleEnd, player.equipment.weapon, addDamageText, addBattleLog]);

  const handleBattleDefend = useCallback(() => {
    if (!battleState || battleState.turn !== 'player') return;
    
    // Player defends - reduced damage from enemy
    setBattleState(prev => prev ? {
      ...prev,
      turn: 'enemy'
    } : null);
    
    addDamageText(0, 'player', 'defend');
    addBattleLog("Вы принимаете защитную стойку!");
    
    // Enemy attacks with reduced damage
    setTimeout(() => {
      if (battleState) {
        const enemyDamage = Math.floor(battleState.enemy.damage * 0.5);
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
        addBattleLog(`${battleState.enemy.name} атакует, но вы блокируете часть урона! Получено ${enemyDamage} урона!`);
        
        // Check if player is defeated
        if (newPlayerHealth <= 0) {
          addBattleLog("Вы падаете без сознания...");
          setTimeout(() => {
            setGameScreen('battle-defeat');
          }, 1500);
        }
      }
    }, 1000);
  }, [battleState, addDamageText, addBattleLog]);

  const handleBattleUseItem = useCallback((item: Item) => {
    if (!battleState || battleState.turn !== 'player') return;
    
    // Use item logic
    if (item.name === 'Зелье здоровья') {
      const healAmount = 50;
      setPlayer(prev => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + healAmount),
        inventory: prev.inventory.filter(invItem => invItem.id !== item.id)
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
      if (battleState) {
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
      }
    }, 1000);
  }, [battleState, addDamageText, addBattleLog, player.health]);

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

  // Handle battle victory
  const handleBattleVictory = useCallback(() => {
    handleBattleEnd();
  }, [handleBattleEnd]);

  // Enemy system (only in abandoned mines)
  const { enemies, attackEnemy } = useEnemySystem({
    player,
    onPlayerTakeDamage: currentLocation === 'abandoned-mines' ? handlePlayerTakeDamage : () => {},
    onBattleStart: handleBattleStart
  });

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
      const hasCoal = player.inventory.some(item => item.id === 'coal');
      
      if (coalQuest && hasCoal) {
        // Remove coal from inventory
        setPlayer(prev => ({
          ...prev,
          inventory: prev.inventory.filter(item => item.id !== 'coal')
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
      const oreCount = player.inventory.filter(item => item.id === 'ore').length;
      
      if (oreQuest && oreCount >= 3) {
        // Remove 3 ore from inventory
        let removedOre = 0;
        setPlayer(prev => ({
          ...prev,
          inventory: prev.inventory.filter(item => {
            if (item.id === 'ore' && removedOre < 3) {
              removedOre++;
              return false;
            }
            return true;
          })
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
      const newInventory = prev.inventory.filter(invItem => invItem.id !== item.id);
      
      // If there's already an item in this slot, move it to inventory
      if (newEquipment[item.slot]) {
        newInventory.push(newEquipment[item.slot]!);
      }
      
      newEquipment[item.slot] = item;

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
      inventory: [...prev.inventory, ...(quest.rewards.items || [])]
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
      icon: '🪨'
    };
    
    setPlayer(prev => ({
      ...prev,
      inventory: [...prev.inventory, coal]
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
      icon: '⛏️'
    };
    
    setPlayer(prev => ({
      ...prev,
      inventory: [...prev.inventory, ore]
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
      const oreCount = player.inventory.filter(item => item.id === 'ore').length + 1; // +1 for the one we just added
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
        onAttack={handleBattleAttack}
        onDefend={handleBattleDefend}
        onUseItem={handleBattleUseItem}
        onBattleEnd={handleBattleEnd}
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