import { useCallback } from 'react';
import { Player, NPC, LocationType } from '@/types/gameTypes';
import grassTexture from '@/assets/grass.png';

interface GameMapProps {
  player: Player;
  npcs: NPC[];
  onNPCInteract: (npc: NPC) => void;
  onFountainUse: () => void;
  onCoalMineInteract: () => void;
  currentLocation: LocationType;
  onPortalUse: () => void;
}

const GameMap = ({ player, npcs, onNPCInteract, onFountainUse, onCoalMineInteract, currentLocation, onPortalUse }: GameMapProps) => {
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
    
    if (currentLocation === 'village') {
      // Check if clicking on fountain
      const fountainDistance = Math.sqrt(Math.pow(400 - x, 2) + Math.pow(400 - y, 2));
      const playerToFountainDistance = Math.sqrt(Math.pow(400 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
      if (fountainDistance < 30 && playerToFountainDistance < 80) {
        onFountainUse();
        return;
      }
      
      // Check if clicking on portal
      const portalDistance = Math.sqrt(Math.pow(700 - x, 2) + Math.pow(300 - y, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(700 - player.position.x, 2) + Math.pow(300 - player.position.y, 2));
      if (portalDistance < 40 && playerToPortalDistance < 80) {
        onPortalUse();
        return;
      }
    } else if (currentLocation === 'abandoned-mines') {
      // Check if clicking on coal mine in abandoned mines
      const coalMineDistance = Math.sqrt(Math.pow(400 - x, 2) + Math.pow(400 - y, 2));
      const playerToCoalMineDistance = Math.sqrt(Math.pow(400 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
      if (coalMineDistance < 40 && playerToCoalMineDistance < 80) {
        onCoalMineInteract();
        return;
      }
      
      // Check if clicking on return portal
      const portalDistance = Math.sqrt(Math.pow(200 - x, 2) + Math.pow(200 - y, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(200 - player.position.x, 2) + Math.pow(200 - player.position.y, 2));
      if (portalDistance < 40 && playerToPortalDistance < 80) {
        onPortalUse();
        return;
      }
    }
    
    // Check if clicking on NPC (only in village)
    if (currentLocation === 'village') {
      const clickedNPC = npcs.find(npc => {
        const distance = Math.sqrt(Math.pow(npc.position.x - x, 2) + Math.pow(npc.position.y - y, 2));
        const playerToNPCDistance = Math.sqrt(Math.pow(npc.position.x - player.position.x, 2) + Math.pow(npc.position.y - player.position.y, 2));
        return distance < 30 && playerToNPCDistance < 80;
      });
      
      if (clickedNPC) {
        onNPCInteract(clickedNPC);
      }
    }
    // Removed player movement on click
  }, [player.position, npcs, onNPCInteract, onFountainUse, onCoalMineInteract, currentLocation, onPortalUse]);

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

  const renderVillage = () => (
    <>
      {/* NPCs - only in village */}
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
            const playerToNPCDistance = Math.sqrt(Math.pow(npc.position.x - player.position.x, 2) + Math.pow(npc.position.y - player.position.y, 2));
            if (playerToNPCDistance < 80) {
              onNPCInteract(npc);
            }
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
          const playerToFountainDistance = Math.sqrt(Math.pow(400 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
          if (playerToFountainDistance < 80) {
            onFountainUse();
          }
        }}
      >
        ⛲
      </div>

      {/* Portal to Abandoned Mines */}
      <div
        className="absolute bg-purple-600/80 border-2 border-purple-400 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white font-bold shadow-lg"
        style={{
          left: 680,
          top: 280,
          width: 40,
          height: 40,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const playerToPortalDistance = Math.sqrt(Math.pow(700 - player.position.x, 2) + Math.pow(300 - player.position.y, 2));
          if (playerToPortalDistance < 80) {
            onPortalUse();
          }
        }}
      >
        🌀
      </div>
    </>
  );

  const renderAbandonedMines = () => (
    <>
      {/* Coal Mine - moved here from village */}
      <div
        className="absolute bg-gray-900/90 border-2 border-gray-700 rounded-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-orange-200 font-bold shadow-lg shadow-black/50"
        style={{
          left: 370,
          top: 370,
          width: 60,
          height: 60,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const playerToCoalMineDistance = Math.sqrt(Math.pow(400 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
          if (playerToCoalMineDistance < 80) {
            onCoalMineInteract();
          }
        }}
      >
        ⛏️
      </div>

      {/* Return Portal */}
      <div
        className="absolute bg-purple-700/90 border-2 border-purple-500 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-purple-200 font-bold shadow-lg shadow-black/60"
        style={{
          left: 180,
          top: 180,
          width: 40,
          height: 40,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const playerToPortalDistance = Math.sqrt(Math.pow(200 - player.position.x, 2) + Math.pow(200 - player.position.y, 2));
          if (playerToPortalDistance < 80) {
            onPortalUse();
          }
        }}
      >
        🌀
      </div>

      {/* Mine rocks and environment - more detailed and dark */}
      <div
        className="absolute bg-gray-800/80 border-2 border-gray-700 rounded-lg shadow-inner"
        style={{ left: 300, top: 300, width: 80, height: 40 }}
      />
      <div
        className="absolute bg-gray-700/80 border-2 border-gray-600 rounded-lg shadow-inner"
        style={{ left: 500, top: 350, width: 60, height: 30 }}
      />
      <div
        className="absolute bg-gray-900/70 border-2 border-gray-800 rounded-lg shadow-inner"
        style={{ left: 250, top: 450, width: 40, height: 25 }}
      />
      <div
        className="absolute bg-stone-800/60 border border-stone-700 rounded"
        style={{ left: 450, top: 500, width: 30, height: 20 }}
      />
      <div
        className="absolute bg-slate-800/70 border border-slate-700 rounded-lg"
        style={{ left: 350, top: 550, width: 70, height: 35 }}
      />
      <div
        className="absolute bg-gray-900/80 border border-gray-800 rounded"
        style={{ left: 580, top: 480, width: 25, height: 15 }}
      />
      
      {/* Dark cave entrances */}
      <div
        className="absolute bg-black/90 border-2 border-gray-900 rounded-full shadow-2xl"
        style={{ left: 150, top: 400, width: 50, height: 50 }}
      />
      <div
        className="absolute bg-black/90 border-2 border-gray-900 rounded-full shadow-2xl"
        style={{ left: 600, top: 250, width: 40, height: 40 }}
      />
      
      {/* Scattered coal pieces */}
      <div className="absolute w-3 h-3 bg-black/80 rounded-full" style={{ left: 320, top: 380 }} />
      <div className="absolute w-2 h-2 bg-black/70 rounded-full" style={{ left: 380, top: 420 }} />
      <div className="absolute w-2 h-2 bg-gray-900/80 rounded-full" style={{ left: 450, top: 360 }} />
      <div className="absolute w-3 h-3 bg-black/80 rounded-full" style={{ left: 520, top: 390 }} />
    </>
  );

  const getBackgroundStyle = () => {
    if (currentLocation === 'village') {
      return {
        backgroundImage: `
          url(${grassTexture}),
          radial-gradient(circle at 500px 500px, rgba(139, 69, 19, 0.1) 0%, transparent 200px),
          radial-gradient(circle at 300px 800px, rgba(34, 139, 34, 0.1) 0%, transparent 150px),
          radial-gradient(circle at 800px 300px, rgba(34, 139, 34, 0.1) 0%, transparent 150px)
        `,
        backgroundSize: '256px 256px, 400px 400px, 300px 300px, 300px 300px',
        backgroundRepeat: 'repeat, no-repeat, no-repeat, no-repeat',
        backgroundColor: 'rgba(139, 186, 139, 0.1)'
      };
    } else {
      return {
        backgroundImage: `
          radial-gradient(circle at 400px 400px, rgba(30, 30, 35, 0.6) 0%, rgba(50, 50, 55, 0.2) 200px),
          linear-gradient(45deg, rgba(20, 20, 25, 0.2) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(25, 25, 30, 0.2) 25%, transparent 25%)
        `,
        backgroundSize: '300px 300px, 60px 60px, 60px 60px',
        backgroundColor: 'rgba(25, 25, 30, 0.8)'
      };
    }
  };

  return (
    <div className={`flex-1 overflow-hidden relative cursor-crosshair ${
      currentLocation === 'village' ? 'bg-village-bg' : 'bg-gray-900'
    }`}>
      <div 
        className="absolute w-full h-full"
        style={{
          transform: `translate(${cameraOffsetX}px, ${cameraOffsetY}px)`,
          width: mapWidth,
          height: mapHeight,
          ...getBackgroundStyle()
        }}
        onClick={handleMapClick}
      >
        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-primary rounded-full shadow-glow border-2 border-primary-foreground z-20 transition-all duration-75 ease-out"
          style={{
            left: player.position.x - 16,
            top: player.position.y - 16,
          }}
        />

        {/* Render location-specific content */}
        {currentLocation === 'village' ? renderVillage() : renderAbandonedMines()}
      </div>
    </div>
  );
};

export default GameMap;