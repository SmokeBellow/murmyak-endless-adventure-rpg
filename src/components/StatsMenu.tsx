import React from 'react';
import { Player } from '@/types/gameTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface StatsMenuProps {
  player: Player;
  onClose: () => void;
  onAllocatePoint: (stat: keyof Player['stats']) => void;
}

const StatsMenu = ({ player, onClose, onAllocatePoint }: StatsMenuProps) => {
  const getStatDescription = (stat: keyof Player['stats']) => {
    switch (stat) {
      case 'strength':
        return 'Увеличивает урон и шанс частично заблокировать урон';
      case 'agility':
        return 'Увеличивает скорость передвижения и шанс увернуться от атаки';
      case 'intelligence':
        return 'Увеличивает количество маны и скорость ее восстановления';
      case 'constitution':
        return 'Увеличивает количество очков здоровья и скорость их восстановления';
      case 'luck':
        return 'Увеличивает шанс критического урона';
      default:
        return '';
    }
  };

  const getStatName = (stat: keyof Player['stats']) => {
    switch (stat) {
      case 'strength':
        return 'Сила';
      case 'agility':
        return 'Ловкость';
      case 'intelligence':
        return 'Интеллект';
      case 'constitution':
        return 'Телосложение';
      case 'luck':
        return 'Удача';
      default:
        return '';
    }
  };

  const statOrder: (keyof Player['stats'])[] = ['strength', 'agility', 'intelligence', 'constitution', 'luck'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-[600px] max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Характеристики</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Нераспределённых очков: {player.unallocatedPoints}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {statOrder.map((stat) => (
              <div key={stat} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{getStatName(stat)}</h4>
                    <span className="text-lg font-bold text-primary">
                      {player.stats[stat]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getStatDescription(stat)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={player.unallocatedPoints === 0}
                  onClick={() => onAllocatePoint(stat)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {player.unallocatedPoints === 0 && (
            <div className="text-center text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
              Нет доступных очков для распределения. Получите новый уровень, чтобы получить больше очков.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsMenu;