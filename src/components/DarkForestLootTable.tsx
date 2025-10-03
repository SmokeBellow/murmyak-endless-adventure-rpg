import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const DarkForestLootTable = () => {
  const lootData = [
    // Темный волк
    {
      enemy: 'Темный волк',
      items: [
        { name: 'Клык волка', type: 'Мусор', sellPrice: 5, chance: 30, rarity: 'common' },
        { name: 'Тёмная шерсть', type: 'Мусор', sellPrice: 8, chance: 20, rarity: 'common' },
        { name: 'Волчий коготь', type: 'Мусор', sellPrice: 12, chance: 15, rarity: 'uncommon' },
        { name: 'Сердце волка', type: 'Мусор', sellPrice: 20, chance: 5, rarity: 'rare' },
        { name: 'Лунный осколок', type: 'Мусор', sellPrice: 35, chance: 2, rarity: 'epic' },
        { name: 'Волчьи перчатки', type: 'Оружие', sellPrice: 30, chance: 6, rarity: 'rare', stats: '+5 урон, +2 сила' },
        { name: 'Шкура волка', type: 'Броня', sellPrice: 45, chance: 4, rarity: 'rare', stats: '+8 защита, +15 HP' },
      ]
    },
    // Лесной дух
    {
      enemy: 'Лесной дух',
      items: [
        { name: 'Эфирная пыль', type: 'Мусор', sellPrice: 10, chance: 35, rarity: 'common' },
        { name: 'Духовная эссенция', type: 'Мусор', sellPrice: 15, chance: 20, rarity: 'uncommon' },
        { name: 'Призрачный осколок', type: 'Мусор', sellPrice: 22, chance: 12, rarity: 'uncommon' },
        { name: 'Кристалл души', type: 'Мусор', sellPrice: 40, chance: 6, rarity: 'rare' },
        { name: 'Сердце леса', type: 'Мусор', sellPrice: 60, chance: 2, rarity: 'epic' },
        { name: 'Призрачный шлем', type: 'Броня', sellPrice: 50, chance: 5, rarity: 'rare', stats: '+5 защита, +20 мана' },
        { name: 'Эфирный посох', type: 'Оружие', sellPrice: 70, chance: 3, rarity: 'epic', stats: '+8 урон, +4 интеллект' },
      ]
    },
    // Древний паук
    {
      enemy: 'Древний паук',
      items: [
        { name: 'Паутина', type: 'Мусор', sellPrice: 7, chance: 40, rarity: 'common' },
        { name: 'Ядовитая железа', type: 'Мусор', sellPrice: 14, chance: 25, rarity: 'common' },
        { name: 'Хитиновый осколок', type: 'Мусор', sellPrice: 18, chance: 15, rarity: 'uncommon' },
        { name: 'Паучий яд', type: 'Мусор', sellPrice: 30, chance: 8, rarity: 'rare' },
        { name: 'Драгоценный хитин', type: 'Мусор', sellPrice: 50, chance: 3, rarity: 'epic' },
        { name: 'Хитиновый щит', type: 'Щит', sellPrice: 40, chance: 5, rarity: 'rare', stats: '+10 защита, +10 HP' },
        { name: 'Ядовитый клинок', type: 'Оружие', sellPrice: 60, chance: 4, rarity: 'epic', stats: '+12 урон, +3 ловкость' },
        { name: 'Хитиновый шлем', type: 'Броня', sellPrice: 35, chance: 5, rarity: 'rare', stats: '+6 защита, +12 HP' },
      ]
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'uncommon': return 'Необычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Обычный';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Таблица лута Темного леса</h1>
        <p className="text-muted-foreground">Все предметы, которые можно получить с врагов в Темном лесу</p>
      </div>

      {lootData.map((enemyData) => (
        <Card key={enemyData.enemy} className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary">{enemyData.enemy}</h2>
          <Table>
            <TableCaption>Лут с врага "{enemyData.enemy}"</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Предмет</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Редкость</TableHead>
                <TableHead className="text-center">Шанс</TableHead>
                <TableHead className="text-right">Цена продажи</TableHead>
                <TableHead>Характеристики</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enemyData.items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <Badge className={getRarityColor(item.rarity)}>
                      {getRarityText(item.rarity)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    <span className={
                      item.chance >= 20 ? 'text-green-500' :
                      item.chance >= 10 ? 'text-yellow-500' :
                      item.chance >= 5 ? 'text-orange-500' :
                      'text-red-500'
                    }>
                      {item.chance}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-yellow-500 font-semibold">{item.sellPrice} 🪙</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.stats || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}

      <Card className="p-6 bg-primary/5">
        <h3 className="text-xl font-bold mb-4">📊 Статистика по редкости</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <Badge className="bg-gray-500 mb-2">Обычный</Badge>
            <p className="text-sm text-muted-foreground">15-40% шанс</p>
          </div>
          <div className="text-center">
            <Badge className="bg-green-500 mb-2">Необычный</Badge>
            <p className="text-sm text-muted-foreground">10-20% шанс</p>
          </div>
          <div className="text-center">
            <Badge className="bg-blue-500 mb-2">Редкий</Badge>
            <p className="text-sm text-muted-foreground">4-8% шанс</p>
          </div>
          <div className="text-center">
            <Badge className="bg-purple-500 mb-2">Эпический</Badge>
            <p className="text-sm text-muted-foreground">2-4% шанс</p>
          </div>
          <div className="text-center">
            <Badge className="bg-orange-500 mb-2">Легендарный</Badge>
            <p className="text-sm text-muted-foreground">&lt;1% шанс</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-accent/10">
        <h3 className="text-xl font-bold mb-3">💡 Советы по фарму</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>Темные волки</strong> — лучший источник клыков и шкур для крафта брони</li>
          <li>• <strong>Лесные духи</strong> — дают магические эссенции для заклинаний и посохов</li>
          <li>• <strong>Древние пауки</strong> — самые опасные, но дают ценный хитин и яд</li>
          <li>• Враги респавнятся через 5 минут после смерти</li>
          <li>• Шанс лута рассчитывается независимо для каждого предмета</li>
        </ul>
      </Card>
    </div>
  );
};
