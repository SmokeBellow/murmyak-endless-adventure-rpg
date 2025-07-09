import { useCallback } from 'react';
import { Player, NPC, LocationType } from '@/types/gameTypes';

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
      const portalDistance = Math.sqrt(Math.pow(200 - x, 2) + Math.pow(400 - y, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(200 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
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

  // Calculate camera offset to center player exactly in the middle of screen
  const zoomLevel = 1.2;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Center player exactly in the middle of the screen
  const cameraOffsetX = -player.position.x * zoomLevel + (screenWidth / 2);
  const cameraOffsetY = -player.position.y * zoomLevel + (screenHeight / 2);

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

      {/* Village house - replaced with image */}
      <img
        src="/house.png"
        alt="Village house"
        className="absolute w-24 h-24 object-contain"
        style={{
          left: 450,
          top: 450,
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
      {/* Main horizontal tunnel */}
      <div
        className="absolute bg-stone-800/30 border-t-2 border-b-2 border-stone-700"
        style={{ left: 100, top: 390, width: 600, height: 20 }}
      />
      
      {/* Vertical tunnel intersections */}
      <div
        className="absolute bg-stone-800/30 border-l-2 border-r-2 border-stone-700"
        style={{ left: 190, top: 200, width: 20, height: 400 }}
      />
      <div
        className="absolute bg-stone-800/30 border-l-2 border-r-2 border-stone-700"
        style={{ left: 390, top: 250, width: 20, height: 350 }}
      />
      <div
        className="absolute bg-stone-800/30 border-l-2 border-r-2 border-stone-700"
        style={{ left: 590, top: 300, width: 20, height: 200 }}
      />
      
      {/* Secondary horizontal tunnels */}
      <div
        className="absolute bg-stone-800/30 border-t-2 border-b-2 border-stone-700"
        style={{ left: 190, top: 240, width: 220, height: 20 }}
      />
      <div
        className="absolute bg-stone-800/30 border-t-2 border-b-2 border-stone-700"
        style={{ left: 390, top: 290, width: 220, height: 20 }}
      />
      <div
        className="absolute bg-stone-800/30 border-t-2 border-b-2 border-stone-700"
        style={{ left: 300, top: 540, width: 200, height: 20 }}
      />

      {/* Tunnel walls and barriers */}
      <div
        className="absolute bg-stone-900/90 border border-stone-700"
        style={{ left: 150, top: 350, width: 40, height: 40 }}
      />
      <div
        className="absolute bg-stone-900/90 border border-stone-700"
        style={{ left: 450, top: 320, width: 30, height: 50 }}
      />
      <div
        className="absolute bg-stone-900/90 border border-stone-700"
        style={{ left: 250, top: 450, width: 35, height: 35 }}
      />
      <div
        className="absolute bg-stone-900/90 border border-stone-700"
        style={{ left: 550, top: 420, width: 40, height: 30 }}
      />

      {/* Coal Mine - in a tunnel intersection */}
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

      {/* Return Portal - at tunnel entrance */}
      <div
        className="absolute bg-purple-700/90 border-2 border-purple-500 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-purple-200 font-bold shadow-lg shadow-black/60"
        style={{
          left: 180,
          top: 380,
          width: 40,
          height: 40,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const playerToPortalDistance = Math.sqrt(Math.pow(200 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
          if (playerToPortalDistance < 80) {
            onPortalUse();
          }
        }}
      >
        🌀
      </div>

      {/* Mine cart tracks */}
      <div className="absolute w-1 h-20 bg-gray-600/60" style={{ left: 195, top: 320 }} />
      <div className="absolute w-1 h-20 bg-gray-600/60" style={{ left: 205, top: 320 }} />
      <div className="absolute w-1 h-30 bg-gray-600/60" style={{ left: 395, top: 350 }} />
      <div className="absolute w-1 h-30 bg-gray-600/60" style={{ left: 405, top: 350 }} />

      {/* Support beams */}
      <div
        className="absolute bg-amber-900/80 border border-amber-800"
        style={{ left: 180, top: 200, width: 40, height: 8 }}
      />
      <div
        className="absolute bg-amber-900/80 border border-amber-800"
        style={{ left: 380, top: 250, width: 40, height: 8 }}
      />
      <div
        className="absolute bg-amber-900/80 border border-amber-800"
        style={{ left: 580, top: 300, width: 40, height: 8 }}
      />

      {/* Lanterns */}
      <div
        className="absolute bg-yellow-500/60 border border-yellow-400 rounded-full shadow-lg"
        style={{ left: 198, top: 210, width: 4, height: 4 }}
      />
      <div
        className="absolute bg-yellow-500/60 border border-yellow-400 rounded-full shadow-lg"
        style={{ left: 398, top: 260, width: 4, height: 4 }}
      />
      <div
        className="absolute bg-yellow-500/60 border border-yellow-400 rounded-full shadow-lg"
        style={{ left: 598, top: 310, width: 4, height: 4 }}
      />

      {/* Scattered coal and ore */}
      <div className="absolute w-3 h-3 bg-black/80 rounded-full" style={{ left: 220, top: 395 }} />
      <div className="absolute w-2 h-2 bg-black/70 rounded-full" style={{ left: 350, top: 405 }} />
      <div className="absolute w-2 h-2 bg-gray-900/80 rounded-full" style={{ left: 480, top: 385 }} />
      <div className="absolute w-3 h-3 bg-black/80 rounded-full" style={{ left: 520, top: 415 }} />
      <div className="absolute w-2 h-2 bg-orange-600/80 rounded-full" style={{ left: 300, top: 250 }} />
      <div className="absolute w-2 h-2 bg-orange-600/80 rounded-full" style={{ left: 420, top: 370 }} />
    </>
  );

  const getBackgroundStyle = () => {
    if (currentLocation === 'village') {
      return {
        backgroundImage: `
          url(/grass.png),
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
          transform: `translate(${cameraOffsetX}px, ${cameraOffsetY}px) scale(${zoomLevel})`,
          width: mapWidth,
          height: mapHeight,
          ...getBackgroundStyle()
        }}
        onClick={handleMapClick}
      >
        {/* Player - fixed in center of screen */}
        <img
          src="/player.png"
          alt="Player"
          className="fixed w-8 h-8 shadow-glow z-20 transition-all duration-150 ease-out"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />

        {/* Render location-specific content */}
        {currentLocation === 'village' ? renderVillage() : renderAbandonedMines()}
      </div>
    </div>
  );
};

export default GameMap;