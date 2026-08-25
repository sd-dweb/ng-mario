import { AudioService } from '../audio/audio.service';
import { GameStateService } from '../state/game-state.service';
import { Bowser, BowserFire, Entity, Fireball, Goomba, Koopa, Mario, PiranhaPlant, PowerUpItem } from './entities';
import { ALL_LEVELS } from './level-data';
import { PhysicsEngine } from './physics';
import { SpriteRenderer } from './sprites';
import { FloatingText, GameState, LevelData, MarioPower, Particle, TileBouncing, TileType } from './types';

export class GameEngine {
  public mario!: Mario;
  public level!: LevelData;
  public enemies: Entity[] = [];
  public items: PowerUpItem[] = [];
  public fireballs: Fireball[] = [];
  public bowserFires: BowserFire[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public bouncingTiles: TileBouncing[] = [];

  public cameraX = 0;
  public isRunning = false;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private timeAccumulator = 0;

  // Controls input buffer
  public keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    run: false,
    fire: false
  };

  private prevJumpKey = false;
  private prevFireKey = false;

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
    public gameStateService: GameStateService,
    public audioService: AudioService
  ) {}

  public startLevel(levelIndex = 0, customData: LevelData | null = null): void {
    if (customData) {
      this.level = JSON.parse(JSON.stringify(customData));
      this.gameStateService.isCustomLevel.set(true);
      this.gameStateService.world.set(customData.worldName);
    } else {
      const gen = ALL_LEVELS[levelIndex] || ALL_LEVELS[0];
      this.level = gen();
      this.gameStateService.isCustomLevel.set(false);
      this.gameStateService.setLevel(levelIndex, this.level.worldName);
    }

    this.gameStateService.setTime(this.level.timeLimit);
    this.cameraX = 0;

    // Create Mario
    this.mario = new Mario(this.level.spawn.x, this.level.spawn.y);
    this.mario.power = this.gameStateService.marioPower();
    this.mario.updateSize();

    // Spawn initial enemies
    this.enemies = [];
    this.level.enemies.forEach(e => {
      if (e.type === 'goomba') {
        this.enemies.push(new Goomba(e.x, e.y));
      } else if (e.type === 'koopa') {
        this.enemies.push(new Koopa(e.x, e.y));
      } else if (e.type === 'piranha') {
        this.enemies.push(new PiranhaPlant(e.x, e.y));
      } else if (e.type === 'bowser') {
        this.enemies.push(new Bowser(e.x, e.y));
      }
    });

    this.items = [];
    this.fireballs = [];
    this.bowserFires = [];
    this.particles = [];
    this.floatingTexts = [];
    this.bouncingTiles = [];

    this.gameStateService.setGameState(GameState.PLAYING);
    this.resumeStandardBgm();

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public resumeStandardBgm(): void {
    if (this.level.theme === 'underground') {
      this.audioService.playMusic('underground');
    } else if (this.level.theme === 'castle') {
      this.audioService.playMusic('castle');
    } else {
      this.audioService.playMusic('overworld');
    }
  }

  public loop = (time: number): void => {
    if (!this.isRunning) return;

    let dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Clamp dt to avoid huge step jumps when tab is inactive
    if (dt > 0.1) dt = 0.1;

    if (this.gameStateService.gameState() === GameState.PLAYING) {
      this.update(dt);
    }

    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.audioService.stopMusic();
  }

  public update(dt: number): void {
    this.updateTimer(dt);
    this.handleMarioInput(dt);

    // Update Mario Physics & Tile Interactivity
    if (!this.mario.isSlidingPole && !this.mario.isEnteringPipe && !this.mario.isDying) {
      PhysicsEngine.updateEntityPhysics(this.mario, dt, this.level, this);
    }
    this.mario.update(dt, this);

    // Update Enemies & Interactions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      // Only process physics if reasonably close to camera
      if (enemy.x > this.cameraX - 40 && enemy.x < this.cameraX + 300) {
        if (enemy instanceof PiranhaPlant) {
          enemy.update(dt, this);
        } else {
          PhysicsEngine.updateEntityPhysics(enemy, dt, this.level, this);
          enemy.update(dt, this);
        }
      }

      if (enemy.remove) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Check Mario collision
      if (!this.mario.isDying && !this.mario.isSlidingPole && !enemy.isDead) {
        if (this.mario.intersects(enemy.bounds)) {
          this.handleMarioEnemyCollision(enemy);
        }
      }

      // Check Fireball collision with enemy
      for (let f = this.fireballs.length - 1; f >= 0; f--) {
        const fb = this.fireballs[f];
        if (fb.intersects(enemy.bounds)) {
          fb.remove = true;
          this.spawnSparks(fb.x, fb.y);
          this.audioService.playKick();
          if (enemy instanceof Bowser) {
            const died = enemy.takeDamage();
            if (died) {
              this.addFloatingText(enemy.x, enemy.y, '5000 PTS');
              this.gameStateService.addScore(5000);
            }
          } else if (enemy instanceof Goomba) {
            enemy.flip(fb.vx > 0 ? 50 : -50);
            this.addFloatingText(enemy.x, enemy.y, '100');
            this.gameStateService.addScore(100);
          } else if (enemy instanceof Koopa) {
            enemy.flip(fb.vx > 0 ? 60 : -60);
            this.addFloatingText(enemy.x, enemy.y, '200');
            this.gameStateService.addScore(200);
          } else if (enemy instanceof PiranhaPlant) {
            enemy.flip();
            this.addFloatingText(enemy.x, enemy.y, '200');
            this.gameStateService.addScore(200);
          }
          break;
        }
      }
    }

    // Update Items (Mushrooms, Stars, Flowers)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item.emerging) {
        PhysicsEngine.updateEntityPhysics(item, dt, this.level, this);
      }
      item.update(dt, this);

      if (item.remove) {
        this.items.splice(i, 1);
        continue;
      }

      if (this.mario.intersects(item.bounds) && !this.mario.isDying) {
        this.collectItem(item);
        this.items.splice(i, 1);
      }
    }

    // Update Fireballs
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      PhysicsEngine.updateEntityPhysics(fb, dt, this.level, this);
      fb.update(dt, this);
      if (fb.remove || fb.x > this.cameraX + 300 || fb.x < this.cameraX - 50) {
        this.fireballs.splice(i, 1);
      }
    }

    // Update Bowser fire breath
    for (let i = this.bowserFires.length - 1; i >= 0; i--) {
      const bf = this.bowserFires[i];
      bf.update(dt, this);
      if (bf.intersects(this.mario.bounds) && !this.mario.isDying && this.mario.invincibleTimer <= 0) {
        if (this.mario.starTimer > 0) {
          bf.remove = true;
        } else {
          this.hurtMario();
        }
      }
      if (bf.remove) this.bowserFires.splice(i, 1);
    }

    // Update Bouncing Blocks
    for (let i = this.bouncingTiles.length - 1; i >= 0; i--) {
      const bt = this.bouncingTiles[i];
      bt.offsetY += bt.vy * dt;
      bt.vy += 800 * dt;
      if (bt.offsetY >= 0) {
        bt.offsetY = 0;
        this.bouncingTiles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Score Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Smooth Camera Scroll (Locks to Mario, never scrolls backwards in classic NES style)
    const targetCamX = this.mario.x - 100;
    if (targetCamX > this.cameraX) {
      this.cameraX = targetCamX;
    }
    const maxCamX = this.level.width - 256;
    if (this.cameraX > maxCamX) {
      this.cameraX = maxCamX;
    }
    if (this.cameraX < 0) {
      this.cameraX = 0;
    }

    // Check Flagpole or Golden Axe victory trigger
    if (!this.mario.isSlidingPole && !this.mario.isDying) {
      if (this.level.theme === 'castle') {
        if (this.mario.x >= this.level.flagpoleX - 8) {
          this.triggerAxeVictory();
        }
      } else {
        if (this.mario.x >= this.level.flagpoleX - 4 && this.mario.x <= this.level.flagpoleX + 16) {
          this.triggerFlagpole();
        }
      }
    }
  }

  private handleMarioInput(dt: number): void {
    if (this.mario.isDying || this.mario.isSlidingPole || this.mario.isEnteringPipe) {
      return;
    }

    const accel = this.keys.run ? PhysicsEngine.MARIO_RUN_ACCEL : PhysicsEngine.MARIO_ACCEL;
    const maxSpeed = this.keys.run ? PhysicsEngine.MARIO_MAX_RUN : PhysicsEngine.MARIO_MAX_WALK;

    // Crouching
    this.mario.isCrouching = this.keys.down && this.mario.power !== MarioPower.SMALL && this.mario.isGrounded;

    // Movement X
    if (this.keys.left && !this.mario.isCrouching) {
      this.mario.facing = -1;
      if (this.mario.vx > 10) {
        this.mario.isSkidding = true;
        this.mario.vx -= PhysicsEngine.MARIO_FRICTION * 2.5 * dt;
      } else {
        this.mario.isSkidding = false;
        this.mario.vx -= accel * dt;
        if (this.mario.vx < -maxSpeed) this.mario.vx = -maxSpeed;
      }
    } else if (this.keys.right && !this.mario.isCrouching) {
      this.mario.facing = 1;
      if (this.mario.vx < -10) {
        this.mario.isSkidding = true;
        this.mario.vx += PhysicsEngine.MARIO_FRICTION * 2.5 * dt;
      } else {
        this.mario.isSkidding = false;
        this.mario.vx += accel * dt;
        if (this.mario.vx > maxSpeed) this.mario.vx = maxSpeed;
      }
    } else {
      this.mario.isSkidding = false;
      // Decelerate / Friction
      if (this.mario.vx > 0) {
        this.mario.vx = Math.max(0, this.mario.vx - PhysicsEngine.MARIO_FRICTION * dt);
      } else if (this.mario.vx < 0) {
        this.mario.vx = Math.min(0, this.mario.vx + PhysicsEngine.MARIO_FRICTION * dt);
      }
    }

    // Mario Jump
    if (this.keys.jump && !this.prevJumpKey && this.mario.isGrounded && !this.mario.isCrouching) {
      this.mario.vy = PhysicsEngine.MARIO_JUMP_IMPULSE;
      this.mario.isGrounded = false;
      this.mario.jumpTimer = 0.25;
      this.audioService.playJump(this.mario.power !== MarioPower.SMALL);
    }

    // Variable jump height hold
    if (this.keys.jump && this.mario.jumpTimer > 0) {
      this.mario.vy += PhysicsEngine.MARIO_JUMP_HOLD_ACCEL * dt;
      this.mario.jumpTimer -= dt;
    } else {
      this.mario.jumpTimer = 0;
    }

    // Fireball Throw
    if (this.keys.fire && !this.prevFireKey && this.mario.power === MarioPower.FIRE && this.fireballs.length < 2) {
      const fbX = this.mario.facing === 1 ? this.mario.x + 14 : this.mario.x - 4;
      const fb = new Fireball(fbX, this.mario.y + 6, this.mario.facing * 180);
      this.fireballs.push(fb);
      this.audioService.playFireball();
    }

    this.prevJumpKey = this.keys.jump;
    this.prevFireKey = this.keys.fire;
  }

  private handleMarioEnemyCollision(enemy: Entity): void {
    // Star Invincibility instakill
    if (this.mario.starTimer > 0) {
      if (enemy instanceof Bowser) {
        enemy.takeDamage();
      } else if (enemy instanceof Goomba || enemy instanceof Koopa || enemy instanceof PiranhaPlant) {
        enemy.flip(this.mario.facing * 60);
      }
      this.audioService.playKick();
      this.addFloatingText(enemy.x, enemy.y, '200');
      this.gameStateService.addScore(200);
      return;
    }

    // Check if stomping from above
    const isStomp = this.mario.vy > 0 && this.mario.y + this.mario.height - this.mario.vy * 0.05 <= enemy.y + 8;

    if (enemy instanceof Goomba && isStomp) {
      enemy.stomp();
      this.mario.vy = -200; // Bounce Mario
      this.audioService.playStomp();
      this.addFloatingText(enemy.x, enemy.y, '100');
      this.gameStateService.addScore(100);
      return;
    }

    if (enemy instanceof Koopa) {
      if (isStomp) {
        if (enemy.state === 'walk') {
          enemy.stomp();
          this.mario.vy = -200;
          this.audioService.playStomp();
          this.addFloatingText(enemy.x, enemy.y, '100');
          this.gameStateService.addScore(100);
        } else if (enemy.state === 'shell_spin') {
          enemy.stomp();
          this.mario.vy = -200;
          this.audioService.playStomp();
        } else if (enemy.state === 'shell') {
          const dir = this.mario.x < enemy.x ? 1 : -1;
          enemy.kick(dir * 180);
          this.audioService.playKick();
          this.addFloatingText(enemy.x, enemy.y, '400');
          this.gameStateService.addScore(400);
        }
        return;
      } else if (enemy.state === 'shell') {
        // Kick stationary shell
        const dir = this.mario.x < enemy.x ? 1 : -1;
        enemy.kick(dir * 180);
        this.audioService.playKick();
        this.addFloatingText(enemy.x, enemy.y, '400');
        this.gameStateService.addScore(400);
        return;
      }
    }

    // Otherwise, Mario takes damage
    if (this.mario.invincibleTimer <= 0) {
      this.hurtMario();
    }
  }

  public hurtMario(): void {
    if (this.mario.power === MarioPower.FIRE) {
      this.mario.power = MarioPower.SUPER;
      this.mario.invincibleTimer = 2.0;
      this.gameStateService.setMarioPower(MarioPower.SUPER);
      this.audioService.playPowerDown();
    } else if (this.mario.power === MarioPower.SUPER) {
      this.mario.power = MarioPower.SMALL;
      this.mario.invincibleTimer = 2.0;
      this.gameStateService.setMarioPower(MarioPower.SMALL);
      this.audioService.playPowerDown();
    } else {
      this.killMario();
    }
  }

  public killMario(): void {
    this.mario.isDying = true;
    this.mario.vy = -280;
    this.mario.vx = 0;
    this.audioService.playDie();

    setTimeout(() => {
      const remainingLives = this.gameStateService.loseLife();
      if (remainingLives <= 0) {
        this.gameStateService.setGameState(GameState.GAME_OVER);
      } else {
        this.startLevel(this.gameStateService.currentLevelIndex());
      }
    }, 2500);
  }

  public handleBlockHit(col: number, row: number, tile: TileType): void {
    this.bouncingTiles.push({
      col,
      row,
      tileType: tile,
      offsetY: 0,
      vy: -100
    });

    if (tile === TileType.QUESTION_COIN) {
      PhysicsEngine.setTile(this.level, col, row, TileType.USED_BLOCK);
      this.gameStateService.addCoin();
      this.audioService.playCoin();
      this.spawnCoinParticle(col * 16, row * 16);
      this.addFloatingText(col * 16, row * 16 - 10, '200');
    } else if (tile === TileType.QUESTION_MUSHROOM) {
      PhysicsEngine.setTile(this.level, col, row, TileType.USED_BLOCK);
      this.audioService.playPowerUp();
      const itemType = this.mario.power === MarioPower.SMALL ? 'mushroom' : 'flower';
      this.items.push(new PowerUpItem(col * 16, row * 16, itemType));
    } else if (tile === TileType.QUESTION_FLOWER) {
      PhysicsEngine.setTile(this.level, col, row, TileType.USED_BLOCK);
      this.audioService.playPowerUp();
      this.items.push(new PowerUpItem(col * 16, row * 16, 'flower'));
    } else if (tile === TileType.QUESTION_STAR) {
      PhysicsEngine.setTile(this.level, col, row, TileType.USED_BLOCK);
      this.audioService.playPowerUp();
      this.items.push(new PowerUpItem(col * 16, row * 16, 'star'));
    } else if (tile === TileType.QUESTION_1UP) {
      PhysicsEngine.setTile(this.level, col, row, TileType.USED_BLOCK);
      this.audioService.playPowerUp();
      this.items.push(new PowerUpItem(col * 16, row * 16, '1up'));
    } else if (tile === TileType.BRICK || tile === TileType.UNDERGROUND_BRICK) {
      if (this.mario.power !== MarioPower.SMALL) {
        // Break brick
        PhysicsEngine.setTile(this.level, col, row, TileType.EMPTY);
        this.audioService.playBlockBreak();
        this.spawnBrickDebris(col * 16, row * 16);
        this.gameStateService.addScore(50);
      } else {
        this.audioService.playBlockBump();
      }
    } else {
      this.audioService.playBlockBump();
    }
  }

  private collectItem(item: PowerUpItem): void {
    if (item.itemType === 'mushroom') {
      if (this.mario.power === MarioPower.SMALL) {
        this.mario.power = MarioPower.SUPER;
        this.gameStateService.setMarioPower(MarioPower.SUPER);
      }
      this.audioService.playPowerUp();
      this.addFloatingText(item.x, item.y, '1000');
      this.gameStateService.addScore(1000);
    } else if (item.itemType === 'flower') {
      this.mario.power = MarioPower.FIRE;
      this.gameStateService.setMarioPower(MarioPower.FIRE);
      this.audioService.playPowerUp();
      this.addFloatingText(item.x, item.y, '1000');
      this.gameStateService.addScore(1000);
    } else if (item.itemType === 'star') {
      this.mario.starTimer = 12.0;
      this.audioService.playMusic('star');
      this.addFloatingText(item.x, item.y, '1000');
      this.gameStateService.addScore(1000);
    } else if (item.itemType === '1up') {
      this.gameStateService.gainLife();
      this.audioService.playPowerUp();
      this.addFloatingText(item.x, item.y, '1UP');
    }
  }

  public triggerFlagpole(): void {
    this.mario.isSlidingPole = true;
    this.mario.poleSlideY = 192;
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.audioService.playFlagpole();

    // Bonus points based on height
    const heightPts = Math.floor((200 - this.mario.y) * 20);
    this.gameStateService.addScore(Math.max(100, heightPts));
    this.addFloatingText(this.mario.x, this.mario.y, `${Math.max(100, heightPts)}`);

    setTimeout(() => {
      this.audioService.playStageClear();
      this.gameStateService.setGameState(GameState.STAGE_CLEAR);
      setTimeout(() => {
        this.advanceNextLevel();
      }, 4000);
    }, 1500);
  }

  public triggerAxeVictory(): void {
    // Castle Bowser Axe trigger
    this.mario.isSlidingPole = true;
    this.audioService.playStageClear();
    this.gameStateService.setGameState(GameState.VICTORY);
    this.gameStateService.addScore(10000);
  }

  public advanceNextLevel(): void {
    const nextIdx = this.gameStateService.currentLevelIndex() + 1;
    if (nextIdx < ALL_LEVELS.length) {
      this.startLevel(nextIdx);
    } else {
      this.gameStateService.setGameState(GameState.VICTORY);
    }
  }

  public spawnBowserFire(x: number, y: number, dir: number): void {
    this.bowserFires.push(new BowserFire(x, y, dir * -120));
  }

  public spawnSparks(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        color: Math.random() > 0.5 ? '#fcb800' : '#fc2800',
        size: 3,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  private spawnBrickDebris(x: number, y: number): void {
    const velocities = [
      { vx: -60, vy: -200 },
      { vx: 60, vy: -200 },
      { vx: -40, vy: -120 },
      { vx: 40, vy: -120 }
    ];
    velocities.forEach(v => {
      this.particles.push({
        x: x + 4,
        y: y + 4,
        vx: v.vx,
        vy: v.vy,
        gravity: 600,
        color: '#b84418',
        size: 4,
        alpha: 1,
        life: 0.8,
        maxLife: 0.8
      });
    });
  }

  private spawnCoinParticle(x: number, y: number): void {
    this.particles.push({
      x: x + 4,
      y: y - 8,
      vx: 0,
      vy: -150,
      gravity: 400,
      color: '#fcb800',
      size: 8,
      alpha: 1,
      life: 0.4,
      maxLife: 0.4
    });
  }

  public addFloatingText(x: number, y: number, text: string): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      vy: -40,
      alpha: 1,
      life: 0.8
    });
  }

  private updateTimer(dt: number): void {
    this.timeAccumulator += dt;
    if (this.timeAccumulator >= 0.4) {
      this.timeAccumulator = 0;
      this.gameStateService.decrementTime(1);
      if (this.gameStateService.time() <= 0 && !this.mario.isDying) {
        this.killMario();
      }
    }
  }

  public render(): void {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const now = performance.now() / 1000;

    // Clear Background
    ctx.fillStyle = this.level?.backgroundColor || '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!this.level) return;

    // Draw Background Scenery (Clouds, Bushes, Hills)
    if (this.level.theme === 'overworld' || this.level.theme === 'athletic') {
      this.renderBackgroundScenery(ctx);
    }

    // Render Tilemap
    const startCol = Math.max(0, Math.floor(this.cameraX / 16));
    const endCol = Math.min(this.level.tiles[0].length - 1, Math.ceil((this.cameraX + canvas.width) / 16));

    for (let r = 0; r < this.level.tiles.length; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.level.tiles[r][c] as TileType;
        if (tile !== TileType.EMPTY) {
          // Check if bouncing
          const bouncing = this.bouncingTiles.find(b => b.col === c && b.row === r);
          const offsetY = bouncing ? bouncing.offsetY : 0;
          SpriteRenderer.drawTile(ctx, c * 16 - this.cameraX, r * 16, tile, this.level.theme, now, offsetY);
        }
      }
    }

    // Render Items
    this.items.forEach(i => i.render(ctx, this.cameraX));

    // Render Enemies
    this.enemies.forEach(e => e.render(ctx, this.cameraX));

    // Render Fireballs & Bowser Fire
    this.fireballs.forEach(f => f.render(ctx, this.cameraX));
    this.bowserFires.forEach(b => b.render(ctx, this.cameraX));

    // Render Mario
    if (this.mario) {
      this.mario.render(ctx, this.cameraX);
    }

    // Render Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillRect(Math.round(p.x - this.cameraX), Math.round(p.y), p.size, p.size);
      ctx.restore();
    });

    // Render Floating Score Texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(ft.text, Math.round(ft.x - this.cameraX), Math.round(ft.y));
      ctx.restore();
    });
  }

  private renderBackgroundScenery(ctx: CanvasRenderingContext2D): void {
    // Parallax clouds & hills
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 15; i++) {
      const cx = (i * 180) - (this.cameraX * 0.4);
      if (cx > -60 && cx < 320) {
        // Cloud
        ctx.fillRect(cx, 35, 36, 12);
        ctx.fillRect(cx + 8, 27, 20, 8);
      }
      const bx = (i * 220 + 80) - (this.cameraX * 0.7);
      if (bx > -60 && bx < 320) {
        // Bush
        ctx.fillStyle = '#00a800';
        ctx.fillRect(bx, 192, 32, 16);
        ctx.fillStyle = '#ffffff';
      }
    }
  }
}
