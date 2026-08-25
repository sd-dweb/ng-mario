export enum MarioPower {
  SMALL = 'SMALL',
  SUPER = 'SUPER',
  FIRE = 'FIRE',
  STAR = 'STAR'
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1
}

export enum GameState {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STAGE_CLEAR = 'STAGE_CLEAR',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION_COIN = 3,
  QUESTION_MUSHROOM = 4,
  QUESTION_FLOWER = 5,
  QUESTION_STAR = 6,
  QUESTION_1UP = 7,
  SOLID_BLOCK = 8,
  HARD_BLOCK = 9,
  USED_BLOCK = 10,
  PIPE_TOP_LEFT = 11,
  PIPE_TOP_RIGHT = 12,
  PIPE_BODY_LEFT = 13,
  PIPE_BODY_RIGHT = 14,
  FLAG_POLE = 15,
  FLAG_TOP = 16,
  CASTLE_BRICK = 17,
  CASTLE_DOOR = 18,
  LAVA = 19,
  BRIDGE = 20,
  AXE = 21,
  UNDERGROUND_GROUND = 22,
  UNDERGROUND_BRICK = 23,
  MUSHROOM_STEM = 24,
  MUSHROOM_TOP_LEFT = 25,
  MUSHROOM_TOP_MID = 26,
  MUSHROOM_TOP_RIGHT = 27
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  gravity?: number;
  rotation?: number;
  rotationSpeed?: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  vy: number;
  alpha: number;
  life: number;
  color?: string;
}

export interface TileBouncing {
  col: number;
  row: number;
  tileType: TileType;
  offsetY: number;
  vy: number;
}

export interface LevelData {
  id: string;
  name: string;
  worldName: string;
  title?: string;
  description?: string;
  timeLimit: number;
  backgroundColor: string;
  theme: 'overworld' | 'underground' | 'athletic' | 'castle';
  width: number;
  height: number;
  tiles: number[][]; // [row][col]
  spawn: { x: number; y: number };
  flagpoleX: number;
  enemies: Array<{ type: 'goomba' | 'koopa' | 'piranha' | 'bowser'; x: number; y: number }>;
  warpPipes?: Array<{
    col: number;
    row: number;
    targetSublevel?: string;
    targetX?: number;
    targetY?: number;
  }>;
}

export interface LevelConfig {
  id: string;
  worldName: string;
  name: string;
  title: string;
  description: string;
  theme: 'overworld' | 'underground' | 'athletic' | 'castle';
  timeLimit: number;
  backgroundColor: string;
  icon: string;
  badge: string;
  generate: () => LevelData;
}

