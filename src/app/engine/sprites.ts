import { MarioPower, TileType } from './types';

export class SpriteRenderer {
  // Color Palettes
  static readonly PALETTE = {
    marioRed: '#d82800',
    marioBrown: '#885818',
    marioSkin: '#fc9838',
    marioWhite: '#fcfcfc',
    goombaBrown: '#a84400',
    goombaSkin: '#fcb878',
    goombaBlack: '#000000',
    koopaGreen: '#00a800',
    koopaOrange: '#fc9838',
    koopaRed: '#d82800',
    skyBlue: '#5c94fc',
    groundBrown: '#b84418',
    groundLight: '#e45c10',
    groundDark: '#501800',
    brickBrown: '#b84418',
    brickDark: '#000000',
    questionYellow: '#f8b800',
    questionBrown: '#a84400',
    usedGrey: '#888888',
    pipeGreenLight: '#80d010',
    pipeGreenDark: '#008000',
    pipeBlack: '#000000',
    coinYellow: '#fcb800',
    coinWhite: '#ffffff',
    cloudWhite: '#ffffff',
    cloudBlue: '#b8e8f8',
    bushGreen: '#00a800',
    bushDark: '#006800',
    mushroomRed: '#d82800',
    mushroomWhite: '#fcfcfc',
    mushroomSkin: '#fce4a0',
    starYellow: '#f8d800',
    flowerOrange: '#fc7400',
    flowerRed: '#fc2800',
    bowserGreen: '#00a800',
    bowserYellow: '#f8b800',
    bowserOrange: '#fc7400',
    castleGrey: '#888888',
    castleDark: '#444444',
    lavaRed: '#fc3800',
    lavaYellow: '#fcb800',
    undergroundBlue: '#0058f8',
    undergroundCyan: '#3cbcfc'
  };

  /**
   * Draw Mario sprite on Canvas 2D context
   */
  static drawMario(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    power: MarioPower,
    facing: number,
    state: 'idle' | 'run' | 'jump' | 'skid' | 'crouch' | 'die',
    animFrame: number,
    invincibleTimer: number,
    starTimer: number
  ): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Handle flashing when invincible after hit
    if (invincibleTimer > 0 && Math.floor(invincibleTimer * 10) % 2 === 0) {
      ctx.restore();
      return;
    }

    // Direction flip
    if (facing === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    // Palette selection
    let hatColor = SpriteRenderer.PALETTE.marioRed;
    let shirtColor = SpriteRenderer.PALETTE.marioRed;
    let overallsColor = SpriteRenderer.PALETTE.marioBrown;
    let skinColor = SpriteRenderer.PALETTE.marioSkin;

    if (power === MarioPower.FIRE) {
      hatColor = SpriteRenderer.PALETTE.marioWhite;
      shirtColor = SpriteRenderer.PALETTE.marioWhite;
      overallsColor = SpriteRenderer.PALETTE.marioRed;
    }

    if (starTimer > 0) {
      const colors = ['#f8b800', '#00a800', '#0058f8', '#fc7400', '#fcfcfc'];
      const cycle = Math.floor(starTimer * 15) % colors.length;
      hatColor = colors[cycle];
      overallsColor = colors[(cycle + 2) % colors.length];
    }

    const u = 1; // 1 pixel unit (16x16 or 16x32)

    if (state === 'die') {
      // Dead Mario
      this.renderSmallDeadMario(ctx, hatColor, overallsColor, skinColor);
      ctx.restore();
      return;
    }

    if (power === MarioPower.SMALL) {
      this.renderSmallMario(ctx, state, animFrame, hatColor, overallsColor, skinColor);
    } else {
      this.renderSuperMario(ctx, state, animFrame, hatColor, overallsColor, skinColor);
    }

    ctx.restore();
  }

