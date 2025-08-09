interface MinesMapProps {
  mapWidth: number;
  mapHeight: number;
}

export const MinesMap = ({ mapWidth, mapHeight }: MinesMapProps) => {
  // Labyrinth maze layout based on the reference image
  // Each wall segment is represented as a styled div
  const wallStyle = {
    backgroundColor: '#8B7355', // Brownish color like in the reference
    position: 'absolute' as const,
    border: '2px solid #6B5B47',
    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)'
  };

  const CELL_SIZE = 32; // Size of each maze cell
  const WALL_THICKNESS = 8;

  return (
    <div className="absolute inset-0" style={{ width: mapWidth, height: mapHeight }}>
      {/* Outer walls */}
      <div style={{
        ...wallStyle,
        left: 0,
        top: 0,
        width: mapWidth,
        height: WALL_THICKNESS
      }} />
      <div style={{
        ...wallStyle,
        left: 0,
        top: mapHeight - WALL_THICKNESS,
        width: mapWidth,
        height: WALL_THICKNESS
      }} />
      <div style={{
        ...wallStyle,
        left: 0,
        top: 0,
        width: WALL_THICKNESS,
        height: mapHeight
      }} />
      <div style={{
        ...wallStyle,
        left: mapWidth - WALL_THICKNESS,
        top: 0,
        width: WALL_THICKNESS,
        height: mapHeight
      }} />

      {/* Horizontal walls - creating maze pattern like in reference */}
      {/* Top section complex pattern */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 2, top: CELL_SIZE * 2, width: CELL_SIZE * 6, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 10, top: CELL_SIZE * 2, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 16, top: CELL_SIZE * 2, width: CELL_SIZE * 6, height: WALL_THICKNESS }} />
      
      <div style={{ ...wallStyle, left: CELL_SIZE * 4, top: CELL_SIZE * 4, width: CELL_SIZE * 2, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 8, top: CELL_SIZE * 4, width: CELL_SIZE * 8, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 18, top: CELL_SIZE * 4, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />

      <div style={{ ...wallStyle, left: CELL_SIZE * 2, top: CELL_SIZE * 6, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 10, top: CELL_SIZE * 6, width: CELL_SIZE * 2, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 14, top: CELL_SIZE * 6, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 20, top: CELL_SIZE * 6, width: CELL_SIZE * 2, height: WALL_THICKNESS }} />

      {/* Middle section */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 6, top: CELL_SIZE * 8, width: CELL_SIZE * 6, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 16, top: CELL_SIZE * 8, width: CELL_SIZE * 6, height: WALL_THICKNESS }} />

      <div style={{ ...wallStyle, left: CELL_SIZE * 2, top: CELL_SIZE * 10, width: CELL_SIZE * 2, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 8, top: CELL_SIZE * 10, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 14, top: CELL_SIZE * 10, width: CELL_SIZE * 2, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 18, top: CELL_SIZE * 10, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />

      <div style={{ ...wallStyle, left: CELL_SIZE * 4, top: CELL_SIZE * 12, width: CELL_SIZE * 8, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 16, top: CELL_SIZE * 12, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />

      {/* Bottom section */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 2, top: CELL_SIZE * 14, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 10, top: CELL_SIZE * 14, width: CELL_SIZE * 6, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 18, top: CELL_SIZE * 14, width: CELL_SIZE * 4, height: WALL_THICKNESS }} />

      <div style={{ ...wallStyle, left: CELL_SIZE * 6, top: CELL_SIZE * 16, width: CELL_SIZE * 2, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 12, top: CELL_SIZE * 16, width: CELL_SIZE * 8, height: WALL_THICKNESS }} />

      {/* Vertical walls */}
      {/* Left section */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 2, top: CELL_SIZE * 2, width: WALL_THICKNESS, height: CELL_SIZE * 4 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 4, top: CELL_SIZE * 4, width: WALL_THICKNESS, height: CELL_SIZE * 6 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 6, top: CELL_SIZE * 2, width: WALL_THICKNESS, height: CELL_SIZE * 2 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 6, top: CELL_SIZE * 8, width: WALL_THICKNESS, height: CELL_SIZE * 4 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 8, top: CELL_SIZE * 6, width: WALL_THICKNESS, height: CELL_SIZE * 8 }} />

      {/* Center section */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 10, top: CELL_SIZE * 2, width: WALL_THICKNESS, height: CELL_SIZE * 4 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 12, top: CELL_SIZE * 8, width: WALL_THICKNESS, height: CELL_SIZE * 4 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 14, top: CELL_SIZE * 2, width: WALL_THICKNESS, height: CELL_SIZE * 8 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 16, top: CELL_SIZE * 4, width: WALL_THICKNESS, height: CELL_SIZE * 6 }} />

      {/* Right section */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 18, top: CELL_SIZE * 2, width: WALL_THICKNESS, height: CELL_SIZE * 4 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 20, top: CELL_SIZE * 6, width: WALL_THICKNESS, height: CELL_SIZE * 6 }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 22, top: CELL_SIZE * 2, width: WALL_THICKNESS, height: CELL_SIZE * 8 }} />

      {/* Small inner chambers and connecting passages */}
      <div style={{ ...wallStyle, left: CELL_SIZE * 5, top: CELL_SIZE * 5, width: CELL_SIZE, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 9, top: CELL_SIZE * 7, width: CELL_SIZE, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 13, top: CELL_SIZE * 9, width: CELL_SIZE, height: WALL_THICKNESS }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 17, top: CELL_SIZE * 11, width: CELL_SIZE, height: WALL_THICKNESS }} />

      <div style={{ ...wallStyle, left: CELL_SIZE * 7, top: CELL_SIZE * 5, width: WALL_THICKNESS, height: CELL_SIZE }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 11, top: CELL_SIZE * 7, width: WALL_THICKNESS, height: CELL_SIZE }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 15, top: CELL_SIZE * 9, width: WALL_THICKNESS, height: CELL_SIZE }} />
      <div style={{ ...wallStyle, left: CELL_SIZE * 19, top: CELL_SIZE * 11, width: WALL_THICKNESS, height: CELL_SIZE }} />

      {/* Central chamber area - open space */}
      <div style={{
        position: 'absolute',
        left: CELL_SIZE * 11,
        top: CELL_SIZE * 11,
        width: CELL_SIZE * 2,
        height: CELL_SIZE * 2,
        backgroundColor: 'rgba(139, 115, 85, 0.3)',
        border: '1px solid #6B5B47',
        borderRadius: '50%'
      }} />
    </div>
  );
};