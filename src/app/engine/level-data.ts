import { LevelData, TileType } from './types';

function createBlankGrid(cols: number, rows = 15): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols).fill(TileType.EMPTY);
  }
  return grid;
}

function fillGround(grid: number[][], startCol: number, endCol: number, groundTile = TileType.GROUND): void {
  for (let c = startCol; c <= endCol; c++) {
    grid[13][c] = groundTile;
    grid[14][c] = groundTile;
  }
}

function placePipe(grid: number[][], col: number, height: number): void {
  const topRow = 13 - height;
  grid[topRow][col] = TileType.PIPE_TOP_LEFT;
  grid[topRow][col + 1] = TileType.PIPE_TOP_RIGHT;
  for (let r = topRow + 1; r < 13; r++) {
    grid[r][col] = TileType.PIPE_BODY_LEFT;
    grid[r][col + 1] = TileType.PIPE_BODY_RIGHT;
  }
}

function placeFlagpole(grid: number[][], col: number): void {
  grid[2][col] = TileType.FLAG_TOP;
  for (let r = 3; r <= 12; r++) {
    grid[r][col] = TileType.FLAG_POLE;
  }
  grid[12][col] = TileType.SOLID_BLOCK;
}

function placeCastle(grid: number[][], col: number): void {
  for (let r = 8; r <= 12; r++) {
    for (let c = col; c <= col + 4; c++) {
      grid[r][c] = TileType.CASTLE_BRICK;
    }
  }
  grid[12][col + 2] = TileType.CASTLE_DOOR;
  grid[11][col + 2] = TileType.CASTLE_DOOR;
}

// ---------------- LEVEL 1-1 (Classic Overworld) ----------------
export function generateLevel1_1(): LevelData {
  const cols = 210;
  const grid = createBlankGrid(cols);

  // Ground with pits
  fillGround(grid, 0, 68);
  fillGround(grid, 71, 85);
  fillGround(grid, 88, 152);
  fillGround(grid, 155, 209);

  // Intro blocks
  grid[9][16] = TileType.QUESTION_COIN;
  grid[9][20] = TileType.BRICK;
  grid[9][21] = TileType.QUESTION_MUSHROOM;
  grid[9][22] = TileType.BRICK;
  grid[9][23] = TileType.QUESTION_COIN;
  grid[9][24] = TileType.BRICK;
  grid[5][22] = TileType.QUESTION_COIN;

  // Pipes
  placePipe(grid, 28, 2);
  placePipe(grid, 38, 3);
  placePipe(grid, 46, 4);
  placePipe(grid, 57, 4);

  // Hidden 1-up block
  grid[9][64] = TileType.QUESTION_1UP;

  // Mid-stage platforms
  grid[9][77] = TileType.BRICK;
  grid[9][78] = TileType.QUESTION_FLOWER;
  grid[9][79] = TileType.BRICK;

  for (let c = 80; c <= 87; c++) {
    grid[5][c] = TileType.BRICK;
  }
  grid[5][83] = TileType.QUESTION_STAR;

  grid[9][91] = TileType.BRICK;
  grid[9][92] = TileType.BRICK;
  grid[9][93] = TileType.QUESTION_COIN;
  grid[9][94] = TileType.QUESTION_COIN;

  // Staircases before flagpole
  const stairStart = 134;
  for (let step = 0; step < 4; step++) {
    for (let r = 12 - step; r <= 12; r++) {
      grid[r][stairStart + step] = TileType.SOLID_BLOCK;
    }
  }
  for (let step = 0; step < 4; step++) {
    for (let r = 12 - (3 - step); r <= 12; r++) {
      grid[r][stairStart + 4 + step] = TileType.SOLID_BLOCK;
    }
  }

  // Giant staircase
  const giantStair = 180;
  for (let step = 0; step < 8; step++) {
    for (let r = 12 - step; r <= 12; r++) {
      grid[r][giantStair + step] = TileType.SOLID_BLOCK;
    }
  }

  // Flagpole & Castle
  placeFlagpole(grid, 198);
  placeCastle(grid, 202);

  const enemies: LevelData['enemies'] = [
    { type: 'goomba', x: 22 * 16, y: 192 },
    { type: 'goomba', x: 40 * 16, y: 192 },
    { type: 'goomba', x: 51 * 16, y: 192 },
    { type: 'goomba', x: 52.5 * 16, y: 192 },
    { type: 'koopa', x: 60 * 16, y: 184 },
    { type: 'goomba', x: 80 * 16, y: 64 },
    { type: 'goomba', x: 82 * 16, y: 64 },
    { type: 'koopa', x: 106 * 16, y: 184 },
    { type: 'goomba', x: 114 * 16, y: 192 },
    { type: 'goomba', x: 116 * 16, y: 192 },
    { type: 'goomba', x: 125 * 16, y: 192 },
    { type: 'goomba', x: 127 * 16, y: 192 },
    { type: 'koopa', x: 160 * 16, y: 184 }
  ];

  return {
    id: '1-1',
    name: 'World 1-1',
    worldName: '1-1',
    timeLimit: 400,
    backgroundColor: '#5c94fc',
    theme: 'overworld',
    width: cols * 16,
    height: 240,
    tiles: grid,
    spawn: { x: 40, y: 190 },
    flagpoleX: 198 * 16,
    enemies
  };
}

