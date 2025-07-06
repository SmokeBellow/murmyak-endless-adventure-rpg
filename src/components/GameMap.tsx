import { useCallback } from 'react';
import { Player, NPC } from '@/types/gameTypes';

interface GameMapProps {
  player: Player;
  npcs: NPC[];
  onPlayerMove: (newPosition: { x: number; y: number }) => void;
  onNPCInteract: (npc: NPC) => void;
}

const GameMap = ({ player, npcs, onPlayerMove, onNPCInteract }: GameMapProps) => {
  const mapSize = 20;
  const tileSize = 32;

  const handleTileClick = useCallback((x: number, y: number) => {
    const distance = Math.abs(x - player.position.x) + Math.abs(y - player.position.y);
    if (distance <= 1) {
      const npcAtPosition = npcs.find(npc => npc.position.x === x && npc.position.y === y);
      if (npcAtPosition) {
        onNPCInteract(npcAtPosition);
      } else {
        onPlayerMove({ x, y });
      }
    }
  }, [player.position, npcs, onPlayerMove, onNPCInteract]);

  const getTileContent = (x: number, y: number) => {
    if (player.position.x === x && player.position.y === y) {
      return <div className="w-6 h-6 bg-primary rounded-full shadow-glow animate-pulse" />;
    }
    
    const npc = npcs.find(npc => npc.position.x === x && npc.position.y === y);
    if (npc) {
      return (
        <div className={`w-6 h-6 rounded-full shadow-md ${
          npc.type === 'merchant' ? 'bg-accent' : 'bg-secondary'
        } border-2 border-foreground/20 hover:scale-110 transition-transform cursor-pointer`} />
      );
    }

    // Village tiles
    if ((x >= 8 && x <= 12) && (y >= 8 && y <= 12)) {
      return <div className="w-full h-full bg-stone border border-border/30" />;
    }
    
    // Water around village
    if (x < 3 || x > 16 || y < 3 || y > 16) {
      return <div className="w-full h-full bg-water" />;
    }

    // Forest/grass
    return <div className="w-full h-full bg-village-bg border border-border/10" />;
  };

  return (
    <div className="flex-1 overflow-auto p-4 bg-village-bg">
      <div className="flex items-center justify-center min-h-full">
        <div 
          className="grid gap-0 border-2 border-border rounded-lg overflow-hidden shadow-medieval"
          style={{ 
            gridTemplateColumns: `repeat(${mapSize}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${mapSize}, ${tileSize}px)`
          }}
        >
          {Array.from({ length: mapSize * mapSize }, (_, index) => {
            const x = index % mapSize;
            const y = Math.floor(index / mapSize);
            
            return (
              <div
                key={`${x}-${y}`}
                className="flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                style={{ width: tileSize, height: tileSize }}
                onClick={() => handleTileClick(x, y)}
              >
                {getTileContent(x, y)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameMap;