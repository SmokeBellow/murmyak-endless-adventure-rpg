interface MinesMapProps {
  mapWidth: number;
  mapHeight: number;
}

import { minesObstacles } from '@/maps/minesLayout';

export const MinesMap = ({ mapWidth, mapHeight }: MinesMapProps) => {
  // Visual style for walls
  const wallStyle = {
    backgroundColor: '#8B7355', // earthy wall color
    position: 'absolute' as const,
    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.35)'
  } as const;

  return (
    <div className="absolute inset-0" style={{ width: mapWidth, height: mapHeight }}>
      {/* Render all obstacle rectangles */}
      {minesObstacles.map((r, idx) => (
        <div
          key={idx}
          style={{
            ...wallStyle,
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
          }}
        />
      ))}

      {/* Optional: subtle floor accents for halls/corridors (purely visual) */}
      <div
        style={{
          position: 'absolute',
          left: 680,
          top: 300,
          width: 380,
          height: 264,
          background: 'rgba(60,45,35,0.08)',
          border: '1px dashed rgba(107,91,71,0.4)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1060,
          top: 540,
          width: 380,
          height: 284,
          background: 'rgba(60,45,35,0.08)',
          border: '1px dashed rgba(107,91,71,0.4)'
        }}
      />
    </div>
  );
};