// ---------------- LEVEL 1-2 (Underground Cavern) ----------------
export function generateLevel1_2(): LevelData {
  const cols = 190;
  const grid = createBlankGrid(cols);

  // Blue brick ceiling
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.UNDERGROUND_BRICK;
    grid[1][c] = TileType.UNDERGROUND_BRICK;
  }

  // Underground floor with gaps
  fillGround(grid, 0, 40, TileType.UNDERGROUND_GROUND);
  fillGround(grid, 44, 100, TileType.UNDERGROUND_GROUND);
  fillGround(grid, 105, 150, TileType.UNDERGROUND_GROUND);
  fillGround(grid, 155, 189, TileType.UNDERGROUND_GROUND);

  // Pipe entrance
  placePipe(grid, 10, 3);
  placePipe(grid, 20, 4);

  // Underground brick platforms & mystery items
  for (let c = 12; c <= 18; c++) grid[9][c] = TileType.UNDERGROUND_BRICK;
  grid[9][15] = TileType.QUESTION_MUSHROOM;

  for (let c = 26; c <= 35; c++) grid[8][c] = TileType.UNDERGROUND_BRICK;
  grid[8][28] = TileType.QUESTION_COIN;
  grid[8][32] = TileType.QUESTION_COIN;

  for (let c = 50; c <= 65; c++) grid[6][c] = TileType.UNDERGROUND_BRICK;
  grid[6][55] = TileType.QUESTION_STAR;
  grid[6][60] = TileType.QUESTION_FLOWER;

  // High steps
  for (let step = 0; step < 5; step++) {
    for (let r = 12 - step; r <= 12; r++) {
      grid[r][130 + step] = TileType.UNDERGROUND_BRICK;
    }
  }

  // Pipe to exit
  placePipe(grid, 175, 4);
  placeFlagpole(grid, 182);

  const enemies: LevelData['enemies'] = [
    { type: 'goomba', x: 15 * 16, y: 192 },
    { type: 'goomba', x: 28 * 16, y: 110 },
    { type: 'koopa', x: 55 * 16, y: 70 },
    { type: 'goomba', x: 70 * 16, y: 192 },
    { type: 'goomba', x: 72 * 16, y: 192 },
    { type: 'koopa', x: 115 * 16, y: 184 },
    { type: 'goomba', x: 120 * 16, y: 192 }
  ];

  return {
    id: '1-2',
    name: 'World 1-2',
    worldName: '1-2',
    timeLimit: 400,
    backgroundColor: '#000000',
    theme: 'underground',
    width: cols * 16,
    height: 240,
    tiles: grid,
    spawn: { x: 40, y: 190 },
    flagpoleX: 182 * 16,
    enemies
  };
}

// ---------------- LEVEL 1-3 (Athletic Treetops) ----------------
export function generateLevel1_3(): LevelData {
  const cols = 180;
  const grid = createBlankGrid(cols);

  // Mushroom platforms & sky leaps
  fillGround(grid, 0, 15);
  fillGround(grid, 160, 179);

  // Floating platforms
  const addPlatform = (startC: number, len: number, r: number) => {
    for (let c = startC; c < startC + len; c++) {
      grid[r][c] = TileType.BRICK;
    }
  };

  addPlatform(20, 5, 10);
  addPlatform(30, 4, 8);
  addPlatform(40, 6, 6);
  grid[6][42] = TileType.QUESTION_MUSHROOM;

  addPlatform(52, 4, 9);
  addPlatform(62, 5, 7);
  grid[7][64] = TileType.QUESTION_COIN;

  addPlatform(74, 6, 5);
  grid[5][76] = TileType.QUESTION_STAR;

  addPlatform(86, 5, 8);
  addPlatform(98, 4, 6);
  addPlatform(110, 6, 9);
  grid[9][112] = TileType.QUESTION_FLOWER;

  addPlatform(124, 7, 7);
  addPlatform(138, 5, 9);
  addPlatform(148, 6, 11);

  placeFlagpole(grid, 168);
  placeCastle(grid, 172);

  const enemies: LevelData['enemies'] = [
    { type: 'koopa', x: 22 * 16, y: 140 },
    { type: 'koopa', x: 42 * 16, y: 70 },
    { type: 'goomba', x: 63 * 16, y: 90 },
    { type: 'koopa', x: 88 * 16, y: 100 },
    { type: 'goomba', x: 126 * 16, y: 90 },
    { type: 'koopa', x: 149 * 16, y: 150 }
  ];

  return {
    id: '1-3',
    name: 'World 1-3',
    worldName: '1-3',
    timeLimit: 300,
    backgroundColor: '#5c94fc',
    theme: 'athletic',
    width: cols * 16,
    height: 240,
    tiles: grid,
    spawn: { x: 40, y: 190 },
    flagpoleX: 168 * 16,
    enemies
  };
}

// ---------------- LEVEL 1-4 (Bowser's Castle) ----------------
export function generateLevel1_4(): LevelData {
  const cols = 170;
  const grid = createBlankGrid(cols);

  // Castle stone ceiling
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.CASTLE_BRICK;
    grid[1][c] = TileType.CASTLE_BRICK;
  }

  // Castle floors & Lava pits
  fillGround(grid, 0, 30, TileType.CASTLE_BRICK);
  // Lava pit 1
  for (let c = 31; c <= 40; c++) grid[14][c] = TileType.LAVA;
  fillGround(grid, 41, 75, TileType.CASTLE_BRICK);
  // Lava pit 2
  for (let c = 76; c <= 85; c++) grid[14][c] = TileType.LAVA;
  fillGround(grid, 86, 120, TileType.CASTLE_BRICK);

  // Bowser bridge over giant lava pit
  for (let c = 121; c <= 150; c++) grid[14][c] = TileType.LAVA;
  for (let c = 125; c <= 145; c++) grid[11][c] = TileType.BRIDGE;

  // The Golden Axe to drop bridge
  grid[10][146] = TileType.AXE;

  // Princess Peach room floor
  fillGround(grid, 147, 169, TileType.CASTLE_BRICK);

  // Obstacles & power-ups
  grid[8][15] = TileType.QUESTION_MUSHROOM;
  grid[8][60] = TileType.QUESTION_FLOWER;
  grid[6][100] = TileType.QUESTION_STAR;

  const enemies: LevelData['enemies'] = [
    { type: 'goomba', x: 20 * 16, y: 192 },
    { type: 'koopa', x: 50 * 16, y: 192 },
    { type: 'goomba', x: 95 * 16, y: 192 },
    { type: 'bowser', x: 138 * 16, y: 140 }
  ];

  return {
    id: '1-4',
    name: 'World 1-4',
    worldName: '1-4',
    timeLimit: 300,
    backgroundColor: '#000000',
    theme: 'castle',
    width: cols * 16,
    height: 240,
    tiles: grid,
    spawn: { x: 40, y: 190 },
    flagpoleX: 146 * 16, // Axe position
    enemies
  };
}

export const ALL_LEVELS = [
  generateLevel1_1,
  generateLevel1_2,
  generateLevel1_3,
  generateLevel1_4
];
