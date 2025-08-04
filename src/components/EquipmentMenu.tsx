import { Player, Equipment, Item } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface EquipmentMenuProps {
  player: Player;
  onClose: () => void;
  onUnequipItem: (slot: keyof Equipment) => void;
}

const EquipmentMenu = ({ player, onClose, onUnequipItem }: EquipmentMenuProps) => {
  const renderEquipmentSlot = (slot: keyof Equipment, label: string) => {
    const item = player.equipment[slot];
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="w-20 h-20 border-2 border-border rounded-lg bg-muted/50 flex items-center justify-center relative">
          {item ? (
            <div className="text-center">
              <div className="text-2xl">{item.icon}</div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                onClick={() => onUnequipItem(slot)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <span className="text-3xl text-muted-foreground">?</span>
          )}
        </div>
        {item && (
          <span className="text-xs text-center text-foreground max-w-16 leading-tight">{item.name}</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Экипировка</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 flex-1 overflow-auto">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-6 max-w-md">
              {/* Top row */}
              <div></div>
              {renderEquipmentSlot('head', 'Голова')}
              <div></div>
              
              {/* Middle row */}
              {renderEquipmentSlot('weapon', 'Оружие')}
              {renderEquipmentSlot('chest', 'Торс')}
              {renderEquipmentSlot('shield', 'Щит')}
              
              {/* Bottom row */}
              <div></div>
              {renderEquipmentSlot('legs', 'Ноги')}
              <div></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentMenu;