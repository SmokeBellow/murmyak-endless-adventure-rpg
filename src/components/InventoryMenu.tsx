import { Player, Item, Equipment } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface InventoryMenuProps {
  player: Player;
  onClose: () => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
}

const InventoryMenu = ({ player, onClose, onEquipItem, onUnequipItem }: InventoryMenuProps) => {
  const renderEquipmentSlot = (slot: keyof Equipment, label: string) => {
    const item = player.equipment[slot];
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="w-16 h-16 border-2 border-border rounded-lg bg-muted/50 flex items-center justify-center relative">
          {item ? (
            <div className="text-center">
              <div className="text-lg">{item.icon}</div>
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
            <span className="text-2xl text-muted-foreground">?</span>
          )}
        </div>
        {item && (
          <span className="text-xs text-center text-foreground">{item.name}</span>
        )}
      </div>
    );
  };

  const renderInventoryItem = (item: Item) => (
    <Card key={item.id} className="bg-card/80 border-border hover:bg-card transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{item.icon}</div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{item.name}</h4>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            {item.stats && (
              <div className="text-xs text-accent mt-1">
                {item.stats.damage && `Урон: +${item.stats.damage}`}
                {item.stats.armor && `Броня: +${item.stats.armor}`}
                {item.stats.health && `Здоровье: +${item.stats.health}`}
                {item.stats.mana && `Мана: +${item.stats.mana}`}
              </div>
            )}
          </div>
          {item.slot && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEquipItem(item)}
            >
              Надеть
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-primary">Инвентарь и Экипировка</CardTitle>
              <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-lg">
                <span className="text-lg">🪙</span>
                <span className="text-sm font-medium text-yellow-500">{player.coins}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Экипировка</h3>
              <div className="grid grid-cols-3 gap-4">
                {renderEquipmentSlot('head', 'Голова')}
                {renderEquipmentSlot('weapon', 'Оружие')}
                {renderEquipmentSlot('shield', 'Щит')}
                <div className="col-span-3 flex justify-center">
                  {renderEquipmentSlot('chest', 'Торс')}
                </div>
                <div className="col-span-3 flex justify-center">
                  {renderEquipmentSlot('legs', 'Ноги')}
                </div>
              </div>
            </div>

            {/* Inventory Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Инвентарь ({player.inventory.length} предметов)
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {player.inventory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Инвентарь пуст</p>
                ) : (
                  player.inventory.map(renderInventoryItem)
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryMenu;