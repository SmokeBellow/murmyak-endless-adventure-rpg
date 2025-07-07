import { useState } from 'react';
import { Player, Item, NPC } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Coins } from 'lucide-react';

interface TradeMenuProps {
  player: Player;
  npc: NPC;
  onClose: () => void;
  onBuyItem: (item: Item) => void;
  onSellItem: (item: Item) => void;
}

const TradeMenu = ({ player, npc, onClose, onBuyItem, onSellItem }: TradeMenuProps) => {
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');

  const getItemPrice = (item: Item, isSelling: boolean = false) => {
    let basePrice = 10;
    
    if (item.stats?.damage) basePrice += item.stats.damage * 5;
    if (item.stats?.armor) basePrice += item.stats.armor * 3;
    if (item.stats?.health) basePrice += item.stats.health * 2;
    if (item.stats?.mana) basePrice += item.stats.mana * 2;
    
    return isSelling ? Math.floor(basePrice * 0.5) : basePrice;
  };

  const sellableItems = player.inventory.filter(item => 
    item.type !== 'misc' && item.id !== 'starter-sword' && item.id !== 'leather-armor'
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Торговля с {npc.name}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Купить</TabsTrigger>
              <TabsTrigger value="sell">Продать</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {npc.shop?.map(item => (
                  <Card key={item.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.stats && (
                              <div className="flex gap-2 mt-1">
                                {item.stats.damage && (
                                  <Badge variant="destructive" className="text-xs">
                                    ⚔️ {item.stats.damage}
                                  </Badge>
                                )}
                                {item.stats.armor && (
                                  <Badge variant="secondary" className="text-xs">
                                    🛡️ {item.stats.armor}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary mb-2">
                            {getItemPrice(item)} 🪙
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => onBuyItem(item)}
                          >
                            Купить
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!npc.shop || npc.shop.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    У торговца нет товаров
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sell" className="mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sellableItems.map(item => (
                  <Card key={item.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.stats && (
                              <div className="flex gap-2 mt-1">
                                {item.stats.damage && (
                                  <Badge variant="destructive" className="text-xs">
                                    ⚔️ {item.stats.damage}
                                  </Badge>
                                )}
                                {item.stats.armor && (
                                  <Badge variant="secondary" className="text-xs">
                                    🛡️ {item.stats.armor}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-secondary mb-2">
                            {getItemPrice(item, true)} 🪙
                          </div>
                          <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => onSellItem(item)}
                          >
                            Продать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {sellableItems.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Нет предметов для продажи
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeMenu;