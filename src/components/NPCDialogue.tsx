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
  activeQuests?: Quest[];
  onCompleteQuest?: (quest: Quest) => void;
}

const NPCDialogue = ({ npc, onClose, onAcceptQuest, onTrade, activeQuests = [], onCompleteQuest }: NPCDialogueProps) => {
  // Only show available quests that haven't been taken yet
  const availableQuests = npc.quests?.filter(quest => 
    quest.status === 'available' && 
    !activeQuests.some(aq => aq.id === quest.id)
  ) || [];
  
  // Show active quests that can be completed with this NPC
  const completableQuests = activeQuests.filter(quest => 
    quest.giver === npc.id && 
    quest.objectives.every(obj => obj.completed)
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">{npc.name}</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* NPC Dialogue */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-foreground italic">
                "{npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)]}"
              </p>
            </div>

            {/* Completable Quests */}
            {completableQuests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Завершить квесты:</h3>
                {completableQuests.map(quest => (
                  <Card key={quest.id} className="bg-primary/10 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">{quest.title}</h4>
                        <Badge variant="default">Готов</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Все задачи выполнены!
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-primary font-medium">
                          +{quest.rewards.experience} опыта
                          {quest.rewards.coins && `, +${quest.rewards.coins} монет`}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => onCompleteQuest?.(quest)}
                        >
                          Завершить квест
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
                          {quest.rewards.coins && `, +${quest.rewards.coins} монет`}
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