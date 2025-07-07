import { useCallback } from 'react';
import { Player, NPC } from '@/types/gameTypes';

interface GameMapProps {
  player: Player;
  npcs: NPC[];
  onNPCInteract: (npc: NPC) => void;
  onFountainUse: () => void;
  onCoalMineInteract: () => void;
}

const GameMap = ({ player, npcs, onNPCInteract, onFountainUse, onCoalMineInteract }: GameMapProps) => {
  const mapWidth = 2000;
  const mapHeight = 2000;

  // Collision detection
  const isColliding = useCallback((x: number, y: number) => {
    // Building collisions
    const buildings = [
      { x: 450, y: 450, width: 100, height: 100 }, // Main building
      { x: 350, y: 500, width: 80, height: 60 },   // Second building
      { x: 300, y: 460, width: 60, height: 50 },   // Blacksmith forge
    ];
    
    // Fountain collision
    const fountainDistance = Math.sqrt(Math.pow(400 - x, 2) + Math.pow(400 - y, 2));
    if (fountainDistance < 25) return true;
    
    // Check building collisions
    for (const building of buildings) {
      if (x >= building.x && x <= building.x + building.width &&
          y >= building.y && y <= building.y + building.height) {
        return true;
      }
    }
    
    return false;
  }, []);

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2 + player.position.x;
    const y = event.clientY - rect.top - rect.height / 2 + player.position.y;
    
    // Check if clicking on fountain
    const fountainDistance = Math.sqrt(Math.pow(400 - x, 2) + Math.pow(400 - y, 2));
    if (fountainDistance < 30) {
      onFountainUse();
      return;
    }
    
    // Check if clicking on coal mine
    const coalMineDistance = Math.sqrt(Math.pow(800 - x, 2) + Math.pow(200 - y, 2));
    if (coalMineDistance < 40) {
      onCoalMineInteract();
      return;
    }
    
    // Check if clicking on NPC
    const clickedNPC = npcs.find(npc => {
      const distance = Math.sqrt(Math.pow(npc.position.x - x, 2) + Math.pow(npc.position.y - y, 2));
      return distance < 30;
    });
    
    if (clickedNPC) {
      onNPCInteract(clickedNPC);
    }
    // Removed player movement on click
  }, [player.position, npcs, onNPCInteract, onFountainUse, onCoalMineInteract]);

  // Calculate camera offset to center on player
  const cameraOffsetX = -player.position.x + (window.innerWidth / 2);
  const cameraOffsetY = -player.position.y + (window.innerHeight / 2);

  // Generate background pattern
  const getBackgroundTile = (x: number, y: number) => {
    // Village area
    if (x >= 400 && x <= 600 && y >= 400 && y <= 600) {
      return 'bg-stone/50';
    }
    // Water areas
    if (x < 100 || x > mapWidth - 100 || y < 100 || y > mapHeight - 100) {
      return 'bg-blue-500/30';
    }
    // Forest/grass
    return 'bg-green-500/20';
  };

  return (
    <div className="flex-1 overflow-hidden bg-village-bg relative cursor-crosshair">
      <div 
        className="absolute w-full h-full"
        style={{
          transform: `translate(${cameraOffsetX}px, ${cameraOffsetY}px)`,
          width: mapWidth,
          height: mapHeight,
          backgroundImage: `
            radial-gradient(circle at 500px 500px, rgba(139, 69, 19, 0.1) 0%, transparent 200px),
            radial-gradient(circle at 300px 800px, rgba(34, 139, 34, 0.1) 0%, transparent 150px),
            radial-gradient(circle at 800px 300px, rgba(34, 139, 34, 0.1) 0%, transparent 150px),
            linear-gradient(45deg, rgba(34, 139, 34, 0.05) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(34, 139, 34, 0.05) 25%, transparent 25%)
          `,
          backgroundSize: '400px 400px, 300px 300px, 300px 300px, 60px 60px, 60px 60px'
        }}
        onClick={handleMapClick}
      >
        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-primary rounded-full shadow-glow transition-all duration-100 border-2 border-primary-foreground z-20"
          style={{
            left: player.position.x - 16,
            top: player.position.y - 16,
          }}
        />

        {/* NPCs */}
        {npcs.map(npc => (
          <div
            key={npc.id}
            className={`absolute w-8 h-8 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-10 border-2 border-foreground/20 ${
              npc.type === 'merchant' ? 'bg-accent' : npc.type === 'blacksmith' ? 'bg-orange-500' : 'bg-secondary'
            }`}
            style={{
              left: npc.position.x - 16,
              top: npc.position.y - 16,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNPCInteract(npc);
            }}
          />
        ))}

        {/* Village buildings */}
        <div
          className="absolute bg-stone/80 border-2 border-border rounded-lg"
          style={{
            left: 450,
            top: 450,
            width: 100,
            height: 100,
          }}
        />
        <div
          className="absolute bg-stone/80 border-2 border-border rounded-lg"
          style={{
            left: 350,
            top: 500,
            width: 80,
            height: 60,
          }}
        />
        {/* Blacksmith forge */}
        <div
          className="absolute bg-orange-800/80 border-2 border-orange-600 rounded-lg flex items-center justify-center text-white font-bold"
          style={{
            left: 300,
            top: 460,
            width: 60,
            height: 50,
          }}
        >
          🔨
        </div>

        {/* Fountain */}
        <div
          className="absolute bg-blue-400/80 border-2 border-blue-600 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white font-bold shadow-lg"
          style={{
            left: 380,
            top: 380,
            width: 40,
            height: 40,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onFountainUse();
          }}
        >
          ⛲
        </div>

        {/* Coal Mine */}
        <div
          className="absolute bg-gray-800/80 border-2 border-gray-600 rounded-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white font-bold shadow-lg"
          style={{
            left: 770,
            top: 170,
            width: 60,
            height: 60,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onCoalMineInteract();
          }}
        >
          ⛏️
        </div>
      </div>
    </div>
  );
};

export default GameMap;