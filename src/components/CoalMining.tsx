import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CoalMiningProps {
  onClose: () => void;
  onMineCoal: () => void;
  resourceCount: number;
}

const CoalMining = ({ onClose, onMineCoal, resourceCount }: CoalMiningProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">🪨 Кусок антрацита</CardTitle>
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
            
            {resourceCount > 0 ? (
              <Button 
                onClick={onMineCoal}
                className="w-full"
              >
                Добыть уголь ({resourceCount} ед.)
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                Ресурс истощен. Ожидайте восстановления.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoalMining;