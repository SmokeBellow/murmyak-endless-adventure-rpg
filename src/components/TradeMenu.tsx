import { Player, Item, NPC } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TradeMenuProps {
  player: Player;
  merchant: NPC;
  onClose: () => void;
  onBuyItem: (item: Item) => void;
}

const TradeMenu = ({ player, merchant, onClose, onBuyItem }: TradeMenuProps) => {
  const shopItems = merchant.shop || [];

  const canAfford = (item: Item) => {
    return item.price ? player.coins >= item.price : false;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">🛒 Торговля с {merchant.name}</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>🪙</span>
            <span>У вас: {player.coins} монет</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {shopItems.length === 0 ? (
              <p className="text-center text-muted-foreground">Товары закончились</p>
            ) : (
              shopItems.map(item => (
                <Card key={item.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {item.icon.startsWith('/') ? (
                          <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-lg">{item.icon}</span>
                        )}
                        <div>
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {item.stats && (
                      <div className="mb-3 text-sm">
                        {item.stats.damage && <span className="text-red-400">⚔️ Урон: +{item.stats.damage}</span>}
                        {item.stats.armor && <span className="text-blue-400">🛡️ Броня: +{item.stats.armor}</span>}
                        {item.stats.health && <span className="text-green-400">❤️ Здоровье: +{item.stats.health}</span>}
                        {item.stats.mana && <span className="text-purple-400">✨ Мана: +{item.stats.mana}</span>}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">🪙</span>
                        <span className="font-medium text-yellow-500">{item.price || 0}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onBuyItem(item)}
                        disabled={!canAfford(item)}
                        variant={canAfford(item) ? "default" : "secondary"}
                      >
                        {canAfford(item) ? 'Купить' : 'Не хватает монет'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeMenu;