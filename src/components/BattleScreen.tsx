import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BattleState, Item, Player } from '@/types/gameTypes';

interface DamageText {
  id: string;
  amount: number;
  target: 'player' | 'enemy';
  type: 'damage' | 'heal' | 'defend' | 'skill';
}

interface BattleScreenProps {
  battleState: BattleState;
  currentPlayer: Player;
  onAttack: () => void;
  onUseSkill: () => void;
  onUseItem: (item: Item) => void;
  onBattleEnd: () => void;
  damageTexts: DamageText[];
  battleLog: string[];
}

export const BattleScreen = ({ 
  battleState, 
  currentPlayer,
  onAttack, 
  onUseSkill, 
  onUseItem, 
  onBattleEnd,
  damageTexts,
  battleLog
}: BattleScreenProps) => {
  const { enemy, location } = battleState;
  const battleLogRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll battle log to bottom
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);
  
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
  const consumableItems = currentPlayer.inventory.filter(item => item.type === 'consumable');
  const SKILL_MANA_COST = 15;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Battle Background - 2/3 of screen */}
      <div 
        className="h-2/3 relative bg-cover bg-center flex items-center justify-between px-16"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      >
        {/* Player Image - Left */}
        <div className="flex flex-col items-center relative mb-4 mt-32">
          <img 
            src="/player_fight.png" 
            alt="Player" 
            className="w-48 h-48 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/player.png'; // fallback
            }}
          />
          <div className="mb-24 text-white text-center">
            <div className="text-lg font-bold">{currentPlayer.name}</div>
            <div className="w-32">
              <Progress 
                value={(currentPlayer.health / currentPlayer.maxHealth) * 100} 
                className="h-3 bg-gray-700 [&>div]:bg-red-500"
              />
              <div className="text-sm">{currentPlayer.health}/{currentPlayer.maxHealth} HP</div>
              <Progress 
                value={(currentPlayer.mana / currentPlayer.maxMana) * 100} 
                className="h-3 bg-gray-700 mt-1 [&>div]:bg-blue-500"
              />
              <div className="text-sm">{currentPlayer.mana}/{currentPlayer.maxMana} MP</div>
            </div>
          </div>
          
          {/* Player Damage Texts */}
          {damageTexts
            .filter(dt => dt.target === 'player')
            .map(damageText => (
              <div
                key={damageText.id}
                className={`absolute top-8 -right-16 text-2xl font-bold animate-bounce pointer-events-none z-10 ${
                  damageText.type === 'damage' ? 'text-red-500' : 
                  damageText.type === 'heal' ? 'text-green-500' : 'text-blue-500'
                }`}
                style={{
                  animation: 'float-up 2s ease-out forwards'
                }}
              >
                {damageText.type === 'damage' ? '-' : damageText.type === 'heal' ? '+' : ''}
                {damageText.amount}
                {damageText.type === 'defend' && ' DEF'}
              </div>
            ))
          }
        </div>

        {/* Enemy Image - Right */}
        <div className="flex flex-col items-center relative">
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
          
          {/* Enemy Damage Texts */}
          {damageTexts
            .filter(dt => dt.target === 'enemy')
            .map(damageText => (
              <div
                key={damageText.id}
                className={`absolute top-8 -left-16 text-2xl font-bold animate-bounce pointer-events-none z-10 ${
                  damageText.type === 'damage' ? 'text-red-500' : 
                  damageText.type === 'heal' ? 'text-green-500' : 'text-blue-500'
                }`}
                style={{
                  animation: 'float-up 2s ease-out forwards'
                }}
              >
                {damageText.type === 'damage' ? '-' : damageText.type === 'heal' ? '+' : ''}
                {damageText.amount}
              </div>
            ))
          }
          {/* Skill slash animation overlay */}
          {damageTexts.some(dt => dt.target === 'enemy' && dt.type === 'skill') && (
            <div
              className="absolute z-20"
              style={{
                left: '-20px',
                top: '40px',
                width: '180px',
                height: '4px',
                background: 'linear-gradient(90deg, rgba(59,130,246,1), rgba(59,130,246,0))',
                boxShadow: '0 0 12px rgba(59,130,246,0.9)',
                transform: 'rotate(45deg)',
                animation: 'skill-slash 500ms ease-out forwards'
              }}
            />
          )}
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        @keyframes skill-slash {
          0% {
            opacity: 0.9;
            transform: translate(-60px, 0) rotate(45deg);
          }
          100% {
            opacity: 0;
            transform: translate(100px, -30px) rotate(45deg);
          }
        }
      `}</style>

      {/* Battle UI - 1/3 of screen */}
      <div className="h-1/3 bg-gray-800 p-4 flex gap-4">
        {/* Action Buttons - Left 1/3 */}
        <div className="w-1/3">
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
              onClick={onUseSkill}
              className="w-full"
              variant="secondary"
              disabled={battleState.turn !== 'player' || battleState.skillCooldown > 0 || currentPlayer.mana < SKILL_MANA_COST}
            >
              {battleState.skillCooldown > 0 
                ? `Умение (${battleState.skillCooldown})` 
                : `Умение (${SKILL_MANA_COST} маны)`
              }
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

        {/* Inventory Items - Middle 1/3 */}
        <div className="w-1/3">
          <h3 className="text-white text-lg font-bold mb-4">Предметы</h3>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {consumableItems.map((item) => (
              <Card 
                key={item.id}
                className="p-2 cursor-pointer hover:bg-gray-600 transition-colors relative"
                onClick={() => onUseItem(item)}
              >
                <img 
                  src={item.icon} 
                  alt={item.name}
                  className="w-6 h-6 object-contain mx-auto"
                />
                {item.quantity && item.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 text-xs font-bold text-primary transform translate-x-1 translate-y-1">
                    x{item.quantity}
                  </span>
                )}
                <div className="text-xs text-white text-center mt-1 truncate">
                  {item.name}
                </div>
              </Card>
            ))}
          </div>
          {consumableItems.length === 0 && (
            <div className="text-gray-400 text-sm">Нет предметов</div>
          )}
        </div>

        {/* Battle Log - Right 1/3 */}
        <div className="w-1/3">
          <h3 className="text-white text-lg font-bold mb-4">Лог боя</h3>
          <div ref={battleLogRef} className="bg-gray-900 rounded p-3 h-32 overflow-y-auto text-sm">
            {battleLog.length === 0 ? (
              <div className="text-gray-400">Бой начинается...</div>
            ) : (
              battleLog.slice(-10).map((log, index) => (
                <div key={index} className="text-gray-300 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};