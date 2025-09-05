import grassTexture from '@/assets/grass-texture.png';

interface DarkForestMapProps {
  mapWidth: number;
  mapHeight: number;
}

export const DarkForestMap = ({ mapWidth, mapHeight }: DarkForestMapProps) => {
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