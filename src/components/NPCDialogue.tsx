import { NPC, Quest } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface NPCDialogueProps {
  npc: NPC;
  onClose: () => void;
  onAcceptQuest?: (quest: Quest) => void;
  onTrade?: () => void;
}

const NPCDialogue = ({ npc, onClose, onAcceptQuest, onTrade }: NPCDialogueProps) => {
  const availableQuests = npc.quests?.filter(quest => quest.status === 'available') || [];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">{npc.name}</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* NPC Dialogue */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-foreground italic">
                "{npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)]}"
              </p>
            </div>

            {/* Available Quests */}
            {availableQuests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Доступные квесты:</h3>
                {availableQuests.map(quest => (
                  <Card key={quest.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">{quest.title}</h4>
                        <Badge variant="secondary">Новый</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {quest.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-experience font-medium">
                          +{quest.rewards.experience} опыта
                        </span>
                        <Button
                          size="sm"
                          onClick={() => onAcceptQuest?.(quest)}
                        >
                          Принять
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Trading */}
            {npc.type === 'merchant' && npc.shop && (
              <div className="pt-4 border-t border-border">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={onTrade}
                >
                  🛒 Торговать
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NPCDialogue;