import React, { useState, useEffect, useCallback } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType, LocationType } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import InventoryMenu from './InventoryMenu';
import QuestMenu from './QuestMenu';
import NPCDialogue from './NPCDialogue';
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
      icon: '🛡️'
    },
    {
      id: 'health-potion',
      name: 'Зелье здоровья',
      type: 'consumable',
      description: 'Восстанавливает 50 единиц здоровья',
      icon: '🧪'
    }
  ];

  // Player state
  const [player, setPlayer] = useState<Player>({
    name: 'Герой',
    position: { x: 600, y: 400 }, // Safe position away from buildings
    targetPosition: { x: 600, y: 400 },
    isMoving: false,
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
      usedFountain: false
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
          icon: '⚔️',
          price: 25
        },
        {
          id: 'steel-armor',
          name: 'Стальная броня',
          type: 'armor',
          slot: 'chest',
          stats: { armor: 8 },
          description: 'Прочная стальная броня',
          icon: '🛡️',
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
          id: 'first-quest',
          title: 'Знакомство с деревней',
          description: 'Познакомься с жителями деревни и изучи окрестности.',
          status: 'available',
          giver: 'elder',
          repeatable: false,
          objectives: [
            { description: 'Поговори с торговцем', completed: false },
            { description: 'Используй фонтан исцеления', completed: false }
          ],
          rewards: {
            experience: 50,
            coins: 20
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

  // Collision detection RESTORED - персонаж не может проходить сквозь препятствия
  const isColliding = useCallback((x: number, y: number) => {
    if (currentLocation === 'village') {
      // Building collisions in village - ИСПРАВЛЕННЫЕ координаты
      const buildings = [
        { x: 870, y: 420, width: 96, height: 96 }, // House.png image - дом справа и ниже персонажа
        { x: 850, y: 550, width: 80, height: 60 },   // Second building
        { x: 800, y: 510, width: 60, height: 50 },   // Blacksmith forge
      ];
      
      // Fountain collision - center at (400,400)
      const fountainDistance = Math.sqrt(Math.pow(400 - x, 2) + Math.pow(400 - y, 2));
      if (fountainDistance < 25) return true;
      
      // Check building collisions
      for (const building of buildings) {
        if (x >= building.x && x <= building.x + building.width &&
            y >= building.y && y <= building.y + building.height) {
          return true;
        }
      }
      
      // NPC collisions - персонаж не может проходить сквозь NPC
      const npcPositions = [
        { x: 1070, y: 530, radius: 20 }, // Торговец
        { x: 820, y: 490, radius: 20 },  // Староста
        { x: 780, y: 540, radius: 20 },  // Кузнец
      ];
      
      for (const npcPos of npcPositions) {
        const distance = Math.sqrt(Math.pow(npcPos.x - x, 2) + Math.pow(npcPos.y - y, 2));
        if (distance < npcPos.radius) return true;
      }
      
    } else if (currentLocation === 'abandoned-mines') {
      // Mine walls and barriers
      const mineWalls = [
        // Horizontal walls
        { x: 100, y: 200, width: 90, height: 20 },
        { x: 210, y: 200, width: 90, height: 20 },
        { x: 320, y: 200, width: 90, height: 20 },
        { x: 430, y: 200, width: 90, height: 20 },
        { x: 540, y: 200, width: 80, height: 20 },
        
        { x: 100, y: 320, width: 90, height: 20 },
        { x: 230, y: 320, width: 80, height: 20 },
        { x: 350, y: 320, width: 90, height: 20 },
        { x: 480, y: 320, width: 140, height: 20 },
        
        { x: 100, y: 440, width: 120, height: 20 },
        { x: 260, y: 440, width: 80, height: 20 },
        { x: 380, y: 440, width: 100, height: 20 },
        { x: 520, y: 440, width: 100, height: 20 },
        
        { x: 150, y: 560, width: 100, height: 20 },
        { x: 290, y: 560, width: 120, height: 20 },
        { x: 450, y: 560, width: 90, height: 20 },
        
        // Vertical walls
        { x: 100, y: 220, width: 20, height: 100 },
        { x: 170, y: 220, width: 20, height: 80 },
        { x: 210, y: 240, width: 20, height: 80 },
        { x: 280, y: 220, width: 20, height: 120 },
        { x: 350, y: 220, width: 20, height: 100 },
        { x: 410, y: 220, width: 20, height: 80 },
        { x: 480, y: 220, width: 20, height: 100 },
        { x: 540, y: 220, width: 20, height: 120 },
        { x: 600, y: 220, width: 20, height: 100 },
        
        { x: 120, y: 340, width: 20, height: 100 },
        { x: 190, y: 340, width: 20, height: 80 },
        { x: 230, y: 340, width: 20, height: 100 },
        { x: 310, y: 340, width: 20, height: 100 },
        { x: 380, y: 340, width: 20, height: 100 },
        { x: 440, y: 340, width: 20, height: 80 },
        { x: 520, y: 340, width: 20, height: 100 },
        { x: 580, y: 340, width: 20, height: 120 },
        
        { x: 150, y: 460, width: 20, height: 100 },
        { x: 220, y: 460, width: 20, height: 80 },
        { x: 290, y: 460, width: 20, height: 100 },
        { x: 360, y: 460, width: 20, height: 100 },
        { x: 450, y: 460, width: 20, height: 100 },
        { x: 520, y: 460, width: 20, height: 80 },
      ];
      
      // Check mine wall collisions
      for (const wall of mineWalls) {
        if (x >= wall.x && x <= wall.x + wall.width &&
            y >= wall.y && y <= wall.y + wall.height) {
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
      newX = Math.max(50, Math.min(1950, newX));
      newY = Math.max(50, Math.min(1950, newY));
      
      // Collision detection RESTORED - проверяем коллизии с препятствиями
      if (isColliding(newX, newY)) {
        console.log('Collision detected at:', newX, newY, '- movement blocked');
        return prev; // Don't move if would collide
      }
      
      return {
        ...prev,
        position: { x: newX, y: newY },
        targetPosition: { x: newX, y: newY },
        isMoving: true
      };
    });
  }, [currentLocation]);

  const handleNPCInteract = useCallback((npc: NPC) => {
    console.log('handleNPCInteract called with:', npc.name);
    console.log('Current player position:', player.position);
    console.log('NPC position:', npc.position);
    setSelectedNPC(npc);
    
    // Mark merchant as visited for quest progress
    if (npc.type === 'merchant') {
      setPlayer(prev => ({
        ...prev,
        questProgress: {
          ...prev.questProgress,
          visitedMerchant: true
        }
      }));
      
      // Update first quest objective
      const firstQuest = quests.find(q => q.id === 'first-quest' && q.status === 'active');
      if (firstQuest) {
        const updatedObjectives = firstQuest.objectives.map(obj => 
          obj.description === 'Поговори с торговцем' ? { ...obj, completed: true } : obj
        );
        const updatedQuest = { ...firstQuest, objectives: updatedObjectives };
        setQuests(prev => [...prev.filter(q => q.id !== firstQuest.id), updatedQuest]);
      }
    }
    
    // Handle blacksmith interaction for find-blacksmith quest
    if (npc.type === 'blacksmith') {
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
  useEffect(() => {
    if (isMobile) return;

    const pressedKeys = new Set<string>();

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // WASD, Arrow keys, and ЦФЫВ (Russian layout)
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'ц', 'ф', 'ы', 'в'].includes(key)) {
        event.preventDefault();
        pressedKeys.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedKeys.delete(key);
    };

    const updateMovement = () => {
      if (activeMenu !== 'none' || selectedNPC !== null) return;

      let x = 0;
      let y = 0;

      // Check pressed keys for movement direction
      if (pressedKeys.has('w') || pressedKeys.has('arrowup') || pressedKeys.has('ц')) y = -1;
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown') || pressedKeys.has('ы')) y = 1;
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft') || pressedKeys.has('ф')) x = -1;
      if (pressedKeys.has('d') || pressedKeys.has('arrowright') || pressedKeys.has('в')) x = 1;

      // Normalize diagonal movement
      if (x !== 0 && y !== 0) {
        x *= 0.707; // 1/√2
        y *= 0.707;
      }

      if (x !== 0 || y !== 0) {
        handleJoystickMove({ x, y });
      } else {
        handleJoystickMove(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    const moveInterval = setInterval(updateMovement, 16); // 60fps for maximum smoothness

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
    const hasCoal = player.inventory.some(item => item.id === 'coal');
    
    if (coalQuest && !hasCoal) {
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
      
      // Update quest objective
      const updatedObjectives = coalQuest.objectives.map(obj => 
        obj.description === 'Найди уголь в лесу' ? { ...obj, completed: true } : obj
      );
      const updatedQuest = { ...coalQuest, objectives: updatedObjectives };
      setQuests(prev => [...prev.filter(q => q.id !== coalQuest.id), updatedQuest]);
      
      // Coal mined silently
      
      setShowCoalMining(false);
    } else {
      // Cannot mine coal silently
    }
  }, [quests, player.inventory]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        {/* Player coordinates display */}
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-sm font-mono z-50">
          Player: ({Math.round(player.position.x)}, {Math.round(player.position.y)})
          <br />
          Location: {currentLocation}
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

      {/* NPC Dialogue */}
      {selectedNPC && (
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
          onUnequipItem={handleUnequipItem}
        />
      )}

      {activeMenu === 'equipment' && (
        <InventoryMenu
          player={player}
          onClose={() => setActiveMenu('none')}
          onEquipItem={handleEquipItem}
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
          canMine={quests.some(q => q.id === 'find-coal' && q.status === 'active') && !player.inventory.some(item => item.id === 'coal')}
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