import { Quest } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Coins, Star } from 'lucide-react';

interface QuestRewardModalProps {
  quest: Quest;
  onClose: () => void;
}

const QuestRewardModal = ({ quest, onClose }: QuestRewardModalProps) => {
  console.log('QuestRewardModal rendered for quest:', quest.id);
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="text-center border-b border-primary/20">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl text-primary">Квест завершён!</CardTitle>
          <Badge className="mx-auto bg-experience text-primary-foreground">
            {quest.title}
          </Badge>
        </CardHeader>
        
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-6">
            Поздравляем! Вы успешно выполнили квест.
          </p>
          
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-foreground">Награды:</h3>
            
            <div className="flex items-center justify-center space-x-2 text-experience">
              <Star className="w-5 h-5" />
              <span className="font-medium">+{quest.rewards.experience} опыта</span>
            </div>
            
            {quest.rewards.coins && (
              <div className="flex items-center justify-center space-x-2 text-accent">
                <Coins className="w-5 h-5" />
                <span className="font-medium">+{quest.rewards.coins} монет</span>
              </div>
            )}
            
            {quest.rewards.items && quest.rewards.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Получены предметы:</p>
                {quest.rewards.items.map(item => (
                  <div key={item.id} className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-foreground font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Продолжить путешествие
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestRewardModal;