import { useCallback, useState, useEffect, useRef } from 'react';
import { Player, NPC, LocationType, Enemy } from '@/types/gameTypes';
import { MinesMap } from '@/components/MinesMap';
import { AnimatedRat } from '@/components/AnimatedRat';
import AnimatedBat from '@/components/AnimatedBat';
import { minesObstaclesThick as minesObstacles } from '@/maps/minesLayout';

interface GameMapProps {
  player: Player;
  npcs: NPC[];
  enemies: Enemy[];
  onNPCInteract: (npc: NPC) => void;
  onEnemyClick: (enemy: Enemy) => void;
  onFountainUse: () => void;
  onCoalMineInteract: () => void;
  currentLocation: LocationType;
  onPortalUse: () => void;
  onNoClipToggle?: (enabled: boolean) => void;
  onTreasureChestInteract?: () => void;
  isTreasureChestOpened?: boolean;
}

const GameMap = ({ player, npcs, enemies, onNPCInteract, onEnemyClick, onFountainUse, onCoalMineInteract, currentLocation, onPortalUse, onNoClipToggle, onTreasureChestInteract, isTreasureChestOpened }: GameMapProps) => {
  const [isLightCheatEnabled, setIsLightCheatEnabled] = useState(false);
  const [isNoClipCheatEnabled, setIsNoClipCheatEnabled] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const lightCanvasRef = useRef<HTMLCanvasElement>(null);

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

  // Check for cheat codes
  useEffect(() => {
    if (pressedKeys.has('1') && pressedKeys.has('2') && pressedKeys.has('3')) {
      setIsLightCheatEnabled(prev => !prev);
      setPressedKeys(new Set()); // Clear keys after activation
    }
    if (pressedKeys.has('3') && pressedKeys.has('4') && pressedKeys.has('5')) {
      setIsNoClipCheatEnabled(prev => {
        const newValue = !prev;
        onNoClipToggle?.(newValue);
        console.log('No-clip cheat toggled:', newValue);
        return newValue;
      });
      setPressedKeys(new Set()); // Clear keys after activation
    }
  }, [pressedKeys]);
  const mapWidth = 2000;
  const mapHeight = 2000;

  // Mines collision helpers
  const isPointInWall = useCallback((px: number, py: number) => {
    for (const r of minesObstacles) {
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return true;
    }
    return false;
  }, []);

  const findSafePositionNear = useCallback((x: number, y: number) => {
    if (!isPointInWall(x, y)) return { x, y };
    const step = 10;
    const maxRadius = 300;
    for (let radius = step; radius <= maxRadius; radius += step) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const px = Math.max(40, Math.min(mapWidth - 40, Math.round(x + Math.cos(angle) * radius)));
        const py = Math.max(40, Math.min(mapHeight - 40, Math.round(y + Math.sin(angle) * radius)));
        if (!isPointInWall(px, py)) return { x: px, y: py };
      }
    }
    return { x: 140, y: 140 };
  }, [isPointInWall]);

  const [mineCenters, setMineCenters] = useState({
    coal: { x: 400, y: 400 },
    ore: { x: 600, y: 500 },
    portal: { x: 50, y: 50 },
  });

  // Torch positions in mines
  const torchPositions = [
    { x: 800, y: 200 },
    { x: 1200, y: 600 },
    { x: 300, y: 800 },
    { x: 1500, y: 400 },
    { x: 500, y: 1200 },
    { x: 1000, y: 1000 }
  ];

  useEffect(() => {
    if (currentLocation === 'abandoned-mines') {
      setMineCenters({
        coal: findSafePositionNear(400, 400),
        ore: findSafePositionNear(600, 500),
        portal: findSafePositionNear(50, 50),
      });
    }
  }, [currentLocation, findSafePositionNear]);

  // Collision detection
  const isColliding = useCallback((x: number, y: number) => {
    if (currentLocation === 'village') {
      // Fountain collision - based on fountain image boundaries (64x64 centered at 1000,800)
      if (x >= 968 && x <= 1032 && y >= 768 && y <= 832) {
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
      // Check if clicking on fountain (adjusted for fountain shape)
      const fountainDistance = Math.sqrt(Math.pow(1000 - clickX, 2) + Math.pow(800 - clickY, 2));
      const playerToFountainDistance = Math.sqrt(Math.pow(1000 - player.position.x, 2) + Math.pow(800 - player.position.y, 2));
      if (fountainDistance < 25 && playerToFountainDistance < 80) {
        console.log('Fountain clicked!');
        onFountainUse();
        return;
      }
      
      // Check if clicking on portal
      const portalDistance = Math.sqrt(Math.pow(1700 - clickX, 2) + Math.pow(300 - clickY, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(1700 - player.position.x, 2) + Math.pow(300 - player.position.y, 2));
      if (portalDistance < 40 && playerToPortalDistance < 80) {
        console.log('Portal clicked!');
        onPortalUse();
        return;
      }
    } else if (currentLocation === 'abandoned-mines') {
      // Check if clicking on coal mine in abandoned mines
      const coalMineDistance = Math.sqrt(Math.pow(mineCenters.coal.x - clickX, 2) + Math.pow(mineCenters.coal.y - clickY, 2));
      const playerToCoalMineDistance = Math.sqrt(Math.pow(mineCenters.coal.x - player.position.x, 2) + Math.pow(mineCenters.coal.y - player.position.y, 2));
      if (coalMineDistance < 40 && playerToCoalMineDistance < 80) {
        console.log('Coal mine clicked!');
        onCoalMineInteract();
        return;
      }
      
      // Check if clicking on ore mine in abandoned mines
      const oreMineDistance = Math.sqrt(Math.pow(mineCenters.ore.x - clickX, 2) + Math.pow(mineCenters.ore.y - clickY, 2));
      const playerToOreMineDistance = Math.sqrt(Math.pow(mineCenters.ore.x - player.position.x, 2) + Math.pow(mineCenters.ore.y - player.position.y, 2));
      if (oreMineDistance < 40 && playerToOreMineDistance < 80) {
        console.log('Ore mine clicked!');
        onCoalMineInteract(); // Reuse coal mining interface for ore
        return;
      }
      
      // Check if clicking on treasure chest in abandoned mines
      if (!isTreasureChestOpened) {
        const treasureChestDistance = Math.sqrt(Math.pow(1960 - clickX, 2) + Math.pow(50 - clickY, 2));
        const playerToTreasureChestDistance = Math.sqrt(Math.pow(1960 - player.position.x, 2) + Math.pow(50 - player.position.y, 2));
        if (treasureChestDistance < 40 && playerToTreasureChestDistance < 80) {
          console.log('Treasure chest clicked!');
          onTreasureChestInteract?.();
          return;
        }
      }
      
      // Check if clicking on return portal
      const portalDistance = Math.sqrt(Math.pow(mineCenters.portal.x - clickX, 2) + Math.pow(mineCenters.portal.y - clickY, 2));
      const playerToPortalDistance = Math.sqrt(Math.pow(mineCenters.portal.x - player.position.x, 2) + Math.pow(mineCenters.portal.y - player.position.y, 2));
      if (portalDistance < 40 && playerToPortalDistance < 80) {
        console.log('Return portal clicked!');
        onPortalUse();
        return;
      }
    }
    
    // Check if clicking on NPC (only in village)
    if (currentLocation === 'village') {
      const clickedNPC = npcs.find(npc => {
        // First check if NPC should be visible
        if (npc.type === 'mage' || npc.type === 'scout' || npc.type === 'guardian') {
          if (!npc.visible) {
            return false; // Skip invisible special NPCs from search
          }
        }
        
        const distance = Math.sqrt(Math.pow(npc.position.x - clickX, 2) + Math.pow(npc.position.y - clickY, 2));
        const playerToNPCDistance = Math.sqrt(Math.pow(npc.position.x - player.position.x, 2) + Math.pow(npc.position.y - player.position.y, 2));
        return distance < 50 && playerToNPCDistance < 300; // Увеличили радиус
      });
      
      if (clickedNPC) {
        console.log('NPC clicked via map:', clickedNPC.name);
        console.log('Click coords:', clickX, clickY, 'NPC coords:', clickedNPC.position, 'Player coords:', player.position);
        onNPCInteract(clickedNPC);
        return;
      }
    }
    
    // Check if clicking on enemy (only in abandoned mines)
    if (currentLocation === 'abandoned-mines') {
      const clickedEnemy = enemies.find(enemy => {
        if (enemy.isDead) return false;
        const distance = Math.sqrt(Math.pow(enemy.position.x - clickX, 2) + Math.pow(enemy.position.y - clickY, 2));
        const playerToEnemyDistance = Math.sqrt(Math.pow(enemy.position.x - player.position.x, 2) + Math.pow(enemy.position.y - player.position.y, 2));
        return distance < 30 && playerToEnemyDistance < 150; // Attack range
      });
      
      if (clickedEnemy) {
        console.log('Enemy clicked via map:', clickedEnemy.name);
        onEnemyClick(clickedEnemy);
        return;
      }
    }
    // Removed player movement on click
  }, [player.position, npcs, enemies, onNPCInteract, onEnemyClick, onFountainUse, onCoalMineInteract, currentLocation, onPortalUse, onTreasureChestInteract, isTreasureChestOpened]);

  // Calculate camera offset to center player exactly in the middle of screen
  const zoomLevel = 1.0;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Center player exactly in the middle of the screen
  const cameraOffsetX = -player.position.x * zoomLevel + (screenWidth / 2);
  const cameraOffsetY = -player.position.y * zoomLevel + (screenHeight / 2);

  // Draw dynamic darkness overlay with gradient light areas using canvas
  useEffect(() => {
    const canvas = lightCanvasRef.current;
    if (!canvas) return;
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If not in mines or cheat enabled, do nothing (no darkness)
    if (currentLocation !== 'abandoned-mines' || isLightCheatEnabled) return;

    // Fill with complete darkness
    ctx.fillStyle = 'rgba(0,0,0,1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create gradient light areas using destination-out
    ctx.globalCompositeOperation = 'destination-out';

    // Player light (150px radius with gradient)
    const playerGradient = ctx.createRadialGradient(
      player.position.x, player.position.y, 0,
      player.position.x, player.position.y, 150
    );
    playerGradient.addColorStop(0, 'rgba(255,255,255,1.0)'); // Full transparency at center
    playerGradient.addColorStop(0.7, 'rgba(255,255,255,0.8)'); // Gradual fade
    playerGradient.addColorStop(1, 'rgba(255,255,255,0.0)'); // No transparency at edge

    ctx.fillStyle = playerGradient;
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, 150, 0, Math.PI * 2);
    ctx.fill();

    // Torch lights (100px radius with gradient)
    torchPositions.forEach(t => {
      const torchGradient = ctx.createRadialGradient(
        t.x, t.y, 0,
        t.x, t.y, 100
      );
      torchGradient.addColorStop(0, 'rgba(255,255,255,0.9)'); // Slightly less bright than player
      torchGradient.addColorStop(0.6, 'rgba(255,255,255,0.6)'); // Gradual fade
      torchGradient.addColorStop(1, 'rgba(255,255,255,0.0)'); // No transparency at edge

      ctx.fillStyle = torchGradient;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 100, 0, Math.PI * 2);
      ctx.fill();
    });

    // Reset composite for safety
    ctx.globalCompositeOperation = 'source-over';
  }, [currentLocation, isLightCheatEnabled, player.position.x, player.position.y]);

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
      {/* Forest zones - 200px from each edge */}
      {/* Top forest */}
      <div 
        className="absolute pixelated"
        style={{
          left: 0,
          top: 0,
          width: mapWidth,
          height: 200,
          backgroundImage: 'url(/forest.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          zIndex: 5
        }}
      />
      
      {/* Bottom forest */}
      <div 
        className="absolute pixelated"
        style={{
          left: 0,
          top: mapHeight - 200,
          width: mapWidth,
          height: 200,
          backgroundImage: 'url(/forest.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          zIndex: 5
        }}
      />
      
      {/* Left forest */}
      <div 
        className="absolute pixelated"
        style={{
          left: 0,
          top: 200,
          width: 200,
          height: mapHeight - 400,
          backgroundImage: 'url(/forest.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          zIndex: 5
        }}
      />
      
      {/* Right forest */}
      <div 
        className="absolute pixelated"
        style={{
          left: mapWidth - 200,
          top: 200,
          width: 200,
          height: mapHeight - 400,
          backgroundImage: 'url(/forest.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          zIndex: 5
        }}
      />

      {/* Upper village boundary - fence - left part */}
      <div 
        className="absolute"
        style={{
          left: 500,
          top: 500,
          width: 400,
          height: 64,
          backgroundImage: 'url(/chastokol.png)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 64px',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Upper village boundary - fence - right part */}
      <div 
        className="absolute"
        style={{
          left: 1100,
          top: 500,
          width: 400,
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
          left: 500,
          top: 1500,
          width: 1000,
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
          left: 468,
          top: 500,
          width: 64,
          height: 1000,
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
          left: 1468,
          top: 500,
          width: 64,
          height: 1000,
          backgroundImage: 'url(/chastokol_left.png)',
          backgroundRepeat: 'repeat-y',
          backgroundSize: '32px auto',
          imageRendering: 'pixelated',
          zIndex: 10
        }}
      />

    </>
  );

  const renderAbandonedMines = () => (
    <>
      {/* Labyrinth maze layout */}
      <MinesMap mapWidth={mapWidth} mapHeight={mapHeight} />
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
        Math.pow(1700 - player.position.x, 2) + 
        Math.pow(300 - player.position.y, 2)
      );
      return distance < 80;
    } else if (currentLocation === 'abandoned-mines') {
      const distance = Math.sqrt(
        Math.pow(mineCenters.portal.x - player.position.x, 2) + 
        Math.pow(mineCenters.portal.y - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
  };

  // Check if player is near fountain for interaction
  const isNearFountain = () => {
    if (currentLocation === 'village') {
      const distance = Math.sqrt(
        Math.pow(1000 - player.position.x, 2) + 
        Math.pow(800 - player.position.y, 2)
      );
      return distance < 65;
    }
    return false;
  };

  // Check if player is near coal mine for interaction
  const isNearCoalMine = () => {
    if (currentLocation === 'abandoned-mines') {
      const distance = Math.sqrt(
        Math.pow(mineCenters.coal.x - player.position.x, 2) + 
        Math.pow(mineCenters.coal.y - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
  };

  // Check if player is near ore mine for interaction
  const isNearOreMine = () => {
    if (currentLocation === 'abandoned-mines') {
      const distance = Math.sqrt(
        Math.pow(mineCenters.ore.x - player.position.x, 2) + 
        Math.pow(mineCenters.ore.y - player.position.y, 2)
      );
      return distance < 80;
    }
    return false;
  };

  // Check if player is near treasure chest for interaction
  const isNearTreasureChest = () => {
    if (currentLocation === 'abandoned-mines' && !isTreasureChestOpened) {
      const distance = Math.sqrt(
        Math.pow(1960 - player.position.x, 2) + 
        Math.pow(50 - player.position.y, 2)
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
        {/* Darkness overlay canvas with light holes */}
        {currentLocation === 'abandoned-mines' && !isLightCheatEnabled && (
          <canvas
            ref={lightCanvasRef}
            className="absolute pointer-events-none z-20"
            style={{ left: 0, top: 0, width: mapWidth, height: mapHeight }}
          />
        )}

        {/* Render location-specific content */}
        {currentLocation === 'village' ? renderVillage() : renderAbandonedMines()}
        
        {/* Special objects */}
        {currentLocation === 'village' && (
          <>
            {/* Fountain */}
            <div
              className="absolute"
              style={{
                left: 960,
                top: 760,
              }}
            >
              {/* Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-blue-400 text-xs whitespace-nowrap font-bold">
                Фонтан исцеления
              </div>
              <img
                src="/fountain.png"
                alt="Фонтан исцеления"
                className="cursor-pointer hover:brightness-110 transition-all"
                style={{
                  width: 80,
                  height: 80,
                  imageRendering: 'pixelated'
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
                left: 1660,
                top: 260,
              }}
            >
              {/* Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-blue-400 text-xs whitespace-nowrap font-bold">
                Вход в шахты
              </div>
              <img
                src="/mines_entrance.png"
                alt="Вход в шахты"
                className="cursor-pointer hover:brightness-110 transition-all"
                style={{
                  width: 80,
                  height: 80,
                  imageRendering: 'pixelated'
                }}
                title="Вход в заброшенные шахты"
                onClick={() => {
                  if (isNearPortal()) onPortalUse();
                }}
              />
              
              {/* E prompt when player is near */}
              {isNearPortal() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
            
            {/* Buildings near special NPCs */}
            {/* Mage Tower near Альтарис */}
            <div
              className="absolute"
              style={{
                left: 1160,
                top: 860,
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-purple-400 text-xs whitespace-nowrap font-bold">
                Башня мага
              </div>
              <img
                src="/house.png"
                alt="Башня мага"
                className="cursor-pointer hover:brightness-110 transition-all"
                style={{
                  width: 80,
                  height: 80,
                  imageRendering: 'pixelated',
                  filter: 'hue-rotate(240deg) saturate(1.5)'
                }}
                title="Башня мага"
              />
            </div>
            
            {/* Barracks near Guardian */}
            <div
              className="absolute"
              style={{
                left: 1200,
                top: 600,
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-red-400 text-xs whitespace-nowrap font-bold">
                Казарма
              </div>
              <img
                src="/house.png"
                alt="Казарма"
                className="cursor-pointer hover:brightness-110 transition-all"
                style={{
                  width: 80,
                  height: 80,
                  imageRendering: 'pixelated',
                  filter: 'hue-rotate(0deg) saturate(1.5)'
                }}
                title="Казарма"
              />
            </div>
            
            {/* Shooting Range near Scout */}
            <div
              className="absolute"
              style={{
                left: 660,
                top: 1160,
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-400 text-xs whitespace-nowrap font-bold">
                Стрельбище
              </div>
              <img
                src="/house.png"
                alt="Стрельбище"
                className="cursor-pointer hover:brightness-110 transition-all"
                style={{
                  width: 80,
                  height: 80,
                  imageRendering: 'pixelated',
                  filter: 'hue-rotate(120deg) saturate(1.5)'
                }}
                title="Стрельбище"
              />
            </div>
          </>
        )}
        
        {currentLocation === 'abandoned-mines' && (
          <>
            {/* Torches in mines */}
            {torchPositions.map((torch, index) => (
              <div
                key={`torch-${index}`}
                className="absolute z-40"
                style={{
                  left: torch.x - 8,
                  top: torch.y - 16,
                }}
              >
                <img 
                  src="/torch.png" 
                  alt="Torch" 
                  className="w-8 h-16 object-contain"
                />
              </div>
            ))}
            
            {/* Coal mine */}
            <div
              className="absolute"
              style={{
                left: mineCenters.coal.x - 20,
                top: mineCenters.coal.y - 20,
              }}
            >
              <img 
                src="/coal.png" 
                alt="Coal Mine" 
                className="w-10 h-10 pixelated cursor-pointer hover:brightness-110 transition-all"
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
                left: mineCenters.ore.x - 20,
                top: mineCenters.ore.y - 20,
              }}
            >
              <img 
                src="/ore_iron.png" 
                alt="Iron Ore Mine" 
                className="w-10 h-10 pixelated cursor-pointer hover:brightness-110 transition-all"
                title="Рудная жила"
              />
              
              {/* E prompt when player is near */}
              {isNearOreMine() && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  E
                </div>
              )}
            </div>
            
            {/* Treasure Chest */}
            {!isTreasureChestOpened && (
              <div
                className="absolute"
                style={{
                  left: 1925,
                  top: 15,
                }}
              >
                <img 
                  src="/treasure_chest.png" 
                  alt="Treasure Chest" 
                  className="w-12 h-12 pixelated cursor-pointer hover:brightness-110 transition-all"
                  title="Сундук с сокровищами"
                />
                
                {/* E prompt when player is near */}
                {isNearTreasureChest() && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                    E
                  </div>
                )}
              </div>
            )}
            
            {/* Return portal */}
            <div
              className="absolute"
              style={{
                left: mineCenters.portal.x - 20,
                top: mineCenters.portal.y - 20,
              }}
            >
              <img
                src="/mines_to_village.png"
                alt="Портал обратно в деревню"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  width: 40,
                  height: 40,
                  imageRendering: 'pixelated'
                }}
                title="Портал обратно в деревню"
                onClick={() => {
                  if (isNearPortal()) onPortalUse();
                }}
              />
              
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
        {currentLocation === 'village' && npcs.map(npc => {
          console.log(`Rendering NPC: ${npc.name} (${npc.type}), visible=${npc.visible}`);
          return (
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
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  // Check if this is a special NPC that requires conditions
                  if (npc.type === 'mage' || npc.type === 'scout' || npc.type === 'guardian') {
                    // Only allow interaction if the NPC is visible (conditions met)
                    if (!npc.visible) {
                      return; // Block interaction for invisible special NPCs
                    }
                  }
                  
                  if (isNearNPC(npc)) onNPCInteract(npc);
                }}
              >
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
          );
        })}

        {/* Render enemies only in abandoned mines */}
        {currentLocation === 'abandoned-mines' && enemies.map(enemy => {
          if (enemy.isDead) return null;
          
          return (
            <div
              key={enemy.id}
              className="absolute"
              style={{
                left: enemy.position.x - 16,
                top: enemy.position.y - 16,
              }}
            >
              {/* Enemy health bar */}
              {enemy.health < enemy.maxHealth && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 bg-gray-700 rounded-full overflow-hidden border border-gray-500">
                  <div 
                    className="h-1 bg-red-500 transition-all duration-300"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              )}
              
              {/* Enemy sprite */}
              <div className="relative cursor-pointer">
                {enemy.type === 'bat' ? (
                  <AnimatedBat
                    className="w-8 h-8 transition-all duration-200"
                    alt={enemy.name}
                    isAttacking={enemy.isAttacking}
                    direction={enemy.direction}
                  />
                ) : (
                  <AnimatedRat
                    alt={enemy.name}
                    direction={enemy.direction}
                    className={`w-8 h-8 transition-all duration-200 ${
                      enemy.isAttacking ? 'filter brightness-150 scale-110' : ''
                    }`}
                    style={{
                      imageRendering: 'pixelated',
                      filter: enemy.isAttacking ? 'brightness(1.5) saturate(1.2)' : 'none'
                    }}
                  />
                )}
                
                {/* Attack indicator */}
                {enemy.isAttacking && (
                  <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                )}
              </div>
            </div>
          );
        })}
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