import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BattleState, Item } from '@/types/gameTypes';

interface BattleScreenProps {
  battleState: BattleState;
  onAttack: () => void;
  onDefend: () => void;
  onUseItem: (item: Item) => void;
  onBattleEnd: () => void;
}

export const BattleScreen = ({ 
  battleState, 
  onAttack, 
  onDefend, 
  onUseItem, 
  onBattleEnd 
}: BattleScreenProps) => {
  const { player, enemy, location } = battleState;
  
  // Get background image based on location
  const getBackgroundImage = () => {
    switch (location) {
      case 'abandoned-mines':
        return '/mines_fight_background.png';
      default:
        return '/mines_fight_background.png'; // fallback
    }
  };

  // Filter consumable items from inventory
  const consumableItems = player.inventory.filter(item => item.type === 'consumable');

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Battle Background - 2/3 of screen */}
      <div 
        className="h-2/3 relative bg-cover bg-center flex items-center justify-between px-16"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      >
        {/* Player Image - Left */}
        <div className="flex flex-col items-center">
          <img 
            src="/player_image.png" 
            alt="Player" 
            className="w-48 h-48 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/player.png'; // fallback
            }}
          />
          <div className="mt-4 text-white text-center">
            <div className="text-lg font-bold">{player.name}</div>
            <div className="w-32">
              <Progress 
                value={(player.health / player.maxHealth) * 100} 
                className="h-3 bg-red-900"
              />
              <div className="text-sm">{player.health}/{player.maxHealth} HP</div>
            </div>
          </div>
        </div>

        {/* Enemy Image - Right */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-600 border-2 border-gray-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">Enemy Image</span>
          </div>
          <div className="mt-4 text-white text-center">
            <div className="text-lg font-bold">{enemy.name}</div>
            <div className="w-32">
              <Progress 
                value={(enemy.health / enemy.maxHealth) * 100} 
                className="h-3 bg-red-900"
              />
              <div className="text-sm">{enemy.health}/{enemy.maxHealth} HP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle UI - 1/3 of screen */}
      <div className="h-1/3 bg-gray-800 p-4 flex">
        {/* Action Buttons - Left half */}
        <div className="w-1/2 pr-4">
          <h3 className="text-white text-lg font-bold mb-4">Действия</h3>
          <div className="space-y-3">
            <Button 
              onClick={onAttack}
              className="w-full"
              variant="destructive"
              disabled={battleState.turn !== 'player'}
            >
              Атака
            </Button>
            <Button 
              onClick={onDefend}
              className="w-full"
              variant="secondary"
              disabled={battleState.turn !== 'player'}
            >
              Защита
            </Button>
            <Button 
              onClick={onBattleEnd}
              className="w-full"
              variant="outline"
            >
              Бежать
            </Button>
          </div>
        </div>

        {/* Inventory Items - Right half */}
        <div className="w-1/2 pl-4">
          <h3 className="text-white text-lg font-bold mb-4">Предметы</h3>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {consumableItems.map((item) => (
              <Card 
                key={item.id}
                className="p-2 cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => onUseItem(item)}
              >
                <img 
                  src={item.icon} 
                  alt={item.name}
                  className="w-8 h-8 object-contain mx-auto"
                />
                <div className="text-xs text-white text-center mt-1">
                  {item.name}
                </div>
              </Card>
            ))}
          </div>
          {consumableItems.length === 0 && (
            <div className="text-gray-400 text-sm">Нет доступных предметов</div>
          )}
        </div>
      </div>
    </div>
  );
};