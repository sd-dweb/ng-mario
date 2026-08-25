import { Direction, MarioPower, Rect, Vector2D } from './types';
import { SpriteRenderer } from './sprites';

export abstract class Entity {
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public width = 16;
  public height = 16;
  public isGrounded = false;
  public isDead = false;
  public remove = false;

  public get bounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public intersects(other: Rect): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  abstract update(dt: number, gameEngine: any): void;
  abstract render(ctx: CanvasRenderingContext2D, cameraX: number): void;
}

export class Mario extends Entity {
  public power = MarioPower.SMALL;
  public facing: Direction = Direction.RIGHT;
  public isCrouching = false;
  public isSkidding = false;
  public isJumping = false;
  public jumpHeld = false;
  public jumpTimer = 0;
  public invincibleTimer = 0;
  public starTimer = 0;
  public animFrame = 0;
  public isEnteringPipe = false;
  public pipeProgress = 0;
  public pipeDirection: 'down' | 'right' = 'down';
  public isSlidingPole = false;
  public flagpoleScore = 0;
  public poleSlideY = 0;
  public isDying = false;
  public dieTimer = 0;

  constructor(x = 40, y = 176) {
    super();
    this.x = x;
    this.y = y;
    this.updateSize();
  }

  public updateSize(): void {
    if (this.power === MarioPower.SMALL || this.isCrouching) {
      this.width = 14;
      this.height = 15;
    } else {
      this.width = 14;
      this.height = 30;
    }
  }

  update(dt: number, gameEngine: any): void {
    if (this.isDying) {
      this.dieTimer += dt;
      if (this.dieTimer > 0.4) {
        this.y += this.vy * dt;
        this.vy += 600 * dt; // Death gravity
      }
      return;
    }

    if (this.isEnteringPipe) {
      this.pipeProgress += dt * 30;
      if (this.pipeDirection === 'down') {
        this.y += dt * 30;
      } else {
        this.x += dt * 30;
      }
      return;
    }

    if (this.isSlidingPole) {
      if (this.y < this.poleSlideY) {
        this.y += 120 * dt;
      } else {
        // Move towards castle
        this.x += 60 * dt;
        this.animFrame += dt * 8;
      }
      return;
    }

    // Star countdown
    if (this.starTimer > 0) {
      this.starTimer -= dt;
      if (this.starTimer <= 0) {
        this.starTimer = 0;
        gameEngine.resumeStandardBgm();
      }
    }

    // Damage invulnerability timer
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }

    // Update animations
    if (Math.abs(this.vx) > 5) {
      this.animFrame += Math.abs(this.vx) * dt * 0.08;
    } else {
      this.animFrame = 0;
    }

    this.updateSize();
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const renderX = this.x - cameraX;
    let state: 'idle' | 'run' | 'jump' | 'skid' | 'crouch' | 'die' = 'idle';

    if (this.isDying) {
      state = 'die';
    } else if (this.isCrouching) {
      state = 'crouch';
    } else if (!this.isGrounded) {
      state = 'jump';
    } else if (this.isSkidding) {
      state = 'skid';
    } else if (Math.abs(this.vx) > 5) {
      state = 'run';
    }

    SpriteRenderer.drawMario(
      ctx,
      renderX,
      this.y,
      this.power,
      this.facing,
      state,
      this.animFrame,
      this.invincibleTimer,
      this.starTimer
    );
  }
}

export class Goomba extends Entity {
  public state: 'walk' | 'flat' = 'walk';
  public flatTimer = 0;
  public facing: Direction = Direction.LEFT;
  public animFrame = 0;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.vx = -30;
  }

  update(dt: number, gameEngine: any): void {
    if (this.isDead) {
      if (this.state === 'flat') {
        this.flatTimer += dt;
        if (this.flatTimer > 0.4) {
          this.remove = true;
        }
      } else {
        // Falling off screen from shell/star/fireball
        this.y += this.vy * dt;
        this.x += this.vx * dt;
        this.vy += 800 * dt;
        if (this.y > 300) this.remove = true;
      }
      return;
    }

    this.animFrame += dt * 4;
  }

  stomp(): void {
    this.state = 'flat';
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
  }

  flip(vx = 40): void {
    this.isDead = true;
    this.vx = vx;
    this.vy = -200;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    SpriteRenderer.drawGoomba(ctx, rx, this.y, this.state, this.animFrame);
  }
}

export class Koopa extends Entity {
  public state: 'walk' | 'shell' | 'shell_spin' = 'walk';
  public facing: Direction = Direction.LEFT;
  public animFrame = 0;
  public isRed = false;

  constructor(x: number, y: number, isRed = false) {
    super();
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 24;
    this.vx = -35;
    this.isRed = isRed;
  }

  update(dt: number, gameEngine: any): void {
    if (this.isDead) {
      this.y += this.vy * dt;
      this.x += this.vx * dt;
      this.vy += 800 * dt;
      if (this.y > 300) this.remove = true;
      return;
    }

    if (this.state === 'walk') {
      this.animFrame += dt * 4;
    } else if (this.state === 'shell_spin') {
      this.animFrame += dt * 12;
    }
  }

