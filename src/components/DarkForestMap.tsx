import grassTexture from '@/assets/grass-texture.png';
import { Enemy } from '@/types/gameTypes';

interface DarkForestMapProps {
  mapWidth: number;
  mapHeight: number;
  enemies: Enemy[];
}

export const DarkForestMap = ({ mapWidth, mapHeight, enemies }: DarkForestMapProps) => {
  // Dark forest obstacles - trees and rocks
  const forestObstacles = [
    // Border trees
    { x: 0, y: 0, w: 2000, h: 100 }, // Top border
    { x: 0, y: 0, w: 100, h: 2000 }, // Left border
    { x: 1900, y: 0, w: 100, h: 2000 }, // Right border
    { x: 0, y: 1900, w: 2000, h: 100 }, // Bottom border
    
    // Entrance path opening - top center for return to village
    { x: 900, y: 0, w: 200, h: 0 }, // Clear entrance at top
    
    // Scattered trees in forest
    { x: 200, y: 200, w: 80, h: 80 },
    { x: 350, y: 180, w: 60, h: 60 },
    { x: 450, y: 300, w: 70, h: 70 },
    { x: 600, y: 250, w: 90, h: 90 },
    { x: 800, y: 200, w: 75, h: 75 },
    { x: 1200, y: 180, w: 85, h: 85 },
    { x: 1400, y: 280, w: 65, h: 65 },
    { x: 1600, y: 220, w: 80, h: 80 },
    
    { x: 150, y: 500, w: 70, h: 70 },
    { x: 300, y: 450, w: 80, h: 80 },
    { x: 500, y: 400, w: 90, h: 90 },
    { x: 750, y: 480, w: 75, h: 75 },
    { x: 1000, y: 420, w: 85, h: 85 },
    { x: 1250, y: 470, w: 70, h: 70 },
    { x: 1500, y: 450, w: 80, h: 80 },
    { x: 1750, y: 500, w: 65, h: 65 },
    
    { x: 250, y: 800, w: 85, h: 85 },
    { x: 400, y: 750, w: 70, h: 70 },
    { x: 650, y: 800, w: 80, h: 80 },
    { x: 900, y: 750, w: 90, h: 90 },
    { x: 1150, y: 780, w: 75, h: 75 },
    { x: 1400, y: 720, w: 85, h: 85 },
    { x: 1650, y: 800, w: 70, h: 70 },
    
    { x: 180, y: 1200, w: 80, h: 80 },
    { x: 380, y: 1150, w: 75, h: 75 },
    { x: 580, y: 1200, w: 85, h: 85 },
    { x: 780, y: 1180, w: 70, h: 70 },
    { x: 1080, y: 1220, w: 80, h: 80 },
    { x: 1280, y: 1150, w: 90, h: 90 },
    { x: 1480, y: 1200, w: 75, h: 75 },
    { x: 1680, y: 1180, w: 65, h: 65 },
    
    { x: 300, y: 1500, w: 70, h: 70 },
    { x: 500, y: 1480, w: 85, h: 85 },
    { x: 700, y: 1520, w: 80, h: 80 },
    { x: 1000, y: 1500, w: 75, h: 75 },
    { x: 1200, y: 1480, w: 90, h: 90 },
    { x: 1400, y: 1520, w: 70, h: 70 },
    { x: 1600, y: 1500, w: 85, h: 85 },
  ];

  // Dark forest style for trees
  const treeStyle = {
    backgroundColor: '#1a3d1a',
    backgroundImage: 'radial-gradient(circle at 30% 30%, #2d5a2d 0%, #1a3d1a 50%, #0f2b0f 100%)',
    borderRadius: '50%',
    position: 'absolute' as const,
    boxShadow: '0 4px 8px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,0,0,0.3)',
    border: '2px solid #0f2b0f',
  };

  return (
    <div 
      className="absolute inset-0" 
      style={{ 
        width: mapWidth, 
        height: mapHeight,
        backgroundColor: '#0d2818',
        backgroundImage: `
          radial-gradient(circle at 25% 25%, #1a3d2a 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, #0f2b1a 0%, transparent 50%),
          url(${grassTexture})
        `,
        backgroundSize: '300px 300px, 400px 400px, 128px 128px',
        backgroundRepeat: 'repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Return portal to village */}
      <div
        className="absolute cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          left: 950,
          top: 50,
          width: 100,
          height: 50,
          backgroundColor: '#4a90e2',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
          border: '2px solid #357abd',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
        onClick={() => {
          const event = new CustomEvent('portalUse');
          window.dispatchEvent(event);
        }}
      >
        В деревню
      </div>

      {/* Render forest obstacles (trees) */}
      {forestObstacles.map((obstacle, idx) => (
        <div
          key={idx}
          style={{
            ...treeStyle,
            left: obstacle.x,
            top: obstacle.y,
            width: obstacle.w,
            height: obstacle.h,
          }}
        />
      ))}

      {/* Render enemies */}
      {enemies.map(enemy => {
        if (enemy.isDead) return null;
        
        let enemyStyle = {};
        let enemyContent = '';
        
        if (enemy.type === 'wolf') {
          enemyStyle = {
            backgroundColor: '#2a2a2a',
            backgroundImage: 'radial-gradient(circle at 30% 30%, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
            borderRadius: '50% 60% 50% 40%',
            border: '2px solid #1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.8), inset 0 0 6px rgba(255,0,0,0.3)'
          };
          enemyContent = '🐺';
        } else if (enemy.type === 'spirit') {
          enemyStyle = {
            backgroundColor: 'rgba(100, 200, 100, 0.6)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(150, 255, 150, 0.8) 0%, rgba(100, 200, 100, 0.4) 100%)',
            borderRadius: '50%',
            border: '2px solid rgba(0, 255, 0, 0.5)',
            boxShadow: '0 0 15px rgba(0, 255, 0, 0.6)',
            animation: 'pulse 2s infinite'
          };
          enemyContent = '👻';
        } else if (enemy.type === 'spider') {
          enemyStyle = {
            backgroundColor: '#1a0f0a',
            backgroundImage: 'radial-gradient(circle at 30% 30%, #3a1f1a 0%, #1a0f0a 50%, #0a0505 100%)',
            borderRadius: '50% 40% 60% 50%',
            border: '2px solid #0a0505',
            boxShadow: '0 4px 12px rgba(0,0,0,0.9), inset 0 0 8px rgba(139, 69, 19, 0.4)'
          };
          enemyContent = '🕷️';
        }
        
        return (
          <div
            key={enemy.id}
            style={{
              position: 'absolute',
              left: enemy.position.x - 20,
              top: enemy.position.y - 20,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 10,
              ...enemyStyle
            }}
          >
            {enemyContent}
            {/* Health bar */}
            {enemy.health < enemy.maxHealth && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 30,
                  height: 4,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderRadius: 2,
                  border: '1px solid #333'
                }}
              >
                <div
                  style={{
                    width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                    height: '100%',
                    backgroundColor: '#ff4444',
                    borderRadius: 1
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Atmospheric fog effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(13, 40, 24, 0.3) 70%)',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};