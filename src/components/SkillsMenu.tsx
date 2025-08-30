import { Player, Skill } from '@/types/gameTypes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { availableSkills, getSkillById } from '@/data/skills';

interface SkillsMenuProps {
  player: Player;
  onUpdatePlayer: (updates: Partial<Player>) => void;
  onClose: () => void;
}

export const SkillsMenu = ({ player, onUpdatePlayer, onClose }: SkillsMenuProps) => {
  const unlockedSkills = availableSkills.filter(skill => skill.unlocked);

  const handleSlotChange = (slotIndex: number, skillId: string | null) => {
    const newSlots = [...player.skillSlots] as [string | null, string | null, string | null];
    newSlots[slotIndex] = skillId;
    onUpdatePlayer({ skillSlots: newSlots });
  };

  const getSlotSkill = (slotIndex: number): Skill | null => {
    const skillId = player.skillSlots[slotIndex];
    return skillId ? getSkillById(skillId) || null : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Умения</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            Закрыть
          </Button>
        </div>

        {/* Слоты умений */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Активные слоты</h3>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((slotIndex) => {
              const slotSkill = getSlotSkill(slotIndex);
              return (
                <Card key={slotIndex} className="p-4 bg-gray-800 border-gray-600">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Слот {slotIndex + 1}</div>
                    {slotSkill ? (
                      <>
                        <img 
                          src={slotSkill.icon} 
                          alt={slotSkill.name}
                          className="w-12 h-12 object-contain mx-auto mb-2"
                        />
                        <div className="text-white text-sm font-medium">{slotSkill.name}</div>
                        <div className="text-blue-400 text-xs">{slotSkill.manaCost} маны</div>
                        <Button 
                          onClick={() => handleSlotChange(slotIndex, null)}
                          variant="destructive" 
                          size="sm" 
                          className="mt-2"
                        >
                          Убрать
                        </Button>
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">Пустой слот</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Доступные умения */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Изученные умения</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {unlockedSkills.map((skill) => (
              <Card key={skill.id} className="p-4 bg-gray-800 border-gray-600 hover:bg-gray-700 transition-colors">
                <div className="text-center">
                  <img 
                    src={skill.icon} 
                    alt={skill.name}
                    className="w-16 h-16 object-contain mx-auto mb-2"
                  />
                  <h4 className="text-white font-medium mb-1">{skill.name}</h4>
                  <p className="text-gray-400 text-xs mb-2">{skill.description}</p>
                  <div className="text-blue-400 text-sm mb-3">
                    {skill.manaCost} маны | {skill.damage} урона
                  </div>
                  
                  {/* Кнопки для добавления в слоты */}
                  <div className="space-y-1">
                    {[0, 1, 2].map((slotIndex) => {
                      const isInSlot = player.skillSlots[slotIndex] === skill.id;
                      const slotEmpty = !player.skillSlots[slotIndex];
                      
                      return (
                        <Button
                          key={slotIndex}
                          onClick={() => handleSlotChange(slotIndex, skill.id)}
                          disabled={isInSlot}
                          variant={isInSlot ? "secondary" : "outline"}
                          size="sm"
                          className="w-full text-xs"
                        >
                          {isInSlot ? `В слоте ${slotIndex + 1}` : 
                           slotEmpty ? `В слот ${slotIndex + 1}` : `Заменить слот ${slotIndex + 1}`}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};