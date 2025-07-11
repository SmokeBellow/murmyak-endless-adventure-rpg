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

  // Collision detection using correct world coordinates
  const isColliding = useCallback((x: number, y: number) => {
    if (currentLocation === 'village') {
      // Building collisions in village - using exact world coordinates from visual positions
      const buildings = [
        { x: 870, y: 420, width: 96, height: 96 }, // House
        { x: 850, y: 550, width: 80, height: 60 },   // Second building  
        { x: 800, y: 510, width: 60, height: 50 },   // Blacksmith forge
      ];
      
      // Fountain collision - center at (400,400), radius 25
      const fountainDistance = Math.sqrt(Math.pow(400 - x, 2) + Math.pow(400 - y, 2));
      if (fountainDistance < 25) {
        return true;
      }
      
      // Check building collisions
      for (const building of buildings) {
        if (x >= building.x && x <= building.x + building.width &&
            y >= building.y && y <= building.y + building.height) {
          return true;
        }
      }
      
      // NPC collisions - using exact world coordinates
      const npcPositions = [
        { x: 1070, y: 530, radius: 20 }, // Торговец
        { x: 820, y: 490, radius: 20 },  // Староста
        { x: 780, y: 540, radius: 20 },  // Кузнец
      ];
      
      for (const npcPos of npcPositions) {
        const distance = Math.sqrt(Math.pow(npcPos.x - x, 2) + Math.pow(npcPos.y - y, 2));
        if (distance < npcPos.radius) {
          return true;
        }
      }
      
    } else if (currentLocation === 'abandoned-mines') {
      // Mine walls and barriers
      const mineWalls = [
        // Horizontal walls
        { x: 100, y: 200, width: 90, height: 20 },
        { x: 210, y: 200, width: 90, height: 20 },
        { x: 320, y: 200, width: 90, height: 20 },
        { x: 430, y: 200, width: 90, height: 20 },
        { x: 540, y: 200, width: 80, height: 20 },
        
        { x: 100, y: 320, width: 90, height: 20 },
        { x: 230, y: 320, width: 80, height: 20 },
        { x: 350, y: 320, width: 90, height: 20 },
        { x: 480, y: 320, width: 140, height: 20 },
        
        { x: 100, y: 440, width: 120, height: 20 },
        { x: 260, y: 440, width: 80, height: 20 },
        { x: 380, y: 440, width: 100, height: 20 },
        { x: 520, y: 440, width: 100, height: 20 },
        
        { x: 150, y: 560, width: 100, height: 20 },
        { x: 290, y: 560, width: 120, height: 20 },
        { x: 450, y: 560, width: 90, height: 20 },
        
        // Vertical walls
        { x: 100, y: 220, width: 20, height: 100 },
        { x: 170, y: 220, width: 20, height: 80 },
        { x: 210, y: 240, width: 20, height: 80 },
        { x: 280, y: 220, width: 20, height: 120 },
        { x: 350, y: 220, width: 20, height: 100 },
        { x: 410, y: 220, width: 20, height: 80 },
        { x: 480, y: 220, width: 20, height: 100 },
        { x: 540, y: 220, width: 20, height: 120 },
        { x: 600, y: 220, width: 20, height: 100 },
        
        { x: 120, y: 340, width: 20, height: 100 },
        { x: 190, y: 340, width: 20, height: 80 },
        { x: 230, y: 340, width: 20, height: 100 },
        { x: 310, y: 340, width: 20, height: 100 },
        { x: 380, y: 340, width: 20, height: 100 },
        { x: 440, y: 340, width: 20, height: 80 },
        { x: 520, y: 340, width: 20, height: 100 },
        { x: 580, y: 340, width: 20, height: 120 },
        
        { x: 150, y: 460, width: 20, height: 100 },
        { x: 220, y: 460, width: 20, height: 80 },
        { x: 290, y: 460, width: 20, height: 100 },
        { x: 360, y: 460, width: 20, height: 100 },
        { x: 450, y: 460, width: 20, height: 100 },
        { x: 520, y: 460, width: 20, height: 80 },
      ];
      
      // Check mine wall collisions
      for (const wall of mineWalls) {
        if (x >= wall.x && x <= wall.x + wall.width &&
            y >= wall.y && y <= wall.y + wall.height) {
          return true;
        }
      }
    }
    
    return false;
  }, [currentLocation]);

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Calculate click position in world coordinates
    const zoomLevel = 1.2;
    const clickX = (event.clientX - rect.left - rect.width / 2) / zoomLevel + player.position.x;
    const clickY = (event.clientY - rect.top - rect.height / 2) / zoomLevel + player.position.y;
    
    console.log('Map clicked at world coords:', clickX, clickY, 'player at:', player.position);
    
    if (currentLocation === 'village') {
      // Check if clicking on fountain
      const fountainDistance = Math.sqrt(Math.pow(400 - clickX, 2) + Math.pow(400 - clickY, 2));
      const playerToFountainDistance = Math.sqrt(Math.pow(400 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
      if (fountainDistance < 30 && playerToFountainDistance < 80) {
        console.log('Fountain clicked!');
        onFountainUse();
        return;
      }
      
      // Check if clicking on portal
      const portalDistance = Math.sqrt(Math.pow(700 - clickX, 2) + Math.pow(300 - clickY, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(700 - player.position.x, 2) + Math.pow(300 - player.position.y, 2));
      if (portalDistance < 40 && playerToPortalDistance < 80) {
        console.log('Portal clicked!');
        onPortalUse();
        return;
      }
    } else if (currentLocation === 'abandoned-mines') {
      // Check if clicking on coal mine in abandoned mines
      const coalMineDistance = Math.sqrt(Math.pow(400 - clickX, 2) + Math.pow(400 - clickY, 2));
      const playerToCoalMineDistance = Math.sqrt(Math.pow(400 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
      if (coalMineDistance < 40 && playerToCoalMineDistance < 80) {
        console.log('Coal mine clicked!');
        onCoalMineInteract();
        return;
      }
      
      // Check if clicking on return portal
      const portalDistance = Math.sqrt(Math.pow(200 - clickX, 2) + Math.pow(400 - clickY, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(200 - player.position.x, 2) + Math.pow(400 - player.position.y, 2));
      if (portalDistance < 40 && playerToPortalDistance < 80) {
        console.log('Return portal clicked!');
        onPortalUse();
        return;
      }
    }
    
    // Check if clicking on NPC (only in village)
    if (currentLocation === 'village') {
      const clickedNPC = npcs.find(npc => {
        const distance = Math.sqrt(Math.pow(npc.position.x - clickX, 2) + Math.pow(npc.position.y - clickY, 2));
        const playerToNPCDistance = Math.sqrt(Math.pow(npc.position.x - player.position.x, 2) + Math.pow(npc.position.y - player.position.y, 2));
        return distance < 50 && playerToNPCDistance < 300; // Увеличили радиус
      });
      
      if (clickedNPC) {
        console.log('NPC clicked via map:', clickedNPC.name);
        console.log('Click coords:', clickX, clickY, 'NPC coords:', clickedNPC.position, 'Player coords:', player.position);
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
          className={`absolute w-8 h-8 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-20 border-2 border-foreground/20 ${
            npc.type === 'merchant' ? 'bg-accent' : npc.type === 'blacksmith' ? 'bg-orange-500' : 'bg-secondary'
          }`}
          style={{
            left: npc.position.x - 16,
            top: npc.position.y - 16,
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('NPC clicked directly:', npc.name, 'at', npc.position);
            console.log('Player position:', player.position);
            const playerToNPCDistance = Math.sqrt(Math.pow(npc.position.x - player.position.x, 2) + Math.pow(npc.position.y - player.position.y, 2));
            console.log('Distance to player:', playerToNPCDistance);
            // Увеличиваем радиус взаимодействия до 300 пикселей
            if (playerToNPCDistance < 300) {
              console.log('Opening dialogue with:', npc.name);
              onNPCInteract(npc);
            } else {
              console.log('Too far from NPC - need to be within 300 pixels');
            }
          }}
        />
      ))}

      {/* Village house - точные координаты с отладкой */}
      <img
        src="/house.png" 
        alt="Village house"
        className="absolute w-24 h-24 object-contain border-2 border-red-500/50"
        style={{
          left: 870,
          top: 420,
        }}
        title="House: (870, 420) - 96x96"
      />
      
      {/* House collision box visualization */}
      <div
        className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-10"
        style={{
          left: 870,
          top: 420,
          width: 96,
          height: 96,
        }}
        title="House Collision: (870, 420) - 96x96"
      />
      <div
        className="absolute bg-stone/80 border-2 border-border rounded-lg"
        style={{
          left: 850,
          top: 550,
          width: 80,
          height: 60,
        }}
      />
      <div
        className="absolute bg-orange-800/80 border-2 border-orange-600 rounded-lg flex items-center justify-center text-white font-bold"
        style={{
          left: 800,
          top: 510,
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
      {/* Maze walls - Horizontal walls */}
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 100, top: 200, width: 90, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 210, top: 200, width: 90, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 320, top: 200, width: 90, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 430, top: 200, width: 90, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 540, top: 200, width: 80, height: 20 }} />
      
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 100, top: 320, width: 90, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 230, top: 320, width: 80, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 350, top: 320, width: 90, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 480, top: 320, width: 140, height: 20 }} />
      
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 100, top: 440, width: 120, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 260, top: 440, width: 80, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 380, top: 440, width: 100, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 520, top: 440, width: 100, height: 20 }} />
      
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 150, top: 560, width: 100, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 290, top: 560, width: 120, height: 20 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 450, top: 560, width: 90, height: 20 }} />

      {/* Maze walls - Vertical walls */}
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 100, top: 220, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 170, top: 220, width: 20, height: 80 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 210, top: 240, width: 20, height: 80 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 280, top: 220, width: 20, height: 120 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 350, top: 220, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 410, top: 220, width: 20, height: 80 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 480, top: 220, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 540, top: 220, width: 20, height: 120 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 600, top: 220, width: 20, height: 100 }} />
      
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 120, top: 340, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 190, top: 340, width: 20, height: 80 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 230, top: 340, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 310, top: 340, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 380, top: 340, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 440, top: 340, width: 20, height: 80 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 520, top: 340, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 580, top: 340, width: 20, height: 120 }} />
      
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 150, top: 460, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 220, top: 460, width: 20, height: 80 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 290, top: 460, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 360, top: 460, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 450, top: 460, width: 20, height: 100 }} />
      <div className="absolute bg-stone-900/90 border border-stone-700 shadow-inner" style={{ left: 520, top: 460, width: 20, height: 80 }} />

      {/* Coal Mine - in a clear area of the maze */}
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

      {/* Return Portal - at maze entrance */}
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

      {/* Mine cart tracks along the paths */}
      <div className="absolute w-1 h-15 bg-gray-600/60 rotate-90" style={{ left: 135, top: 388 }} />
      <div className="absolute w-1 h-15 bg-gray-600/60 rotate-90" style={{ left: 145, top: 388 }} />
      <div className="absolute w-1 h-20 bg-gray-600/60" style={{ left: 195, top: 360 }} />
      <div className="absolute w-1 h-20 bg-gray-600/60" style={{ left: 205, top: 360 }} />

      {/* Support beams in corridors */}
      <div className="absolute bg-amber-900/80 border border-amber-800" style={{ left: 130, top: 220, width: 30, height: 6 }} />
      <div className="absolute bg-amber-900/80 border border-amber-800" style={{ left: 250, top: 340, width: 30, height: 6 }} />
      <div className="absolute bg-amber-900/80 border border-amber-800" style={{ left: 470, top: 340, width: 30, height: 6 }} />

      {/* Lanterns for lighting */}
      <div className="absolute bg-yellow-500/60 border border-yellow-400 rounded-full shadow-lg" style={{ left: 143, top: 228, width: 4, height: 4 }} />
      <div className="absolute bg-yellow-500/60 border border-yellow-400 rounded-full shadow-lg" style={{ left: 263, top: 348, width: 4, height: 4 }} />
      <div className="absolute bg-yellow-500/60 border border-yellow-400 rounded-full shadow-lg" style={{ left: 483, top: 348, width: 4, height: 4 }} />

      {/* Scattered coal and debris in corridors */}
      <div className="absolute w-3 h-3 bg-black/80 rounded-full" style={{ left: 130, top: 250 }} />
      <div className="absolute w-2 h-2 bg-black/70 rounded-full" style={{ left: 250, top: 370 }} />
      <div className="absolute w-2 h-2 bg-gray-900/80 rounded-full" style={{ left: 470, top: 370 }} />
      <div className="absolute w-3 h-3 bg-black/80 rounded-full" style={{ left: 340, top: 480 }} />
      <div className="absolute w-2 h-2 bg-orange-600/80 rounded-full" style={{ left: 160, top: 280 }} />
      <div className="absolute w-2 h-2 bg-orange-600/80 rounded-full" style={{ left: 420, top: 385 }} />

      {/* Corner rocks and rubble */}
      <div className="absolute bg-gray-800/70 border border-gray-700 rounded" style={{ left: 122, top: 322, width: 16, height: 16 }} />
      <div className="absolute bg-gray-800/70 border border-gray-700 rounded" style={{ left: 252, top: 442, width: 16, height: 16 }} />
      <div className="absolute bg-gray-800/70 border border-gray-700 rounded" style={{ left: 472, top: 442, width: 16, height: 16 }} />
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
        {/* Render location-specific content */}
        {currentLocation === 'village' ? renderVillage() : renderAbandonedMines()}
      </div>
      
      {/* Player - fixed in center of screen, outside the map container */}
      <img
        src="/player.png"
        alt="Player"
        className="fixed w-8 h-8 shadow-glow z-30 transition-all duration-150 ease-out"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default GameMap;