  stomp(): void {
    if (this.state === 'walk') {
      this.state = 'shell';
      this.height = 15;
      this.y += 9;
      this.vx = 0;
    } else if (this.state === 'shell') {
      this.kick(120);
    } else if (this.state === 'shell_spin') {
      this.state = 'shell';
      this.vx = 0;
    }
  }

  kick(speed: number): void {
    this.state = 'shell_spin';
    this.vx = speed;
  }

  flip(vx = 50): void {
    this.isDead = true;
    this.vx = vx;
    this.vy = -220;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    SpriteRenderer.drawKoopa(ctx, rx, this.y, this.facing, this.state, this.animFrame, this.isRed);
  }
}

export class PiranhaPlant extends Entity {
  public startY: number;
  public maxOffset = 26;
  public timer = 0;
  public animFrame = 0;

  constructor(x: number, y: number) {
    super();
    this.x = x + 8;
    this.y = y;
    this.startY = y;
    this.width = 16;
    this.height = 24;
  }

  update(dt: number, gameEngine: any): void {
    if (this.isDead) {
      this.y += this.vy * dt;
      this.vy += 800 * dt;
      if (this.y > 300) this.remove = true;
      return;
    }

    this.timer += dt;
    this.animFrame += dt * 6;

    // Smooth sinusoidal up/down motion
    const cycle = Math.sin(this.timer * 1.5);
    if (cycle > 0) {
      this.y = this.startY - cycle * this.maxOffset;
    } else {
      this.y = this.startY;
    }
  }

  flip(): void {
    this.isDead = true;
    this.vy = -180;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    SpriteRenderer.drawPiranhaPlant(ctx, rx, this.y, this.animFrame);
  }
}

export class Bowser extends Entity {
  public facing: Direction = Direction.LEFT;
  public animFrame = 0;
  public jumpTimer = 0;
  public fireTimer = 0;
  public isBreathingFire = false;
  public health = 5;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.vx = -15;
  }

  update(dt: number, gameEngine: any): void {
    if (this.isDead) {
      this.y += this.vy * dt;
      this.vy += 600 * dt;
      if (this.y > 350) this.remove = true;
      return;
    }

    this.animFrame += dt * 3;
    this.jumpTimer += dt;
    this.fireTimer += dt;

    // Periodic hops
    if (this.jumpTimer > 3 && this.isGrounded) {
      this.vy = -180;
      this.jumpTimer = 0;
      this.vx = (Math.random() - 0.5) * 30;
    }

    // Periodic Fire breath
    if (this.fireTimer > 2.5) {
      this.isBreathingFire = true;
      if (this.fireTimer > 3.2) {
        // Spawn fireball
        gameEngine.spawnBowserFire(this.x, this.y + 10, this.facing);
        this.fireTimer = 0;
        this.isBreathingFire = false;
      }
    }
  }

  takeDamage(): boolean {
    this.health--;
    if (this.health <= 0) {
      this.isDead = true;
      this.vy = -200;
      return true;
    }
    return false;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    SpriteRenderer.drawBowser(ctx, rx, this.y, this.facing, this.animFrame, this.isBreathingFire);
  }
}

export class PowerUpItem extends Entity {
  public itemType: 'mushroom' | '1up' | 'flower' | 'star';
  public emerging = true;
  public emergeY = 0;
  public targetY = 0;

  constructor(x: number, y: number, itemType: 'mushroom' | '1up' | 'flower' | 'star') {
    super();
    this.x = x;
    this.y = y;
    this.emergeY = y;
    this.targetY = y - 16;
    this.width = 16;
    this.height = 16;
    this.itemType = itemType;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt: number, gameEngine: any): void {
    if (this.emerging) {
      this.y -= dt * 24;
      if (this.y <= this.targetY) {
        this.y = this.targetY;
        this.emerging = false;
        if (this.itemType === 'flower') {
          this.vx = 0;
        } else if (this.itemType === 'star') {
          this.vx = 55;
          this.vy = -120;
        } else {
          this.vx = 50; // Mushroom walks
        }
      }
      return;
    }

    if (this.itemType === 'star' && this.isGrounded) {
      this.vy = -180; // Star bouncing
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    SpriteRenderer.drawItem(ctx, rx, this.y, this.itemType, 0);
  }
}

export class Fireball extends Entity {
  public animFrame = 0;

  constructor(x: number, y: number, vx: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 8;
    this.vx = vx;
    this.vy = 60;
  }

  update(dt: number, gameEngine: any): void {
    this.animFrame += dt * 10;
    if (this.isGrounded) {
      this.vy = -140; // Bounce up
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    SpriteRenderer.drawFireball(ctx, rx, this.y, this.animFrame);
  }
}

export class BowserFire extends Entity {
  public animFrame = 0;

  constructor(x: number, y: number, vx: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 8;
    this.vx = vx;
    this.vy = (Math.random() - 0.5) * 20;
  }

  update(dt: number, gameEngine: any): void {
    this.animFrame += dt * 8;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < 0 || this.x > 5000) this.remove = true;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const rx = this.x - cameraX;
    ctx.save();
    ctx.translate(Math.round(rx), Math.round(this.y));
    ctx.fillStyle = '#fc2800';
    ctx.fillRect(0, 0, 16, 8);
    ctx.fillStyle = '#fcb800';
    ctx.fillRect(4, 2, 8, 4);
    ctx.restore();
  }
}
