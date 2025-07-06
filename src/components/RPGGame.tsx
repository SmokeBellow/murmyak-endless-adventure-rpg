import { useState, useEffect, useCallback } from 'react';
import { Player, NPC, Item, Equipment, Quest, GameScreen, MenuType } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import GameIntro from './GameIntro';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import InventoryMenu from './InventoryMenu';
import QuestMenu from './QuestMenu';
import NPCDialogue from './NPCDialogue';
import MobileControls from './MobileControls';
import { useToast } from '@/hooks/use-toast';

const RPGGame = () => {
  const { toast } = useToast();
  const [gameScreen, setGameScreen] = useState<GameScreen>('intro');
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
    position: { x: 10, y: 10 },
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    experience: 0,
    level: 1,
    inventory: initialItems,
    equipment: {
      head: null,
      chest: null,
      legs: null,
      weapon: null,
      shield: null
    }
  });

  // NPCs
  const [npcs] = useState<NPC[]>([
    {
      id: 'merchant',
      name: 'Торговец Марк',
      position: { x: 9, y: 8 },
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
          icon: '⚔️'
        }
      ]
    },
    {
      id: 'elder',
      name: 'Староста Эдвин',
      position: { x: 11, y: 8 },
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
            { description: 'Исследуй деревню', completed: false }
          ],
          rewards: {
            experience: 50,
            items: [{
              id: 'village-ring',
              name: 'Кольцо деревни',
              type: 'misc',
              description: 'Памятный подарок от жителей деревни',
              icon: '💍'
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
      position: newPosition
    }));
  }, []);

  const handleNPCInteract = useCallback((npc: NPC) => {
    setSelectedNPC(npc);
  }, []);

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
    setSelectedNPC(null);
    
    toast({
      title: 'Квест принят!',
      description: `${quest.title} добавлен в журнал квестов`,
      duration: 3000,
    });
  }, [toast]);

  const handleMobileMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const { x, y } = player.position;
    let newX = x;
    let newY = y;
    
    switch (direction) {
      case 'up':
        newY = Math.max(0, y - 1);
        break;
      case 'down':
        newY = Math.min(19, y + 1);
        break;
      case 'left':
        newX = Math.max(0, x - 1);
        break;
      case 'right':
        newX = Math.min(19, x + 1);
        break;
    }
    
    if (newX !== x || newY !== y) {
      handlePlayerMove({ x: newX, y: newY });
    }
  }, [player.position, handlePlayerMove]);

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

  if (gameScreen === 'intro') {
    return <GameIntro onComplete={() => setGameScreen('game')} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <PlayerStats player={player} />
      
      <GameMap 
        player={player}
        npcs={npcs}
        onPlayerMove={handlePlayerMove}
        onNPCInteract={handleNPCInteract}
      />

      <MobileControls
        player={player}
        onMove={handleMobileMove}
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
    </div>
  );
};

export default RPGGame;