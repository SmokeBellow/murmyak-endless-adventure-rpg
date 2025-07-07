import { useState } from 'react';
import { Quest } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestMenuProps {
  quests: Quest[];
  onClose: () => void;
}

const QuestMenu = ({ quests, onClose }: QuestMenuProps) => {
  const [showActiveQuests, setShowActiveQuests] = useState(true);
  const [showCompletedQuests, setShowCompletedQuests] = useState(false);
  const getStatusBadge = (status: Quest['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary">Доступен</Badge>;
      case 'active':
        return <Badge variant="default">Активен</Badge>;
      case 'completed':
        return <Badge className="bg-experience text-primary-foreground">Завершён</Badge>;
    }
  };

  const renderQuest = (quest: Quest) => (
    <Card key={quest.id} className="bg-card/80 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{quest.title}</CardTitle>
            {getStatusBadge(quest.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4">{quest.description}</p>
        
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Цели:</h4>
          {quest.objectives.map((objective, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                objective.completed 
                  ? 'bg-experience border-experience' 
                  : 'border-muted-foreground'
              }`} />
              <span className={`text-sm ${
                objective.completed 
                  ? 'text-muted-foreground line-through' 
                  : 'text-foreground'
              }`}>
                {objective.description}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Награды:</h4>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-experience font-medium">
              +{quest.rewards.experience} опыта
            </span>
            {quest.rewards.items && quest.rewards.items.length > 0 && (
              <span className="text-sm text-accent">
                +{quest.rewards.items.length} предмет(ов)
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="border-b border-border flex-shrink-0 sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Журнал Квестов</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Active Quests */}
            {activeQuests.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => setShowActiveQuests(!showActiveQuests)}
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    Активные квесты ({activeQuests.length})
                  </h3>
                  {showActiveQuests ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                {showActiveQuests && (
                  <div className="space-y-3">
                    {activeQuests.map(renderQuest)}
                  </div>
                )}
              </div>
            )}


            {/* Completed Quests */}
            {completedQuests.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => setShowCompletedQuests(!showCompletedQuests)}
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    Завершённые квесты ({completedQuests.length})
                  </h3>
                  {showCompletedQuests ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                {showCompletedQuests && (
                  <div className="space-y-3">
                    {completedQuests.map(renderQuest)}
                  </div>
                )}
              </div>
            )}

            {quests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Пока нет квестов</p>
                <p className="text-muted-foreground mt-2">
                  Поговорите с НПС в деревне, чтобы получить задания
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestMenu;