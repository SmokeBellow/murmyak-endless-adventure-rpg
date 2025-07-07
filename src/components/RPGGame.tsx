import { useState, useEffect, useCallback } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import InventoryMenu from './InventoryMenu';
import QuestMenu from './QuestMenu';
import NPCDialogue from './NPCDialogue';
import TradeMenu from './TradeMenu';
import VirtualJoystick from './VirtualJoystick';
import CoalMining from './CoalMining';
import QuestRewardModal from './QuestRewardModal';

const RPGGame = () => {
  const { toast } = useToast();
  const [gameScreen, setGameScreen] = useState<GameScreen>('game');
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [showCoalMining, setShowCoalMining] = useState(false);
  const [questReward, setQuestReward] = useState<Quest | null>(null);

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
          giver: 'elder',
          repeatable: false,
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
    
    // Complete quests ONLY at the NPC who gave them
    const activeQuestsForNPC = quests.filter(q => q.status === 'active' && q.giver === npc.id);
    
    activeQuestsForNPC.forEach(quest => {
      // Check if all objectives are completed
      const allObjectivesCompleted = quest.objectives.every(obj => obj.completed);
      
      if (allObjectivesCompleted) {
        // Complete the quest
        const completedQuest = {
          ...quest,
          status: 'completed' as const
        };
        setQuests(prev => [...prev.filter(q => q.id !== quest.id), completedQuest]);
        
        // Give rewards
        setPlayer(prev => ({
          ...prev,
          experience: prev.experience + quest.rewards.experience,
          coins: prev.coins + (quest.rewards.coins || 0),
          inventory: [...prev.inventory, ...(quest.rewards.items || [])]
        }));
        
        // Quest completed silently
        
        // Handle quest chain unlocking
        if (quest.id === 'first-quest') {
          // Unlock find-blacksmith quest
          const elderNPC = npcs.find(n => n.id === 'elder');
          if (elderNPC) {
            const nextQuest = elderNPC.quests?.find(q => q.id === 'find-blacksmith');
            if (nextQuest) {
              const unlockedQuest = { ...nextQuest, status: 'available' as const };
              setQuests(prev => [...prev.filter(q => q.id !== nextQuest.id), unlockedQuest]);
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
      }
    });
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
      // Unlock find-blacksmith quest
      const elderNPC = npcs.find(n => n.id === 'elder');
      if (elderNPC) {
        const nextQuest = elderNPC.quests?.find(q => q.id === 'find-blacksmith');
        if (nextQuest) {
          const unlockedQuest = { ...nextQuest, status: 'available' as const };
          setQuests(prev => [...prev.filter(q => q.id !== nextQuest.id), unlockedQuest]);
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
      <PlayerStats player={player} />
      
      <GameMap 
        player={player}
        npcs={npcs}
        onNPCInteract={handleNPCInteract}
        onFountainUse={handleFountainUse}
        onCoalMineInteract={handleCoalMineInteract}
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
          activeQuests={quests.filter(q => q.status === 'active')}
          onCompleteQuest={handleCompleteQuest}
          completedQuestIds={completedQuestIds}
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
    </div>
  );
};

export default RPGGame;