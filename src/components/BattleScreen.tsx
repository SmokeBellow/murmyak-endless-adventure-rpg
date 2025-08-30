import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BattleState, Item, Player } from '@/types/gameTypes';
import { getSkillById } from '@/data/skills';

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
  onUseSkill: (skillId: string) => void;
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

  // Get equipped skills
  const equippedSkills = currentPlayer.skillSlots.map(skillId => 
    skillId ? getSkillById(skillId) : null
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Battle Background - 65% of screen */}
      <div 
        className="h-[65%] relative bg-cover bg-center flex items-center justify-between px-16"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      >
        {/* Player Image - Left */}
        <div className="flex flex-col items-center relative border-2 border-yellow-500 absolute left-16" style={{ bottom: '4px', transform: 'translateY(-100%)' }}>
          {/* Player Name - Above image */}
          <div className="text-white text-center mb-2 border border-green-500">
            <div className="text-lg font-bold border border-blue-500 p-1">{currentPlayer.name}</div>
          </div>
          
          <img 
            src="/player_fight.png" 
            alt="Player" 
            className="w-48 h-48 object-contain border-2 border-red-500"
            onError={(e) => {
              e.currentTarget.src = '/player.png'; // fallback
            }}
          />
          
          {/* HP and MP bars - closer to image */}
          <div className="mt-1 text-white flex flex-col items-center border-2 border-purple-500">
            <div className="flex flex-col gap-1 border border-orange-500">
              <div className="flex items-center gap-2 border border-pink-500">
                <Progress 
                  value={(currentPlayer.health / currentPlayer.maxHealth) * 100} 
                  className="h-3 bg-gray-700 [&>div]:bg-red-500 w-24 border border-cyan-500"
                />
                <div className="text-sm text-left min-w-[50px] border border-lime-500">{currentPlayer.health}/{currentPlayer.maxHealth}</div>
              </div>
              <div className="flex items-center gap-2 border border-indigo-500">
                <Progress 
                  value={(currentPlayer.mana / currentPlayer.maxMana) * 100} 
                  className="h-3 bg-gray-700 [&>div]:bg-blue-500 w-24 border border-cyan-500"
                />
                <div className="text-sm text-left min-w-[50px] border border-lime-500">{currentPlayer.mana}/{currentPlayer.maxMana}</div>
              </div>
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
        <div className="flex flex-col items-center relative border-2 border-amber-500">
          <div className="w-48 h-48 bg-gray-600 border-2 border-gray-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">Enemy Image</span>
          </div>
          <div className="mt-4 text-white text-center border border-teal-500">
            <div className="text-lg font-bold border border-violet-500 p-1">{enemy.name}</div>
            <div className="w-32 border border-rose-500">
              <Progress 
                value={(enemy.health / enemy.maxHealth) * 100} 
                className="h-3 bg-red-900 border border-emerald-500"
              />
              <div className="text-sm border border-sky-500 p-1">{enemy.health}/{enemy.maxHealth} HP</div>
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

      {/* Battle UI - 35% of screen */}
      <div className="h-[35%] bg-gray-800 p-4 flex gap-4 border-t-4 border-white">
        {/* Action Buttons - Left 1/3 */}
        <div className="w-1/3 border-2 border-red-400">
          <h3 className="text-white text-lg font-bold mb-4 border border-green-400">Действия</h3>
          <div className="space-y-3 border border-blue-400">
            {/* Skill Slots - 3 buttons in a row */}
            <div className="grid grid-cols-3 gap-1 mb-3 border border-yellow-400">
              {equippedSkills.map((skill, index) => (
                <Button
                  key={index}
                  onClick={() => skill && onUseSkill(skill.id)}
                  className="w-full h-12 p-1 relative border border-purple-400"
                  variant="secondary"
                  disabled={
                    battleState.turn !== 'player' || 
                    !skill || 
                    currentPlayer.mana < skill.manaCost ||
                    battleState.skillCooldown > 0
                  }
                >
                  {skill ? (
                    <>
                      <img 
                        src={skill.icon} 
                        alt={skill.name}
                        className="w-8 h-8 object-contain border border-orange-400"
                      />
                      <span className="absolute bottom-0 right-0 text-xs bg-blue-600 text-white px-1 rounded border border-pink-400">
                        {skill.manaCost}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Пусто</span>
                  )}
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={onAttack}
              className="w-full border-2 border-cyan-400"
              variant="destructive"
              disabled={battleState.turn !== 'player'}
            >
              Атака
            </Button>
            <Button 
              onClick={onBattleEnd}
              className="w-full border-2 border-lime-400"
              variant="outline"
            >
              Бежать
            </Button>
          </div>
        </div>

        {/* Inventory Items - Middle 1/3 */}
        <div className="w-1/3 border-2 border-green-400">
          <h3 className="text-white text-lg font-bold mb-4 border border-blue-400">Предметы</h3>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-yellow-400">
            {consumableItems.map((item) => (
              <Card 
                key={item.id}
                className="p-2 cursor-pointer hover:bg-gray-600 transition-colors relative border border-purple-400"
                onClick={() => onUseItem(item)}
              >
                <img 
                  src={item.icon} 
                  alt={item.name}
                  className="w-6 h-6 object-contain mx-auto border border-orange-400"
                />
                {item.quantity && item.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 text-xs font-bold text-primary transform translate-x-1 translate-y-1 border border-pink-400">
                    x{item.quantity}
                  </span>
                )}
                <div className="text-xs text-white text-center mt-1 truncate border border-cyan-400">
                  {item.name}
                </div>
              </Card>
            ))}
          </div>
          {consumableItems.length === 0 && (
            <div className="text-gray-400 text-sm border border-red-400">Нет предметов</div>
          )}
        </div>

        {/* Battle Log - Right 1/3 */}
        <div className="w-1/3 border-2 border-blue-400">
          <h3 className="text-white text-lg font-bold mb-4 border border-green-400">Лог боя</h3>
          <div ref={battleLogRef} className="bg-gray-900 rounded p-3 h-32 overflow-y-auto text-sm border-2 border-yellow-400">
            {battleLog.length === 0 ? (
              <div className="text-gray-400 border border-red-400">Бой начинается...</div>
            ) : (
              battleLog.slice(-10).map((log, index) => (
                <div key={index} className="text-gray-300 mb-1 border border-purple-400">
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