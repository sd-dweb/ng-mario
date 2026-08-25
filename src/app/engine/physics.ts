import { FloatingText, LevelData, MarioPower, Particle, TileBouncing, TileType } from './types';
import { Bowser, BowserFire, Entity, Fireball, Goomba, Koopa, Mario, PiranhaPlant, PowerUpItem } from './entities';

export class PhysicsEngine {
  static readonly GRAVITY = 950;
  static readonly MAX_FALL_SPEED = 400;
  static readonly MARIO_ACCEL = 400;
  static readonly MARIO_RUN_ACCEL = 650;
  static readonly MARIO_MAX_WALK = 110;
  static readonly MARIO_MAX_RUN = 180;
  static readonly MARIO_FRICTION = 380;
  static readonly MARIO_JUMP_IMPULSE = -310;
  static readonly MARIO_JUMP_HOLD_ACCEL = -480;

  static isSolid(tile: TileType): boolean {
    return (
      tile === TileType.GROUND ||
      tile === TileType.BRICK ||
      tile === TileType.QUESTION_COIN ||
      tile === TileType.QUESTION_MUSHROOM ||
      tile === TileType.QUESTION_FLOWER ||
      tile === TileType.QUESTION_STAR ||
      tile === TileType.QUESTION_1UP ||
      tile === TileType.SOLID_BLOCK ||
      tile === TileType.HARD_BLOCK ||
      tile === TileType.USED_BLOCK ||
      tile === TileType.PIPE_TOP_LEFT ||
      tile === TileType.PIPE_TOP_RIGHT ||
      tile === TileType.PIPE_BODY_LEFT ||
      tile === TileType.PIPE_BODY_RIGHT ||
      tile === TileType.CASTLE_BRICK ||
      tile === TileType.UNDERGROUND_GROUND ||
      tile === TileType.UNDERGROUND_BRICK ||
      tile === TileType.BRIDGE
    );
  }

  static getTile(level: LevelData, col: number, row: number): TileType {
    if (row < 0 || row >= level.tiles.length || col < 0 || col >= level.tiles[0].length) {
      return TileType.EMPTY;
    }
    return level.tiles[row][col] as TileType;
  }

  static setTile(level: LevelData, col: number, row: number, tile: TileType): void {
    if (row >= 0 && row < level.tiles.length && col >= 0 && col < level.tiles[0].length) {
      level.tiles[row][col] = tile;
    }
  }

  /**
   * Apply physics and tile collision for an entity
   */
  static updateEntityPhysics(
    entity: Entity,
    dt: number,
    level: LevelData,
    gameEngine: any
  ): void {
    if (entity.isDead && !(entity instanceof Mario)) {
      return;
    }

    // Apply Gravity
    entity.vy += PhysicsEngine.GRAVITY * dt;
    if (entity.vy > PhysicsEngine.MAX_FALL_SPEED) {
      entity.vy = PhysicsEngine.MAX_FALL_SPEED;
    }

    // Move X
    entity.x += entity.vx * dt;
    PhysicsEngine.resolveTileCollisionX(entity, level, gameEngine);

    // Move Y
    entity.y += entity.vy * dt;
    PhysicsEngine.resolveTileCollisionY(entity, level, gameEngine);

    // Check pit death
    if (entity.y > level.height + 20) {
      if (entity instanceof Mario) {
        if (!entity.isDying) {
          gameEngine.killMario();
        }
      } else {
        entity.remove = true;
      }
    }
  }

  private static resolveTileCollisionX(entity: Entity, level: LevelData, gameEngine: any): void {
    const leftCol = Math.floor(entity.x / 16);
    const rightCol = Math.floor((entity.x + entity.width - 0.1) / 16);
    const topRow = Math.floor(entity.y / 16);
    const bottomRow = Math.floor((entity.y + entity.height - 0.1) / 16);

    for (let r = topRow; r <= bottomRow; r++) {
      for (let c = leftCol; c <= rightCol; c++) {
        const tile = PhysicsEngine.getTile(level, c, r);
        if (PhysicsEngine.isSolid(tile)) {
          if (entity.vx > 0) {
            // Moving right
            entity.x = c * 16 - entity.width;
            if (entity instanceof Koopa && entity.state === 'shell_spin') {
              entity.vx = -Math.abs(entity.vx);
              gameEngine.audioService.playBlockBump();
            } else if (entity instanceof Fireball) {
              entity.remove = true;
              gameEngine.spawnSparks(entity.x, entity.y);
            } else if (!(entity instanceof Mario)) {
              entity.vx = -Math.abs(entity.vx);
            } else {
              entity.vx = 0;
            }
          } else if (entity.vx < 0) {
            // Moving left
            entity.x = (c + 1) * 16;
            if (entity instanceof Koopa && entity.state === 'shell_spin') {
              entity.vx = Math.abs(entity.vx);
              gameEngine.audioService.playBlockBump();
            } else if (entity instanceof Fireball) {
              entity.remove = true;
              gameEngine.spawnSparks(entity.x, entity.y);
            } else if (!(entity instanceof Mario)) {
              entity.vx = Math.abs(entity.vx);
            } else {
              entity.vx = 0;
            }
          }
          return;
        }
      }
    }
  }

  private static resolveTileCollisionY(entity: Entity, level: LevelData, gameEngine: any): void {
    const leftCol = Math.floor(entity.x / 16);
    const rightCol = Math.floor((entity.x + entity.width - 0.1) / 16);
    const topRow = Math.floor(entity.y / 16);
    const bottomRow = Math.floor((entity.y + entity.height - 0.1) / 16);

    entity.isGrounded = false;

    for (let r = topRow; r <= bottomRow; r++) {
      for (let c = leftCol; c <= rightCol; c++) {
        const tile = PhysicsEngine.getTile(level, c, r);
        if (PhysicsEngine.isSolid(tile)) {
          if (entity.vy > 0) {
            // Landing on top of tile
            entity.y = r * 16 - entity.height;
            entity.vy = 0;
            entity.isGrounded = true;
            return;
          } else if (entity.vy < 0) {
            // Hitting tile from underneath
            entity.y = (r + 1) * 16;
            entity.vy = 0;
            if (entity instanceof Mario) {
              gameEngine.handleBlockHit(c, r, tile);
            }
            return;
          }
        }
      }
    }
  }
}
