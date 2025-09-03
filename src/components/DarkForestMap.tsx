interface DarkForestMapProps {
  mapWidth: number;
  mapHeight: number;
}

export const DarkForestMap = ({ mapWidth, mapHeight }: DarkForestMapProps) => {
  // Dark forest obstacles - more trees and rocks
  const forestObstacles = [
    // Border trees
    { x: 0, y: 0, w: 2000, h: 100 }, // Top border
    { x: 0, y: 0, w: 100, h: 2000 }, // Left border
    { x: 1900, y: 0, w: 100, h: 2000 }, // Right border
    { x: 0, y: 1900, w: 2000, h: 100 }, // Bottom border
    
    // Entrance path opening - top center for return to village
    { x: 900, y: 0, w: 200, h: 0 }, // Clear entrance at top
    
    // Row 1: Top area (y: 180-300)
    { x: 200, y: 200, w: 80, h: 80 },
    { x: 320, y: 180, w: 70, h: 70 },
    { x: 450, y: 220, w: 85, h: 85 },
    { x: 580, y: 190, w: 75, h: 75 },
    { x: 720, y: 240, w: 80, h: 80 },
    { x: 850, y: 200, w: 65, h: 65 },
    { x: 1150, y: 180, w: 90, h: 90 },
    { x: 1280, y: 220, w: 75, h: 75 },
    { x: 1420, y: 190, w: 80, h: 80 },
    { x: 1560, y: 240, w: 70, h: 70 },
    { x: 1720, y: 200, w: 85, h: 85 },
    
    // Row 2: Upper middle (y: 350-480)
    { x: 150, y: 380, w: 75, h: 75 },
    { x: 280, y: 350, w: 80, h: 80 },
    { x: 420, y: 400, w: 70, h: 70 },
    { x: 540, y: 360, w: 85, h: 85 },
    { x: 680, y: 420, w: 75, h: 75 },
    { x: 820, y: 380, w: 80, h: 80 },
    { x: 960, y: 350, w: 90, h: 90 },
    { x: 1120, y: 400, w: 70, h: 70 },
    { x: 1280, y: 370, w: 85, h: 85 },
    { x: 1440, y: 420, w: 75, h: 75 },
    { x: 1600, y: 350, w: 80, h: 80 },
    { x: 1750, y: 390, w: 65, h: 65 },
    
    // Row 3: Middle area (y: 550-680)
    { x: 180, y: 580, w: 80, h: 80 },
    { x: 320, y: 550, w: 75, h: 75 },
    { x: 460, y: 600, w: 85, h: 85 },
    { x: 600, y: 570, w: 70, h: 70 },
    { x: 740, y: 620, w: 80, h: 80 },
    { x: 880, y: 580, w: 90, h: 90 },
    { x: 1040, y: 550, w: 75, h: 75 },
    { x: 1180, y: 600, w: 85, h: 85 },
    { x: 1340, y: 570, w: 80, h: 80 },
    { x: 1480, y: 620, w: 70, h: 70 },
    { x: 1620, y: 580, w: 85, h: 85 },
    { x: 1780, y: 550, w: 75, h: 75 },
    
    // Row 4: Lower middle (y: 750-880)
    { x: 120, y: 780, w: 85, h: 85 },
    { x: 250, y: 750, w: 80, h: 80 },
    { x: 380, y: 800, w: 70, h: 70 },
    { x: 520, y: 770, w: 85, h: 85 },
    { x: 660, y: 820, w: 75, h: 75 },
    { x: 800, y: 780, w: 80, h: 80 },
    { x: 940, y: 750, w: 90, h: 90 },
    { x: 1100, y: 800, w: 75, h: 75 },
    { x: 1240, y: 770, w: 85, h: 85 },
    { x: 1380, y: 820, w: 70, h: 70 },
    { x: 1520, y: 780, w: 80, h: 80 },
    { x: 1660, y: 750, w: 85, h: 85 },
    { x: 1820, y: 800, w: 75, h: 75 },
    
    // Row 5: Center area (y: 950-1080)
    { x: 200, y: 980, w: 75, h: 75 },
    { x: 340, y: 950, w: 80, h: 80 },
    { x: 480, y: 1000, w: 85, h: 85 },
    { x: 620, y: 970, w: 70, h: 70 },
    { x: 760, y: 1020, w: 80, h: 80 },
    { x: 900, y: 980, w: 75, h: 75 },
    { x: 1060, y: 950, w: 90, h: 90 },
    { x: 1200, y: 1000, w: 85, h: 85 },
    { x: 1340, y: 970, w: 80, h: 80 },
    { x: 1480, y: 1020, w: 75, h: 75 },
    { x: 1620, y: 980, w: 85, h: 85 },
    { x: 1780, y: 950, w: 70, h: 70 },
    
    // Row 6: Lower area (y: 1150-1280)
    { x: 160, y: 1180, w: 80, h: 80 },
    { x: 300, y: 1150, w: 85, h: 85 },
    { x: 440, y: 1200, w: 75, h: 75 },
    { x: 580, y: 1170, w: 80, h: 80 },
    { x: 720, y: 1220, w: 85, h: 85 },
    { x: 860, y: 1180, w: 70, h: 70 },
    { x: 1020, y: 1150, w: 90, h: 90 },
    { x: 1160, y: 1200, w: 75, h: 75 },
    { x: 1300, y: 1170, w: 85, h: 85 },
    { x: 1440, y: 1220, w: 80, h: 80 },
    { x: 1580, y: 1180, w: 75, h: 75 },
    { x: 1720, y: 1150, w: 85, h: 85 },
    
    // Row 7: Bottom area (y: 1350-1480)
    { x: 220, y: 1380, w: 85, h: 85 },
    { x: 360, y: 1350, w: 80, h: 80 },
    { x: 500, y: 1400, w: 75, h: 75 },
    { x: 640, y: 1370, w: 85, h: 85 },
    { x: 780, y: 1420, w: 80, h: 80 },
    { x: 920, y: 1380, w: 70, h: 70 },
    { x: 1080, y: 1350, w: 90, h: 90 },
    { x: 1220, y: 1400, w: 75, h: 75 },
    { x: 1360, y: 1370, w: 85, h: 85 },
    { x: 1500, y: 1420, w: 80, h: 80 },
    { x: 1640, y: 1380, w: 75, h: 75 },
    { x: 1780, y: 1350, w: 85, h: 85 },
    
    // Row 8: Near bottom (y: 1550-1680)
    { x: 180, y: 1580, w: 80, h: 80 },
    { x: 320, y: 1550, w: 75, h: 75 },
    { x: 460, y: 1600, w: 85, h: 85 },
    { x: 600, y: 1570, w: 80, h: 80 },
    { x: 740, y: 1620, w: 75, h: 75 },
    { x: 880, y: 1580, w: 90, h: 90 },
    { x: 1040, y: 1550, w: 85, h: 85 },
    { x: 1180, y: 1600, w: 80, h: 80 },
    { x: 1320, y: 1570, w: 75, h: 75 },
    { x: 1460, y: 1620, w: 85, h: 85 },
    { x: 1600, y: 1580, w: 80, h: 80 },
    { x: 1740, y: 1550, w: 75, h: 75 },
    
    // Additional scattered trees for density
    { x: 250, y: 470, w: 60, h: 60 },
    { x: 700, y: 330, w: 65, h: 65 },
    { x: 1300, y: 450, w: 70, h: 70 },
    { x: 450, y: 680, w: 65, h: 65 },
    { x: 1050, y: 720, w: 70, h: 70 },
    { x: 350, y: 1050, w: 65, h: 65 },
    { x: 1150, y: 1120, w: 70, h: 70 },
    { x: 650, y: 1300, w: 65, h: 65 },
    { x: 1400, y: 1250, w: 70, h: 70 },
    { x: 800, y: 1500, w: 65, h: 65 },
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
        backgroundColor: '#0a1f12',
        backgroundImage: `
          url(/grass.png),
          radial-gradient(circle at 500px 500px, rgba(40, 20, 10, 0.3) 0%, transparent 200px),
          radial-gradient(circle at 300px 800px, rgba(20, 40, 20, 0.2) 0%, transparent 150px),
          radial-gradient(circle at 800px 300px, rgba(20, 40, 20, 0.2) 0%, transparent 150px)
        `,
        backgroundSize: '256px 256px, 400px 400px, 300px 300px, 300px 300px',
        backgroundRepeat: 'repeat, no-repeat, no-repeat, no-repeat',
        filter: 'brightness(0.4) contrast(1.1) hue-rotate(20deg)'
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
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10, 31, 18, 0.4) 70%)',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};