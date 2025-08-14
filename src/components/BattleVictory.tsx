import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Item } from '@/types/gameTypes';

interface BattleVictoryProps {
  experienceGained: number;
  coinsGained: number;
  lootItems: Item[];
  onContinue: () => void;
}

export const BattleVictory = ({ 
  experienceGained, 
  coinsGained, 
  lootItems, 
  onContinue 
}: BattleVictoryProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <Card className="bg-gray-800 border-yellow-500 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">ПОБЕДА!</h2>
          
          <div className="space-y-4 mb-6">
            <div className="text-white">
              <div className="text-lg">Получено опыта: <span className="text-green-400 font-bold">+{experienceGained}</span></div>
              <div className="text-lg">Получено монет: <span className="text-yellow-400 font-bold">+{coinsGained}</span></div>
            </div>
            
            {lootItems.length > 0 && (
              <div className="text-white">
                <h3 className="text-lg font-bold mb-2">Лут:</h3>
                <div className="space-y-2">
                  {lootItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <img src={item.icon} alt={item.name} className="w-6 h-6" />
                      <span className="text-blue-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button onClick={onContinue} className="w-full" variant="default">
            Продолжить
          </Button>
        </div>
      </Card>
    </div>
  );
};