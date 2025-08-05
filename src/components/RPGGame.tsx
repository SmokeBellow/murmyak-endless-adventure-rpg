import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType, LocationType } from '@/types/gameTypes';
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
import QuestRewardModal from './QuestRewardModal';
import LoadingScreen from './LoadingScreen';

const RPGGame = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [gameScreen, setGameScreen] = useState<GameScreen>('game');
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [showVisualNovel, setShowVisualNovel] = useState(false);
  const [showCoalMining, setShowCoalMining] = useState(false);
  const [questReward, setQuestReward] = useState<Quest | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationType>('village');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
      
      if (key === 'e' && selectedNPC === null && activeMenu === 'none') {
        event.preventDefault();
        // Check if player is near any NPC
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
      
      if (pressedKeys.has('arrowup') || pressedKeys.has('w')) {
        deltaY = -speed;
        newDirection = 'up';
      }
      if (pressedKeys.has('arrowdown') || pressedKeys.has('s')) {
        deltaY = speed;
        newDirection = 'down';
      }
      if (pressedKeys.has('arrowleft') || pressedKeys.has('a')) {
        deltaX = -speed;
        newDirection = 'left';
      }
      if (pressedKeys.has('arrowright') || pressedKeys.has('d')) {
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
    const coalQuest = quests.find(q => q.id === 'find-coal' && q.status === 'active');
    const oreQuest = quests.find(q => q.id === 'ore-mining' && q.status === 'active');
    const hasCoal = player.inventory.some(item => item.id === 'coal');
    const oreCount = player.inventory.filter(item => item.id === 'ore').length;
    
    // Check which mine the player clicked based on location and position
    const isNearOreMine = Math.sqrt(Math.pow(600 - player.position.x, 2) + Math.pow(500 - player.position.y, 2)) < 80;
    
    if (oreQuest && isNearOreMine && oreCount < 3) {
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
      
      // Update quest objective
      const newOreCount = oreCount + 1;
      const updatedObjectives = oreQuest.objectives.map(obj => 
        obj.description.includes('Найти 3 куска руды') 
          ? { ...obj, description: `Найти 3 куска руды в заброшенных шахтах (${newOreCount}/3)`, completed: newOreCount >= 3 }
          : obj
      );
      const updatedQuest = { ...oreQuest, objectives: updatedObjectives };
      setQuests(prev => [...prev.filter(q => q.id !== oreQuest.id), updatedQuest]);
      
      setShowCoalMining(false);
    } else if (coalQuest && !hasCoal && !isNearOreMine) {
      // Add coal to inventory (original coal mining logic)
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
      
      // Update quest objective
      const updatedObjectives = coalQuest.objectives.map(obj => 
        obj.description === 'Найди уголь в лесу' ? { ...obj, completed: true } : obj
      );
      const updatedQuest = { ...coalQuest, objectives: updatedObjectives };
      setQuests(prev => [...prev.filter(q => q.id !== coalQuest.id), updatedQuest]);
      
      setShowCoalMining(false);
    }
  }, [quests, player.inventory, player.position]);

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
        onNPCInteract={handleNPCInteract}
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
          canMine={
            (quests.some(q => q.id === 'find-coal' && q.status === 'active') && !player.inventory.some(item => item.id === 'coal')) ||
            (quests.some(q => q.id === 'ore-mining' && q.status === 'active') && player.inventory.filter(item => item.id === 'ore').length < 3)
          }
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