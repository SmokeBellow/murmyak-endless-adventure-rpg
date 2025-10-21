import { Enemy } from '@/types/gameTypes';

interface DarkForestMapProps {
  mapWidth: number;
  mapHeight: number;
  enemies: Enemy[];
}

export const DarkForestMap = ({ mapWidth, mapHeight, enemies }: DarkForestMapProps) => {

  return (
    <div 
      className="absolute inset-0" 
      style={{ 
        width: mapWidth, 
        height: mapHeight,
        backgroundColor: '#000000'
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