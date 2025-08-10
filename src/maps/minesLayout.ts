export type Rect = { x: number; y: number; w: number; h: number };

export const WALL_THICKNESS = 24;

// Obstacles for the mines labyrinth. Coordinates are in world pixels.
export const minesObstacles: Rect[] = [
  // Entry barrier (left wall) with a single opening aligned to the main corridor
  { x: 240, y: 200, w: WALL_THICKNESS, h: 160 }, // upper segment
  { x: 240, y: 440, w: WALL_THICKNESS, h: 460 }, // lower segment

  // Single corridor from entrance (one path)
  { x: 240, y: 340, w: 460, h: 40 }, // corridor top wall up to hall1
  { x: 240, y: 420, w: 460, h: 40 }, // corridor bottom wall up to hall1

  // Hall 1 (large room) roughly center-left, with 3 exits: left, right, bottom
  // Surrounding walls (with intentional gaps)
  { x: 700, y: 300, w: 340, h: WALL_THICKNESS }, // top wall (no gap)
  { x: 700, y: 540, w: 140, h: WALL_THICKNESS }, // bottom wall left segment
  { x: 940, y: 540, w: 100, h: WALL_THICKNESS }, // bottom wall right segment (gap in middle)
  { x: 700, y: 300, w: WALL_THICKNESS, h: 80 }, // left wall upper
  { x: 700, y: 460, w: WALL_THICKNESS, h: 80 }, // left wall lower (gap in middle)
  { x: 1040, y: 300, w: WALL_THICKNESS, h: 80 }, // right wall upper
  { x: 1040, y: 460, w: WALL_THICKNESS, h: 80 }, // right wall lower (gap in middle)

  // Corridor from Hall 1 (bottom exit) heading towards Hall 2
  // Vertical shaft down from Hall 1 bottom gap
  { x: 860, y: 540, w: WALL_THICKNESS, h: 120 }, // left side of vertical corridor
  { x: 940, y: 540, w: WALL_THICKNESS, h: 120 }, // right side of vertical corridor
  // Horizontal passage to the right, aligning with Hall 2 left gap
  { x: 940, y: 620, w: 140, h: WALL_THICKNESS }, // horizontal top wall
  { x: 940, y: 700, w: 140, h: WALL_THICKNESS }, // horizontal bottom wall

  // Hall 2 (large room) lower-right, with 3 exits: left, right, bottom
  { x: 1080, y: 540, w: 340, h: WALL_THICKNESS }, // top wall (no gap)
  { x: 1080, y: 800, w: 100, h: WALL_THICKNESS }, // bottom wall left segment
  { x: 1300, y: 800, w: 120, h: WALL_THICKNESS }, // bottom wall right segment (gap in middle)
  { x: 1080, y: 540, w: WALL_THICKNESS, h: 80 }, // left wall upper
  { x: 1080, y: 700, w: WALL_THICKNESS, h: 80 }, // left wall lower (gap in middle)
  { x: 1420, y: 540, w: WALL_THICKNESS, h: 80 }, // right wall upper
  { x: 1420, y: 700, w: WALL_THICKNESS, h: 80 }, // right wall lower (gap in middle)

  // Four small dead ends (short branches that end with a cap)
  // Dead end 1: Up branch near entrance corridor
  { x: 340, y: 300, w: WALL_THICKNESS, h: 60 }, // left side
  { x: 380, y: 300, w: WALL_THICKNESS, h: 60 }, // right side
  { x: 340, y: 300, w: 64, h: WALL_THICKNESS }, // cap

  // Dead end 2: Down branch near entrance corridor
  { x: 400, y: 420, w: WALL_THICKNESS, h: 60 }, // left side
  { x: 440, y: 420, w: WALL_THICKNESS, h: 60 }, // right side
  { x: 400, y: 480, w: 64, h: WALL_THICKNESS }, // cap

  // Dead end 3: Left branch off the vertical corridor between halls
  { x: 820, y: 580, w: 40, h: WALL_THICKNESS }, // top wall of branch
  { x: 820, y: 620, w: 40, h: WALL_THICKNESS }, // bottom wall of branch
  { x: 820, y: 580, w: WALL_THICKNESS, h: 60 }, // cap (left side)

  // Dead end 4: Down branch off the horizontal corridor towards Hall 2
  { x: 1000, y: 700, w: WALL_THICKNESS, h: 60 }, // left side
  { x: 1060, y: 700, w: WALL_THICKNESS, h: 60 }, // right side
  { x: 1000, y: 760, w: 64, h: WALL_THICKNESS }, // cap
];