  private static renderSmallMario(
    ctx: CanvasRenderingContext2D,
    state: string,
    animFrame: number,
    hat: string,
    overalls: string,
    skin: string
  ): void {
    // Hat
    ctx.fillStyle = hat;
    ctx.fillRect(3, 1, 5, 1);
    ctx.fillRect(2, 2, 9, 1);

    // Hair / Face
    ctx.fillStyle = overalls;
    ctx.fillRect(2, 3, 3, 1);
    ctx.fillRect(1, 4, 1, 3);
    ctx.fillRect(2, 5, 1, 1);

    ctx.fillStyle = skin;
    ctx.fillRect(5, 3, 2, 1);
    ctx.fillRect(4, 4, 1, 1);
    ctx.fillRect(3, 4, 1, 1);
    ctx.fillRect(2, 4, 2, 1);
    ctx.fillRect(4, 5, 3, 1);
    ctx.fillRect(3, 6, 5, 1);

    // Eyes / Moustache
    ctx.fillStyle = '#000';
    ctx.fillRect(7, 3, 1, 2);
    ctx.fillRect(6, 5, 4, 1);

    // Shirt & Overalls Body
    if (state === 'jump') {
      // Jumping pose
      ctx.fillStyle = hat;
      ctx.fillRect(1, 7, 2, 3);
      ctx.fillRect(3, 8, 5, 3);
      ctx.fillRect(8, 7, 3, 3);

      ctx.fillStyle = overalls;
      ctx.fillRect(4, 9, 3, 3);
      ctx.fillRect(2, 12, 3, 3);
      ctx.fillRect(7, 11, 4, 3);

      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(0, 6, 2, 2);
      ctx.fillRect(10, 6, 2, 2);

      // Shoes
      ctx.fillStyle = overalls;
      ctx.fillRect(1, 14, 4, 2);
      ctx.fillRect(8, 13, 4, 2);
    } else if (state === 'run') {
      const step = Math.floor(animFrame) % 3;
      if (step === 0) {
        ctx.fillStyle = hat;
        ctx.fillRect(2, 7, 7, 3);
        ctx.fillStyle = overalls;
        ctx.fillRect(3, 9, 5, 4);
        ctx.fillRect(1, 12, 4, 3);
        ctx.fillRect(7, 11, 3, 4);
        ctx.fillStyle = skin;
        ctx.fillRect(8, 7, 2, 2);
        ctx.fillRect(0, 8, 2, 2);
      } else if (step === 1) {
        ctx.fillStyle = hat;
        ctx.fillRect(3, 7, 6, 3);
        ctx.fillStyle = overalls;
        ctx.fillRect(3, 9, 5, 5);
        ctx.fillRect(2, 13, 3, 3);
        ctx.fillRect(7, 13, 3, 3);
        ctx.fillStyle = skin;
        ctx.fillRect(8, 8, 2, 2);
        ctx.fillRect(1, 7, 2, 2);
      } else {
        ctx.fillStyle = hat;
        ctx.fillRect(2, 7, 7, 3);
        ctx.fillStyle = overalls;
        ctx.fillRect(3, 9, 5, 4);
        ctx.fillRect(7, 12, 4, 3);
        ctx.fillRect(2, 11, 3, 4);
        ctx.fillStyle = skin;
        ctx.fillRect(9, 8, 2, 2);
        ctx.fillRect(0, 7, 2, 2);
      }
    } else if (state === 'skid') {
      ctx.fillStyle = hat;
      ctx.fillRect(4, 7, 6, 3);
      ctx.fillStyle = overalls;
      ctx.fillRect(3, 9, 5, 4);
      ctx.fillRect(1, 13, 4, 3);
      ctx.fillRect(8, 12, 4, 3);
      ctx.fillStyle = skin;
      ctx.fillRect(10, 7, 2, 2);
      ctx.fillRect(1, 8, 2, 2);
    } else {
      // Idle
      ctx.fillStyle = hat;
      ctx.fillRect(2, 7, 7, 3);
      ctx.fillStyle = overalls;
      ctx.fillRect(3, 9, 5, 4);
      ctx.fillRect(2, 13, 3, 3);
      ctx.fillRect(7, 13, 3, 3);
      ctx.fillStyle = skin;
      ctx.fillRect(8, 8, 2, 2);
      ctx.fillRect(1, 8, 2, 2);
    }
  }

  private static renderSuperMario(
    ctx: CanvasRenderingContext2D,
    state: string,
    animFrame: number,
    hat: string,
    overalls: string,
    skin: string
  ): void {
    if (state === 'crouch') {
      // Crouching Super Mario
      ctx.translate(0, 10);
      this.renderSmallMario(ctx, 'idle', 0, hat, overalls, skin);
      return;
    }

    // Hat (Top 16x32)
    ctx.fillStyle = hat;
    ctx.fillRect(4, 2, 6, 2);
    ctx.fillRect(3, 4, 11, 2);

    // Hair / Face
    ctx.fillStyle = overalls;
    ctx.fillRect(3, 6, 3, 2);
    ctx.fillRect(2, 8, 2, 4);
    ctx.fillRect(3, 10, 2, 2);

    ctx.fillStyle = skin;
    ctx.fillRect(6, 6, 3, 2);
    ctx.fillRect(5, 8, 4, 2);
    ctx.fillRect(4, 10, 4, 2);
    ctx.fillRect(5, 12, 6, 2);

    // Eyes / Moustache
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 6, 2, 4);
    ctx.fillRect(8, 10, 5, 2);

