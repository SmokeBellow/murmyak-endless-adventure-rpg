import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BattleDefeatProps {
  onContinue: () => void;
}

export const BattleDefeat = ({ onContinue }: BattleDefeatProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <Card className="bg-gray-800 border-red-500 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-400 mb-6">ПОРАЖЕНИЕ</h2>
          
          <div className="space-y-4 mb-6">
            <div className="text-white text-lg">
              Вы теряете сознание...
            </div>
          </div>
          
          <Button onClick={onContinue} className="w-full" variant="destructive">
            Продолжить
          </Button>
        </div>
      </Card>
    </div>
  );
};