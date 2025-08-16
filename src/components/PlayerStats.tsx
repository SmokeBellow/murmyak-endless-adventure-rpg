import { Player } from '@/types/gameTypes';

interface PlayerStatsProps {
  player: Player;
}

const PlayerStats = ({ player }: PlayerStatsProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;
  const manaPercentage = (player.mana / player.maxMana) * 100;
  const experienceForNextLevel = (player.level * 100);
  const experiencePercentage = (player.experience / experienceForNextLevel) * 100;

  return (
    <div className="fixed top-4 right-4 w-1/5 z-50 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-medieval">
      <div className="flex flex-col space-y-2">
        {/* Health Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-health transition-all duration-300 ease-out rounded-full"
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
            {player.health}/{player.maxHealth}
          </span>
        </div>

        {/* Mana Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-mana transition-all duration-300 ease-out rounded-full"
              style={{ width: `${manaPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
            {player.mana}/{player.maxMana}
          </span>
        </div>

        {/* Experience Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-experience transition-all duration-300 ease-out rounded-full shadow-glow"
              style={{ width: `${experiencePercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
            Ур. {player.level}
          </span>
        </div>

      </div>
    </div>
  );
};

export default PlayerStats;