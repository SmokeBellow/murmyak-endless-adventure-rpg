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
    if (currentLocation === 'village') {
      // Merchant house collision - exact match with visual house (300,300 -> 500,450)
      if (x >= 300 && x <= 500 && y >= 300 && y <= 450) {
        return true;
      }
    }
    return false;
  }, [currentLocation]);

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Calculate click position relative to screen center
    const clickScreenX = event.clientX - rect.left - rect.width / 2;
    const clickScreenY = event.clientY - rect.top - rect.height / 2;
    
    // Convert to world coordinates by accounting for zoom and player position
    const clickX = player.position.x + clickScreenX / zoomLevel;
    const clickY = player.position.y + clickScreenY / zoomLevel;
    
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
  const zoomLevel = 1.0;
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
      {/* Upper village boundary - fence */}
      <div 
        className="absolute"
        style={{
          left: 0,
          top: -34,
          width: mapWidth,
          height: 64,
          backgroundImage: 'url(/chastokol.png)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 64px',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Lower village boundary - fence */}
      <div 
        className="absolute"
        style={{
          left: 0,
          top: 1960,
          width: mapWidth,
          height: 64,
          backgroundImage: 'url(/chastokol.png)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 64px',
          imageRendering: 'pixelated'
        }}
      />

      {/* Left village boundary - fence */}
      <div 
        className="absolute"
        style={{
          left: -64,
          top: 0,
          width: 64,
          height: mapHeight,
          backgroundImage: 'url(/chastokol_side.png)',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '64px auto',
          imageRendering: 'pixelated'
        }}
      />

      {/* Right village boundary - fence */}
      <div 
        className="absolute"
        style={{
          left: mapWidth,
          top: 0,
          width: 64,
          height: mapHeight,
          backgroundImage: 'url(/chastokol_side.png)',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '64px auto',
          imageRendering: 'pixelated'
        }}
      />

      {/* Merchant House */}
      <div
        className="absolute bg-amber-800 border-2 border-amber-900 rounded shadow-lg"
        style={{
          left: 300,
          top: 300,
          width: 200,
          height: 150,
        }}
      >
        <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-800 rounded">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-amber-900 rounded-t-full"></div>
          <div className="absolute bottom-4 left-4 w-6 h-8 bg-amber-900 rounded"></div>
          <div className="absolute bottom-4 right-4 w-6 h-8 bg-amber-900 rounded"></div>
        </div>
      </div>
    </>
  );

  const renderAbandonedMines = () => (
    <>
      {/* All mine objects removed */}
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

  // Check if player is near NPC for interaction
  const isNearNPC = (npc: NPC) => {
    const distance = Math.sqrt(
      Math.pow(npc.position.x - player.position.x, 2) + 
      Math.pow(npc.position.y - player.position.y, 2)
    );
    return distance < 80;
  };

  // Get walking animation frame for down direction
  const getWalkDownFrame = () => {
    const frames = ['walk_down1.png', 'walk_down2.png', 'walk_down3.png'];
    const frameIndex = Math.floor(Date.now() / 200) % 3; // Change frame every 200ms
    return frames[frameIndex];
  };

  // Get walking animation frame for up direction
  const getWalkUpFrame = () => {
    const frames = ['walk_up1.png', 'walk_up2.png', 'walk_up3.png'];
    const frameIndex = Math.floor(Date.now() / 200) % 3; // Change frame every 200ms
    return frames[frameIndex];
  };

  // Get walking animation frame for side direction (left/right)
  const getWalkSideFrame = () => {
    const frames = ['walk_side1.png', 'walk_side2.png', 'walk_side3.png'];
    const frameIndex = Math.floor(Date.now() / 200) % 3; // Change frame every 200ms
    return frames[frameIndex];
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
        
        {/* Render NPCs */}
        {npcs.map(npc => (
          <div
            key={npc.id}
            className="absolute"
            style={{
              left: npc.position.x - 20,
              top: npc.position.y - 20,
            }}
          >
            {/* NPC name label */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs whitespace-nowrap font-bold">
              {npc.name}
            </div>
            
            {/* NPC sprite */}
            <div className="relative cursor-pointer">
              <img 
                src={npc.type === 'elder' ? '/headman.png' : '/lovable-uploads/0a5678b6-372c-4296-8aef-e92f5915a9c0.png'} 
                alt="NPC" 
                className="w-10 h-10"
              />
              
              {/* E prompt when player is near */}
              {isNearNPC(npc) && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Player - fixed in center of screen, outside the map container */}
      <img
        src={
          player.isMoving 
            ? (player.direction === 'down' ? `/${getWalkDownFrame()}` 
               : player.direction === 'up' ? `/${getWalkUpFrame()}`
               : player.direction === 'left' ? `/${getWalkSideFrame()}`
               : player.direction === 'right' ? `/${getWalkSideFrame()}`
               : "/walk_up2.png")
            : "/walk_up2.png"
        }
        alt="Player"
        className="fixed w-8 h-8 shadow-glow z-30 transition-all duration-150 ease-out"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) ${player.direction === 'right' && player.isMoving ? 'scaleX(-1)' : ''}`,
          pointerEvents: 'none',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default GameMap;