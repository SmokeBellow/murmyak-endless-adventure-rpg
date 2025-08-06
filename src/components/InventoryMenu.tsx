import { Player, Item, Equipment } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface InventoryMenuProps {
  player: Player;
  onClose: () => void;
  onEquipItem?: (item: Item) => void;
}

const InventoryMenu = ({ player, onClose, onEquipItem }: InventoryMenuProps) => {
const renderInventoryItem = (item: Item) => (
    <div key={item.id} className="flex items-center justify-between p-3 bg-card/80 border border-border rounded-lg hover:bg-card transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center relative">
          {item.icon.startsWith('/') ? (
            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl">{item.icon}</span>
          )}
          {item.quantity && item.quantity > 1 && (
            <span className="absolute bottom-0 right-0 text-xs font-bold text-primary transform translate-x-1 translate-y-1">
              x{item.quantity}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{item.name}</h4>
            {item.quantity && item.quantity > 1 && (
              <span className="text-xs text-muted-foreground">x{item.quantity}</span>
            )}
          </div>
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
      </div>
      {item.slot && onEquipItem && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEquipItem(item)}
        >
          Надеть
        </Button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-primary">Инвентарь</CardTitle>
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
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Предметы ({player.inventory.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {player.inventory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Инвентарь пуст</p>
              ) : (
                player.inventory.map(renderInventoryItem)
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryMenu;