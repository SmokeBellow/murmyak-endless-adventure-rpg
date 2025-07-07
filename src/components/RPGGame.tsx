import { useState, useEffect, useCallback } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import InventoryMenu from './InventoryMenu';
import QuestMenu from './QuestMenu';
import NPCDialogue from './NPCDialogue';
import TradeMenu from './TradeMenu';
import VirtualJoystick from './VirtualJoystick';
import { useToast } from '@/hooks/use-toast';

const RPGGame = () => {
  const { toast } = useToast();
  const [gameScreen, setGameScreen] = useState<GameScreen>('game');
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

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
    position: { x: 500, y: 500 },
    targetPosition: { x: 500, y: 500 },
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
      position: { x: 470, y: 430 },
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
      position: { x: 530, y: 430 },
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
          objectives: [
            { description: 'Найди и поговори с кузнецом', completed: false }
          ],
          rewards: {
            experience: 25
          }
        }
      ]
    },
    {
      id: 'blacksmith',
      name: 'Кузнец Гром',
      position: { x: 320, y: 480 },
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
          description: 'Кузнецу нужен уголь для работы. Найди его в лесу.',
          status: 'locked',
          objectives: [
            { description: 'Найди уголь в лесу', completed: false }
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

  const handleJoystickMove = useCallback((direction: { x: number; y: number } | null) => {
    if (!direction) {
      setPlayer(prev => ({ ...prev, isMoving: false }));
      return;
    }

    const moveSpeed = 4;
    
    setPlayer(prev => {
      const { x, y } = prev.position;
      
      // Calculate new position
      let newX = x + (direction.x * moveSpeed);
      let newY = y + (direction.y * moveSpeed);
      
      // Boundary constraints
      newX = Math.max(50, Math.min(1950, newX));
      newY = Math.max(50, Math.min(1950, newY));
      
      // Check collision for joystick movement
      const buildings = [
        { x: 450, y: 450, width: 100, height: 100 },
        { x: 350, y: 500, width: 80, height: 60 },
        { x: 300, y: 460, width: 60, height: 50 },
      ];
      
      const fountainDistance = Math.sqrt(Math.pow(400 - newX, 2) + Math.pow(400 - newY, 2));
      if (fountainDistance < 25) {
        return prev; // Don't move if would collide with fountain
      }
      
      for (const building of buildings) {
        if (newX >= building.x && newX <= building.x + building.width &&
            newY >= building.y && newY <= building.y + building.height) {
          return prev; // Don't move if would collide with building
        }
      }
      
      return {
        ...prev,
        position: { x: newX, y: newY },
        targetPosition: { x: newX, y: newY },
        isMoving: true
      };
    });
  }, []);

  const handleNPCInteract = useCallback((npc: NPC) => {
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
      
      // Check if quest should be completed
      if (player.questProgress.usedFountain) {
        const activeQuest = quests.find(q => q.id === 'first-quest' && q.status === 'active');
        if (activeQuest) {
          const updatedQuest = {
            ...activeQuest,
            status: 'completed' as const,
            objectives: activeQuest.objectives.map(obj => ({ ...obj, completed: true }))
          };
          setQuests(prev => [...prev.filter(q => q.id !== activeQuest.id), updatedQuest]);
          
          // Give rewards
          setPlayer(prev => ({
            ...prev,
            experience: prev.experience + activeQuest.rewards.experience,
            coins: prev.coins + (activeQuest.rewards.coins || 0),
            inventory: [...prev.inventory, ...(activeQuest.rewards.items || [])]
          }));
          
          toast({
            title: 'Квест выполнен!',
            description: `${activeQuest.title} завершён! +${activeQuest.rewards.experience} опыта`,
            duration: 4000,
          });
        }
      }
    }
    
    // Handle blacksmith interaction - unlock coal quest if find-blacksmith is completed
    if (npc.type === 'blacksmith') {
      const findBlacksmithQuest = quests.find(q => q.id === 'find-blacksmith' && q.status === 'active');
      if (findBlacksmithQuest) {
        // Complete find-blacksmith quest
        const completedQuest = {
          ...findBlacksmithQuest,
          status: 'completed' as const,
          objectives: findBlacksmithQuest.objectives.map(obj => ({ ...obj, completed: true }))
        };
        setQuests(prev => [...prev.filter(q => q.id !== findBlacksmithQuest.id), completedQuest]);
        
        // Give rewards
        setPlayer(prev => ({
          ...prev,
          experience: prev.experience + findBlacksmithQuest.rewards.experience,
          coins: prev.coins + (findBlacksmithQuest.rewards.coins || 0)
        }));
        
        // Unlock coal quest
        const blacksmithNPC = npcs.find(n => n.id === 'blacksmith');
        if (blacksmithNPC) {
          const coalQuest = blacksmithNPC.quests?.find(q => q.id === 'find-coal');
          if (coalQuest) {
            const unlockedQuest = { ...coalQuest, status: 'available' as const };
            setQuests(prev => [...prev.filter(q => q.id !== coalQuest.id), unlockedQuest]);
          }
        }
        
        toast({
          title: 'Квест выполнен!',
          description: `${findBlacksmithQuest.title} завершён! Кузнец готов дать вам новое задание.`,
          duration: 4000,
        });
      }
    }
  }, [player.questProgress, quests, toast, npcs]);

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

    toast({
      title: 'Предмет экипирован',
      description: `${item.name} теперь экипирован`,
      duration: 2000,
    });
  }, [toast]);

  const handleAcceptQuest = useCallback((quest: Quest) => {
    const updatedQuest = { ...quest, status: 'active' as const };
    setQuests(prev => [...prev.filter(q => q.id !== quest.id), updatedQuest]);
    
    // Unlock next quest if completing first quest
    if (quest.id === 'first-quest') {
      const elderNPC = npcs.find(npc => npc.id === 'elder');
      if (elderNPC) {
        const nextQuest = elderNPC.quests?.find(q => q.id === 'find-blacksmith');
        if (nextQuest) {
          const unlockedQuest = { ...nextQuest, status: 'available' as const };
          setQuests(prev => [...prev.filter(q => q.id !== nextQuest.id), unlockedQuest]);
        }
      }
    }
    
    setSelectedNPC(null);
    
    toast({
      title: 'Квест принят!',
      description: `${quest.title} добавлен в журнал квестов`,
      duration: 3000,
    });
  }, [toast, npcs]);

  // Player movement animation at 60fps
  useEffect(() => {
    const animationFrame = () => {
      // This animation is now only for click-to-move, joystick uses direct movement
    };

    const interval = setInterval(animationFrame, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

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

    toast({
      title: 'Предмет снят',
      description: `${equippedItem.name} убран в инвентарь`,
      duration: 2000,
    });
  }, [player.equipment, toast]);

  const handleBuyItem = useCallback((item: Item) => {
    if (!item.price || player.coins < item.price) {
      toast({
        title: 'Недостаточно монет',
        description: `Нужно ${item.price} монет, у вас ${player.coins}`,
        duration: 2000,
      });
      return;
    }

    setPlayer(prev => ({
      ...prev,
      coins: prev.coins - item.price!,
      inventory: [...prev.inventory, item]
    }));

    toast({
      title: 'Покупка совершена!',
      description: `${item.name} добавлен в инвентарь`,
      duration: 2000,
    });
  }, [player.coins, toast]);

  const handleTrade = useCallback(() => {
    setActiveMenu('trade');
    setSelectedNPC(null);
  }, []);

  const handleFountainUse = useCallback(() => {
    if (player.coins < 5) {
      toast({
        title: 'Недостаточно монет',
        description: 'Нужно 5 монет для использования фонтана',
        duration: 2000,
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
      title: 'Фонтан использован!',
      description: 'Здоровье и мана восстановлены',
      duration: 2000,
    });

    // Check if quest should be completed
    if (player.questProgress.visitedMerchant) {
      const activeQuest = quests.find(q => q.id === 'first-quest' && q.status === 'active');
      if (activeQuest) {
        const updatedQuest = {
          ...activeQuest,
          status: 'completed' as const,
          objectives: activeQuest.objectives.map(obj => ({ ...obj, completed: true }))
        };
        setQuests(prev => [...prev.filter(q => q.id !== activeQuest.id), updatedQuest]);
        
        // Give rewards
        setPlayer(prev => ({
          ...prev,
          experience: prev.experience + activeQuest.rewards.experience,
          coins: prev.coins + (activeQuest.rewards.coins || 0),
          inventory: [...prev.inventory, ...(activeQuest.rewards.items || [])]
        }));
        
        toast({
          title: 'Квест выполнен!',
          description: `${activeQuest.title} завершён! +${activeQuest.rewards.experience} опыта`,
          duration: 4000,
        });
      }
    }
  }, [player.coins, player.questProgress, quests, toast]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <PlayerStats player={player} />
      
      <GameMap 
        player={player}
        npcs={npcs}
        onPlayerMove={handlePlayerMove}
        onNPCInteract={handleNPCInteract}
        onFountainUse={handleFountainUse}
      />

      <VirtualJoystick
        onMove={handleJoystickMove}
        disabled={activeMenu !== 'none' || selectedNPC !== null}
      />

      {/* Game Controls */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <div className="flex justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveMenu('inventory')}
            className="bg-card/90 backdrop-blur-sm"
          >
            🎒 Инвентарь
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveMenu('quests')}
            className="bg-card/90 backdrop-blur-sm"
          >
            📜 Квесты
          </Button>
        </div>
      </div>

      {/* NPC Dialogue */}
      {selectedNPC && (
        <NPCDialogue
          npc={selectedNPC}
          onClose={() => setSelectedNPC(null)}
          onAcceptQuest={handleAcceptQuest}
          onTrade={handleTrade}
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
    </div>
  );
};

export default RPGGame;