    // Body
    if (state === 'jump') {
      ctx.fillStyle = hat;
      ctx.fillRect(2, 14, 4, 6);
      ctx.fillRect(6, 15, 6, 6);
      ctx.fillRect(11, 14, 4, 6);

      ctx.fillStyle = overalls;
      ctx.fillRect(5, 18, 6, 7);
      ctx.fillRect(2, 24, 4, 5);
      ctx.fillRect(9, 22, 5, 6);

      ctx.fillStyle = skin;
      ctx.fillRect(0, 12, 3, 3);
      ctx.fillRect(13, 12, 3, 3);

      ctx.fillStyle = overalls;
      ctx.fillRect(1, 28, 5, 3);
      ctx.fillRect(10, 27, 5, 3);
    } else if (state === 'run') {
      const step = Math.floor(animFrame) % 3;
      ctx.fillStyle = hat;
      ctx.fillRect(3, 14, 9, 6);
      ctx.fillStyle = overalls;
      ctx.fillRect(4, 18, 7, 7);

      if (step === 0) {
        ctx.fillRect(2, 24, 4, 6);
        ctx.fillRect(8, 22, 5, 7);
      } else if (step === 1) {
        ctx.fillRect(3, 25, 4, 6);
        ctx.fillRect(8, 25, 4, 6);
      } else {
        ctx.fillRect(8, 24, 5, 6);
        ctx.fillRect(3, 22, 4, 7);
      }

      ctx.fillStyle = skin;
      ctx.fillRect(11, 16, 3, 3);
      ctx.fillRect(1, 16, 3, 3);
    } else if (state === 'skid') {
      ctx.fillStyle = hat;
      ctx.fillRect(5, 14, 8, 6);
      ctx.fillStyle = overalls;
      ctx.fillRect(4, 18, 7, 7);
      ctx.fillRect(1, 25, 5, 6);
      ctx.fillRect(10, 24, 5, 6);
      ctx.fillStyle = skin;
      ctx.fillRect(12, 14, 3, 3);
      ctx.fillRect(1, 16, 3, 3);
    } else {
      // Idle
      ctx.fillStyle = hat;
      ctx.fillRect(3, 14, 9, 6);
      ctx.fillStyle = overalls;
      ctx.fillRect(4, 18, 7, 7);
      ctx.fillRect(3, 25, 4, 6);
      ctx.fillRect(8, 25, 4, 6);
      ctx.fillStyle = skin;
      ctx.fillRect(11, 16, 3, 3);
      ctx.fillRect(1, 16, 3, 3);
    }
  }

  private static renderSmallDeadMario(
    ctx: CanvasRenderingContext2D,
    hat: string,
    overalls: string,
    skin: string
  ): void {
    ctx.fillStyle = hat;
    ctx.fillRect(3, 1, 6, 2);
    ctx.fillRect(2, 3, 10, 2);
    ctx.fillStyle = skin;
    ctx.fillRect(4, 5, 6, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(5, 6, 1, 1);
    ctx.fillRect(8, 6, 1, 1);
    ctx.fillRect(5, 8, 4, 1);
    ctx.fillStyle = hat;
    ctx.fillRect(2, 9, 9, 3);
    ctx.fillStyle = overalls;
    ctx.fillRect(3, 12, 7, 3);
    ctx.fillRect(1, 13, 3, 3);
    ctx.fillRect(9, 13, 3, 3);
  }

  /**
   * Draw Goomba enemy
   */
  static drawGoomba(ctx: CanvasRenderingContext2D, x: number, y: number, state: 'walk' | 'flat', frame: number): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (state === 'flat') {
      ctx.fillStyle = SpriteRenderer.PALETTE.goombaBrown;
      ctx.fillRect(1, 10, 14, 4);
      ctx.fillStyle = SpriteRenderer.PALETTE.goombaSkin;
      ctx.fillRect(3, 12, 10, 2);
      ctx.fillStyle = '#000';
      ctx.fillRect(5, 11, 2, 1);
      ctx.fillRect(9, 11, 2, 1);
      ctx.restore();
      return;
    }

    // Mushroom Cap Head
    ctx.fillStyle = SpriteRenderer.PALETTE.goombaBrown;
    ctx.fillRect(4, 1, 8, 2);
    ctx.fillRect(2, 3, 12, 3);
    ctx.fillRect(1, 6, 14, 3);
    ctx.fillRect(0, 9, 16, 2);

    // Face
    ctx.fillStyle = SpriteRenderer.PALETTE.goombaSkin;
    ctx.fillRect(4, 8, 8, 4);

    // Eyebrows & Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(3, 7, 4, 1);
    ctx.fillRect(9, 7, 4, 1);
    ctx.fillRect(4, 8, 2, 3);
    ctx.fillRect(10, 8, 2, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, 9, 1, 2);
    ctx.fillRect(10, 9, 1, 2);

    // Teeth
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, 11, 1, 1);
    ctx.fillRect(10, 11, 1, 1);

    // Feet
    ctx.fillStyle = SpriteRenderer.PALETTE.goombaBlack;
    const isStep = Math.floor(frame) % 2 === 0;
    if (isStep) {
      ctx.fillRect(0, 12, 5, 4);
      ctx.fillRect(10, 13, 5, 3);
    } else {
      ctx.fillRect(1, 13, 5, 3);
      ctx.fillRect(11, 12, 5, 4);
    }

    ctx.restore();
  }

  /**
   * Draw Koopa Troopa enemy
   */
  static drawKoopa(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: number,
    state: 'walk' | 'shell' | 'shell_spin',
    frame: number,
    isRed = false
  ): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    const shellColor = isRed ? SpriteRenderer.PALETTE.koopaRed : SpriteRenderer.PALETTE.koopaGreen;

    if (state === 'shell' || state === 'shell_spin') {
      // Shell only (16x16)
      ctx.fillStyle = shellColor;
      ctx.fillRect(2, 3, 12, 10);
      ctx.fillRect(4, 1, 8, 14);

      ctx.fillStyle = '#fff';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = shellColor;
      ctx.fillRect(6, 6, 4, 4);

      if (state === 'shell_spin' && Math.floor(frame * 4) % 2 === 0) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(5, 5, 6, 6);
      }
      ctx.restore();
      return;
    }

    // Direction flip
    if (facing === 1) {
      ctx.scale(-1, 1);
      ctx.translate(-16, 0);
    }

    // Walking Koopa (16x24)
    // Head & Beak
    ctx.fillStyle = SpriteRenderer.PALETTE.koopaOrange;
    ctx.fillRect(1, 2, 7, 6);
    ctx.fillRect(0, 4, 3, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(4, 3, 3, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(5, 4, 2, 2);

    // Shell
    ctx.fillStyle = shellColor;
    ctx.fillRect(5, 8, 10, 10);
    ctx.fillRect(7, 7, 7, 12);
    ctx.fillStyle = '#fff';
    ctx.fillRect(8, 10, 5, 6);

    // Feet
    ctx.fillStyle = SpriteRenderer.PALETTE.koopaOrange;
    const isStep = Math.floor(frame) % 2 === 0;
    if (isStep) {
      ctx.fillRect(4, 18, 4, 6);
      ctx.fillRect(10, 20, 4, 4);
    } else {
      ctx.fillRect(4, 20, 4, 4);
      ctx.fillRect(10, 18, 4, 6);
    }

    ctx.restore();
  }

  /**
   * Draw Piranha Plant in pipe
   */
  static drawPiranhaPlant(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    const isOpen = Math.floor(frame * 3) % 2 === 0;

    // Stem
    ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenDark;
    ctx.fillRect(6, 12, 4, 12);

    // Head
    ctx.fillStyle = SpriteRenderer.PALETTE.marioRed;
    ctx.fillRect(2, 2, 12, 10);
    ctx.fillRect(4, 0, 8, 14);

    // White polka dots
    ctx.fillStyle = '#fff';
    ctx.fillRect(4, 3, 2, 2);
    ctx.fillRect(10, 3, 2, 2);
    ctx.fillRect(3, 8, 2, 2);
    ctx.fillRect(11, 8, 2, 2);

    // Mouth / Lips / Teeth
    ctx.fillStyle = '#fff';
    ctx.fillRect(1, 6, 14, isOpen ? 2 : 1);
    if (isOpen) {
      ctx.fillStyle = '#000';
      ctx.fillRect(3, 5, 10, 4);
      ctx.fillStyle = '#fff';
      // Sharp teeth
      ctx.fillRect(4, 5, 1, 1);
      ctx.fillRect(7, 5, 1, 1);
      ctx.fillRect(10, 5, 1, 1);
      ctx.fillRect(5, 8, 1, 1);
      ctx.fillRect(8, 8, 1, 1);
    }

    ctx.restore();
  }

  /**
   * Draw Bowser Boss
   */
  static drawBowser(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, frame: number, breathFire: boolean): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (facing === 1) {
      ctx.scale(-1, 1);
      ctx.translate(-32, 0);
    }

    // Bowser Body (32x32)
    // Spiky Shell
    ctx.fillStyle = SpriteRenderer.PALETTE.bowserGreen;
    ctx.fillRect(14, 4, 14, 20);
    ctx.fillStyle = '#fc7400';
    ctx.fillRect(12, 6, 4, 16);

    // Shell Spikes
    ctx.fillStyle = '#fff';
    ctx.fillRect(26, 6, 4, 3);
    ctx.fillRect(28, 12, 4, 3);
    ctx.fillRect(26, 18, 4, 3);

    // Head
    ctx.fillStyle = SpriteRenderer.PALETTE.bowserGreen;
    ctx.fillRect(4, 6, 12, 10);
    // Horns & Red Hair
    ctx.fillStyle = SpriteRenderer.PALETTE.marioRed;
    ctx.fillRect(8, 1, 8, 5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(14, 2, 3, 4);

    // Snout & Mouth
    ctx.fillStyle = SpriteRenderer.PALETTE.bowserOrange;
    ctx.fillRect(0, 10, 10, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(1, 12, 2, 2);
    ctx.fillRect(6, 12, 2, 2);

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(6, 6, 4, 3);
    ctx.fillStyle = '#d82800';
    ctx.fillRect(7, 7, 2, 2);

    // Feet & Belly
    ctx.fillStyle = SpriteRenderer.PALETTE.bowserYellow;
    ctx.fillRect(6, 18, 10, 8);
    ctx.fillRect(4, 26, 8, 6);
    ctx.fillRect(16, 26, 8, 6);

    // Claws
    ctx.fillStyle = '#fff';
    ctx.fillRect(2, 30, 4, 2);
    ctx.fillRect(14, 30, 4, 2);

    // Fire breath
    if (breathFire) {
      ctx.fillStyle = SpriteRenderer.PALETTE.lavaRed;
      ctx.fillRect(-16, 12, 16, 4);
      ctx.fillStyle = SpriteRenderer.PALETTE.lavaYellow;
      ctx.fillRect(-12, 13, 10, 2);
    }

    ctx.restore();
  }

  /**
   * Draw Power-up Items
   */
  static drawItem(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'mushroom' | '1up' | 'flower' | 'star' | 'coin', frame = 0): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (type === 'mushroom' || type === '1up') {
      const capColor = type === 'mushroom' ? SpriteRenderer.PALETTE.mushroomRed : SpriteRenderer.PALETTE.koopaGreen;
      // Cap
      ctx.fillStyle = capColor;
      ctx.fillRect(3, 1, 10, 2);
      ctx.fillRect(1, 3, 14, 6);
      // White spots
      ctx.fillStyle = SpriteRenderer.PALETTE.mushroomWhite;
      ctx.fillRect(6, 2, 4, 4);
      ctx.fillRect(2, 5, 2, 3);
      ctx.fillRect(12, 5, 2, 3);
      // Stem & Eyes
      ctx.fillStyle = SpriteRenderer.PALETTE.mushroomSkin;
      ctx.fillRect(4, 9, 8, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(5, 10, 1, 3);
      ctx.fillRect(10, 10, 1, 3);
    } else if (type === 'flower') {
      const colors = ['#fc7400', '#fc2800', '#f8b800'];
      const c = colors[Math.floor(frame * 8) % colors.length];
      // Petals
      ctx.fillStyle = c;
      ctx.fillRect(4, 1, 8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 3, 4, 4);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(7, 4, 2, 2);
      // Stem & leaves
      ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenLight;
      ctx.fillRect(7, 9, 2, 6);
      ctx.fillRect(4, 11, 3, 3);
      ctx.fillRect(9, 11, 3, 3);
    } else if (type === 'star') {
      const colors = ['#f8d800', '#fc7400', '#00a800', '#0058f8'];
      const c = colors[Math.floor(frame * 12) % colors.length];
      ctx.fillStyle = c;
      ctx.fillRect(6, 1, 4, 2);
      ctx.fillRect(2, 3, 12, 4);
      ctx.fillRect(1, 7, 14, 4);
      ctx.fillRect(3, 11, 10, 3);
      ctx.fillRect(2, 14, 4, 2);
      ctx.fillRect(10, 14, 4, 2);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(5, 5, 1, 3);
      ctx.fillRect(9, 5, 1, 3);
    } else if (type === 'coin') {
      const step = Math.floor(frame * 8) % 4;
      ctx.fillStyle = SpriteRenderer.PALETTE.coinYellow;
      if (step === 0) {
        ctx.fillRect(4, 2, 8, 12);
        ctx.fillStyle = SpriteRenderer.PALETTE.coinWhite;
        ctx.fillRect(6, 4, 2, 8);
      } else if (step === 1 || step === 3) {
        ctx.fillRect(6, 2, 4, 12);
        ctx.fillStyle = SpriteRenderer.PALETTE.coinWhite;
        ctx.fillRect(7, 4, 2, 8);
      } else {
        ctx.fillRect(7, 2, 2, 12);
      }
    }

    ctx.restore();
  }

  /**
   * Draw Fireball projectile
   */
  static drawFireball(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    const colors = ['#fc2800', '#fcb800', '#ffffff'];
    const step = Math.floor(frame * 10) % colors.length;
    ctx.fillStyle = colors[step];
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillStyle = colors[(step + 1) % colors.length];
    ctx.fillRect(2, 2, 4, 4);
    ctx.restore();
  }

  /**
   * Draw Level Tiles (16x16)
   */
  static drawTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: TileType,
    theme: 'overworld' | 'underground' | 'athletic' | 'castle',
    frame = 0,
    offsetY = 0
  ): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y) + offsetY);

    switch (type) {
      case TileType.GROUND: {
        if (theme === 'underground') {
          ctx.fillStyle = SpriteRenderer.PALETTE.undergroundBlue;
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = SpriteRenderer.PALETTE.undergroundCyan;
          ctx.fillRect(0, 0, 16, 2);
          ctx.fillRect(0, 0, 2, 16);
        } else if (theme === 'castle') {
          ctx.fillStyle = SpriteRenderer.PALETTE.castleGrey;
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = SpriteRenderer.PALETTE.castleDark;
          ctx.fillRect(0, 0, 16, 2);
          ctx.fillRect(0, 8, 16, 2);
          ctx.fillRect(7, 0, 2, 8);
          ctx.fillRect(0, 8, 2, 8);
        } else {
          // Overworld Ground
          ctx.fillStyle = SpriteRenderer.PALETTE.groundBrown;
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = SpriteRenderer.PALETTE.groundLight;
          ctx.fillRect(0, 0, 16, 2);
          ctx.fillRect(0, 0, 2, 16);
          ctx.fillStyle = SpriteRenderer.PALETTE.groundDark;
          ctx.fillRect(0, 14, 16, 2);
          ctx.fillRect(14, 0, 2, 16);
        }
        break;
      }
      case TileType.BRICK:
      case TileType.UNDERGROUND_BRICK: {
        const brickBg = (theme === 'underground' || type === TileType.UNDERGROUND_BRICK)
          ? SpriteRenderer.PALETTE.undergroundBlue
          : (theme === 'castle' ? SpriteRenderer.PALETTE.castleDark : SpriteRenderer.PALETTE.brickBrown);
        ctx.fillStyle = brickBg;
        ctx.fillRect(0, 0, 16, 16);
        // Mortar lines
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 7, 16, 2);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 8);
        ctx.fillRect(8, 0, 1, 8);
        ctx.fillRect(4, 8, 1, 8);
        ctx.fillRect(12, 8, 1, 8);
        break;
      }
      case TileType.QUESTION_COIN:
      case TileType.QUESTION_MUSHROOM:
      case TileType.QUESTION_FLOWER:
      case TileType.QUESTION_STAR:
      case TileType.QUESTION_1UP: {
        ctx.fillStyle = SpriteRenderer.PALETTE.questionYellow;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = SpriteRenderer.PALETTE.questionBrown;
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillRect(15, 0, 1, 16);
        // Corner rivets
        ctx.fillStyle = '#000';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(13, 2, 1, 1);
        ctx.fillRect(2, 13, 1, 1);
        ctx.fillRect(13, 13, 1, 1);
        // Question Mark
        ctx.fillStyle = SpriteRenderer.PALETTE.questionBrown;
        ctx.fillRect(5, 3, 6, 2);
        ctx.fillRect(9, 5, 2, 2);
        ctx.fillRect(7, 7, 2, 3);
        ctx.fillRect(7, 11, 2, 2);
        break;
      }
      case TileType.USED_BLOCK: {
        ctx.fillStyle = SpriteRenderer.PALETTE.usedGrey;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillRect(15, 0, 1, 16);
        // Rivets
        ctx.fillStyle = '#222';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(13, 2, 1, 1);
        ctx.fillRect(2, 13, 1, 1);
        ctx.fillRect(13, 13, 1, 1);
        break;
      }
      case TileType.HARD_BLOCK:
      case TileType.SOLID_BLOCK: {
        ctx.fillStyle = SpriteRenderer.PALETTE.groundBrown;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#fce4a0';
        ctx.fillRect(0, 0, 16, 2);
        ctx.fillRect(0, 0, 2, 16);
        ctx.fillStyle = '#000';
        ctx.fillRect(1, 14, 15, 2);
        ctx.fillRect(14, 1, 2, 15);
        break;
      }
      case TileType.PIPE_TOP_LEFT: {
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenDark;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenLight;
        ctx.fillRect(2, 1, 5, 15);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        break;
      }
      case TileType.PIPE_TOP_RIGHT: {
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenDark;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenLight;
        ctx.fillRect(0, 1, 3, 15);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(15, 0, 1, 16);
        break;
      }
      case TileType.PIPE_BODY_LEFT: {
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenDark;
        ctx.fillRect(2, 0, 14, 16);
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenLight;
        ctx.fillRect(4, 0, 5, 16);
        ctx.fillStyle = '#000';
        ctx.fillRect(2, 0, 1, 16);
        break;
      }
      case TileType.PIPE_BODY_RIGHT: {
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenDark;
        ctx.fillRect(0, 0, 14, 16);
        ctx.fillStyle = SpriteRenderer.PALETTE.pipeGreenLight;
        ctx.fillRect(1, 0, 3, 16);
        ctx.fillStyle = '#000';
        ctx.fillRect(13, 0, 1, 16);
        break;
      }
      case TileType.FLAG_POLE: {
        ctx.fillStyle = '#80d010';
        ctx.fillRect(7, 0, 2, 16);
        break;
      }
      case TileType.FLAG_TOP: {
        ctx.fillStyle = '#80d010';
        ctx.fillRect(7, 6, 2, 10);
        ctx.fillStyle = '#00a800';
        ctx.fillRect(5, 2, 6, 4);
        break;
      }
      case TileType.LAVA: {
        ctx.fillStyle = SpriteRenderer.PALETTE.lavaRed;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = SpriteRenderer.PALETTE.lavaYellow;
        ctx.fillRect(0, 0, 16, 4);
        const wave = Math.floor(frame * 4) % 2 === 0;
        ctx.fillRect(wave ? 0 : 4, 2, 8, 2);
        break;
      }
      case TileType.BRIDGE: {
        ctx.fillStyle = '#885818';
        ctx.fillRect(0, 4, 16, 8);
        ctx.fillStyle = '#442800';
        ctx.fillRect(0, 4, 16, 2);
        ctx.fillRect(4, 6, 2, 6);
        ctx.fillRect(12, 6, 2, 6);
        break;
      }
      case TileType.AXE: {
        ctx.fillStyle = SpriteRenderer.PALETTE.questionYellow;
        ctx.fillRect(4, 2, 8, 4);
        ctx.fillRect(2, 4, 12, 2);
        ctx.fillStyle = '#885818';
        ctx.fillRect(7, 6, 2, 10);
        break;
      }
      case TileType.CASTLE_DOOR: {
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 0, 12, 16);
        break;
      }
      default:
        break;
    }

    ctx.restore();
  }
}
