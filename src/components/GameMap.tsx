import { useCallback, useState, useEffect } from 'react';
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
  const [isLightCheatEnabled, setIsLightCheatEnabled] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Handle cheat code for light (123 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key.toLowerCase());
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check for cheat code
  useEffect(() => {
    if (pressedKeys.has('1') && pressedKeys.has('2') && pressedKeys.has('3')) {
      setIsLightCheatEnabled(prev => !prev);
      setPressedKeys(new Set()); // Clear keys after activation
    }
  }, [pressedKeys]);
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
      
      // Check if clicking on ore mine in abandoned mines
      const oreMineDistance = Math.sqrt(Math.pow(600 - clickX, 2) + Math.pow(500 - clickY, 2));
      const playerToOreMineDistance = Math.sqrt(Math.pow(600 - player.position.x, 2) + Math.pow(500 - player.position.y, 2));
      if (oreMineDistance < 40 && playerToOreMineDistance < 80) {
        console.log('Ore mine clicked!');
        onCoalMineInteract(); // Reuse coal mining interface for ore
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
          left: 0,
          top: 0,
          width: 64,
          height: mapHeight,
          backgroundImage: 'url(/chastokol_left.png)',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '32px auto',
          imageRendering: 'pixelated',
          zIndex: 10
        }}
      />

      {/* Right village boundary - fence */}
      <div 
        className="absolute"
        style={{
          left: mapWidth - 64,
          top: 0,
          width: 64,
          height: mapHeight,
          backgroundImage: 'url(/chastokol_left.png)',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '32px auto',
          imageRendering: 'pixelated',
          zIndex: 10
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

  // Check if player is near portal for interaction
  const isNearPortal = () => {
    if (currentLocation === 'village') {
      const distance = Math.sqrt(
        Math.pow(700 - player.position.x, 2) + 
        Math.pow(300 - player.position.y, 2)
      );
      return distance < 80;
    } else if (currentLocation === 'abandoned-mines') {
      const distance = Math.sqrt(
        Math.pow(200 - player.position.x, 2) + 
        Math.pow(400 - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
  };

  // Check if player is near fountain for interaction
  const isNearFountain = () => {
    if (currentLocation === 'village') {
      const distance = Math.sqrt(
        Math.pow(400 - player.position.x, 2) + 
        Math.pow(400 - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
  };

  // Check if player is near coal mine for interaction
  const isNearCoalMine = () => {
    if (currentLocation === 'abandoned-mines') {
      const distance = Math.sqrt(
        Math.pow(400 - player.position.x, 2) + 
        Math.pow(400 - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
  };

  // Check if player is near ore mine for interaction
  const isNearOreMine = () => {
    if (currentLocation === 'abandoned-mines') {
      const distance = Math.sqrt(
        Math.pow(600 - player.position.x, 2) + 
        Math.pow(500 - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
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
      {/* Mine darkness overlay - only for abandoned-mines location */}
      {currentLocation === 'abandoned-mines' && !isLightCheatEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: `radial-gradient(circle 120px at ${50 + (cameraOffsetX + player.position.x * zoomLevel) / window.innerWidth * 100}% ${50 + (cameraOffsetY + player.position.y * zoomLevel) / window.innerHeight * 100}%, 
              transparent 0%, 
              rgba(0, 0, 0, 0.2) 40%, 
              rgba(0, 0, 0, 0.7) 80%, 
              rgba(0, 0, 0, 0.9) 100%)`,
          }}
        />
      )}
      
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
        
        {/* Special objects */}
        {currentLocation === 'village' && (
          <>
            {/* Fountain */}
            <div
              className="absolute"
              style={{
                left: 380,
                top: 380,
              }}
            >
              <div
                className="bg-blue-500 rounded-full border-4 border-blue-400 shadow-lg cursor-pointer hover:bg-blue-400 transition-colors"
                style={{
                  width: 40,
                  height: 40,
                }}
                title="Фонтан исцеления"
              />
              
              {/* E prompt when player is near */}
              {isNearFountain() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
            
            {/* Portal to mines */}
            <div
              className="absolute"
              style={{
                left: 680,
                top: 280,
              }}
            >
              <div
                className="bg-purple-600 rounded-full border-4 border-purple-400 shadow-lg cursor-pointer hover:bg-purple-500 transition-colors animate-pulse"
                style={{
                  width: 40,
                  height: 40,
                }}
                title="Портал в заброшенные шахты"
              >
                <div className="absolute inset-0 rounded-full bg-purple-400/50 animate-ping" />
              </div>
              
              {/* E prompt when player is near */}
              {isNearPortal() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
          </>
        )}
        
        {currentLocation === 'abandoned-mines' && (
          <>
            {/* Coal mine */}
            <div
              className="absolute"
              style={{
                left: 380,
                top: 380,
              }}
            >
              <div
                className="bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg cursor-pointer hover:bg-gray-600 transition-colors"
                style={{
                  width: 40,
                  height: 40,
                }}
                title="Угольная шахта"
              />
              
              {/* E prompt when player is near */}
              {isNearCoalMine() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
            
            {/* Ore mine */}
            <div
              className="absolute"
              style={{
                left: 580,
                top: 480,
              }}
            >
              <div
                className="bg-amber-600 rounded-lg border-2 border-amber-500 shadow-lg cursor-pointer hover:bg-amber-500 transition-colors"
                style={{
                  width: 40,
                  height: 40,
                }}
                title="Рудная жила"
              />
              
              {/* E prompt when player is near */}
              {isNearOreMine() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
            
            {/* Return portal */}
            <div
              className="absolute"
              style={{
                left: 180,
                top: 380,
              }}
            >
              <div
                className="bg-green-600 rounded-full border-4 border-green-400 shadow-lg cursor-pointer hover:bg-green-500 transition-colors animate-pulse"
                style={{
                  width: 40,
                  height: 40,
                }}
                title="Портал обратно в деревню"
              >
                <div className="absolute inset-0 rounded-full bg-green-400/50 animate-ping" />
              </div>
              
              {/* E prompt when player is near */}
              {isNearPortal() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Render NPCs only in village */}
        {currentLocation === 'village' && npcs.map(npc => (
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
                src={
                  npc.type === 'elder' ? '/headman.png' :
                  npc.type === 'blacksmith' ? '/blacksmith.png' :
                  npc.type === 'merchant' ? '/trademan.png' :
                  '/lovable-uploads/0a5678b6-372c-4296-8aef-e92f5915a9c0.png'
                } 
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
        className="fixed w-8 h-8 shadow-glow z-30 transition-[left,top] duration-150 ease-out"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) ${player.direction === 'right' ? 'scaleX(-1)' : ''}`,
          pointerEvents: 'none',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default GameMap;