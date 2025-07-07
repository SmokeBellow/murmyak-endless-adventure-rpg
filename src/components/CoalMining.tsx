import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CoalMiningProps {
  onClose: () => void;
  onMineCoal: () => void;
  canMine: boolean;
}

const CoalMining = ({ onClose, onMineCoal, canMine }: CoalMiningProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">🪨 Угольная шахта</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">⛏️</div>
            <p className="text-foreground">
              Вы нашли старую угольную шахту. Здесь можно добыть уголь для кузнеца.
            </p>
            
            {canMine ? (
              <Button 
                onClick={onMineCoal}
                className="w-full"
              >
                Добыть уголь
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                У вас уже есть уголь или нет соответствующего квеста.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoalMining;