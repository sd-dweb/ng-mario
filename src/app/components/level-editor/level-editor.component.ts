import { Component, ElementRef, OnInit, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LevelData, TileType } from '../../engine/types';
import { SpriteRenderer } from '../../engine/sprites';

@Component({
  selector: 'app-level-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="editor-container">
      <div class="editor-header nes-panel">
        <h2 class="editor-title">🛠️ LEVEL BUILDER</h2>
        <div class="header-actions">
          <button class="nes-btn nes-btn-green" (click)="playCustomLevel()">
            ▶ TEST PLAY
          </button>
          <button class="nes-btn nes-btn-primary" (click)="clearLevel()">
            🗑️ CLEAR
          </button>
          <button class="nes-btn" (click)="closeEditor.emit()">
            ❌ EXIT
          </button>
        </div>
      </div>

      <div class="editor-body">
        <!-- Palette Toolbar -->
        <div class="palette-sidebar nes-panel">
          <h3 class="sidebar-title">PALETTE</h3>
          <div class="palette-grid">
            @for (tool of tools; track tool.id) {
              <button 
                class="tool-btn" 
                [class.active]="selectedTool() === tool.id" 
                (click)="selectedTool.set(tool.id)">
                <span class="tool-icon">{{ tool.icon }}</span>
                <span class="tool-name">{{ tool.name }}</span>
              </button>
            }
          </div>

          <div class="theme-selector">
            <label>THEME:</label>
            <select (change)="onThemeChange($event)" class="theme-dropdown">
              <option value="overworld">Overworld</option>
              <option value="underground">Underground</option>
              <option value="athletic">Athletic</option>
              <option value="castle">Castle</option>
            </select>
          </div>
        </div>

        <!-- Editor Canvas Viewport -->
        <div class="canvas-viewport" #viewport>
          <canvas 
            #editorCanvas 
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp()"
            (pointerleave)="onPointerUp()">
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      background: #111118;
      padding: 10px;
      gap: 10px;
      overflow: hidden;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
    }

    .editor-title {
      font-size: 14px;
      color: #ffd700;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .editor-body {
      display: flex;
      flex: 1;
      gap: 10px;
      overflow: hidden;
    }

    .palette-sidebar {
      width: 220px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      padding: 12px;
    }

    .sidebar-title {
      font-size: 10px;
      color: #ffd700;
      text-align: center;
    }

    .palette-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .tool-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: #222;
      border: 2px solid #555;
      padding: 8px 4px;
      color: #fff;
      font-family: inherit;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.1s;
    }

    .tool-btn.active {
      border-color: #ffd700;
      background: #e45c10;
    }

    .tool-icon {
      font-size: 16px;
    }

    .tool-name {
      font-size: 7px;
      text-transform: uppercase;
      text-align: center;
    }

    .theme-selector {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 9px;
      color: #ffd700;
    }

    .theme-dropdown {
      background: #222;
      color: #fff;
      border: 2px solid #555;
      padding: 6px;
      font-family: inherit;
      font-size: 9px;
    }

    .canvas-viewport {
      flex: 1;
      overflow: auto;
      background: #000;
      border: 4px solid #fff;
      display: flex;
    }

    canvas {
      image-rendering: pixelated;
      cursor: crosshair;
    }
  `]
})
export class LevelEditorComponent implements OnInit {
  public editorCanvas = viewChild<ElementRef<HTMLCanvasElement>>('editorCanvas');
  public viewport = viewChild<ElementRef<HTMLDivElement>>('viewport');

  public testLevel = output<LevelData>();
  public closeEditor = output<void>();

  public selectedTool = signal<string>('ground');
  public theme = signal<'overworld' | 'underground' | 'athletic' | 'castle'>('overworld');

  private isDrawing = false;
  private cols = 100;
  private rows = 15;
  private tiles: number[][] = [];
  private enemies: Array<{ type: 'goomba' | 'koopa' | 'piranha' | 'bowser'; x: number; y: number }> = [];
  private flagpoleX = 90 * 16;

  public tools = [
    { id: 'erase', name: 'Eraser', icon: '🧹' },
    { id: 'ground', name: 'Ground', icon: '🟫' },
    { id: 'brick', name: 'Brick', icon: '🧱' },
    { id: 'question_coin', name: '? Coin', icon: '❓' },
    { id: 'question_shroom', name: '? Shroom', icon: '🍄' },
    { id: 'question_star', name: '? Star', icon: '⭐' },
    { id: 'solid', name: 'Solid', icon: '⬛' },
    { id: 'pipe', name: 'Pipe', icon: '🟩' },
    { id: 'goomba', name: 'Goomba', icon: '🌰' },
    { id: 'koopa', name: 'Koopa', icon: '🐢' },
    { id: 'bowser', name: 'Bowser', icon: '🐲' },
    { id: 'flagpole', name: 'Flagpole', icon: '🚩' }
  ];

  ngOnInit(): void {
    this.initGrid();
    setTimeout(() => this.drawCanvas(), 50);
  }

  private initGrid(): void {
    this.tiles = [];
    for (let r = 0; r < this.rows; r++) {
      this.tiles[r] = new Array(this.cols).fill(TileType.EMPTY);
    }
    // Default floor
    for (let c = 0; c < this.cols; c++) {
      this.tiles[13][c] = TileType.GROUND;
      this.tiles[14][c] = TileType.GROUND;
    }
    // Flagpole default
    this.flagpoleX = (this.cols - 10) * 16;
    this.tiles[2][this.cols - 10] = TileType.FLAG_TOP;
    for (let r = 3; r <= 12; r++) {
      this.tiles[r][this.cols - 10] = TileType.FLAG_POLE;
    }
  }

  public clearLevel(): void {
    this.initGrid();
    this.enemies = [];
    this.drawCanvas();
  }

  public onThemeChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value as any;
    this.theme.set(val);
    this.drawCanvas();
  }

  public onPointerDown(e: PointerEvent): void {
    this.isDrawing = true;
    this.paintAt(e);
  }

  public onPointerMove(e: PointerEvent): void {
    if (this.isDrawing) {
      this.paintAt(e);
    }
  }

  public onPointerUp(): void {
    this.isDrawing = false;
  }

  private paintAt(e: PointerEvent): void {
    const canvas = this.editorCanvas()?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / 16);
    const row = Math.floor(y / 16);

    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;

    const tool = this.selectedTool();

    if (tool === 'erase') {
      this.tiles[row][col] = TileType.EMPTY;
      this.enemies = this.enemies.filter(en => Math.floor(en.x / 16) !== col || Math.floor(en.y / 16) !== row);
    } else if (tool === 'ground') {
      this.tiles[row][col] = TileType.GROUND;
    } else if (tool === 'brick') {
      this.tiles[row][col] = TileType.BRICK;
    } else if (tool === 'question_coin') {
      this.tiles[row][col] = TileType.QUESTION_COIN;
    } else if (tool === 'question_shroom') {
      this.tiles[row][col] = TileType.QUESTION_MUSHROOM;
    } else if (tool === 'question_star') {
      this.tiles[row][col] = TileType.QUESTION_STAR;
    } else if (tool === 'solid') {
      this.tiles[row][col] = TileType.SOLID_BLOCK;
    } else if (tool === 'pipe') {
      if (row < this.rows - 1 && col < this.cols - 1) {
        this.tiles[row][col] = TileType.PIPE_TOP_LEFT;
        this.tiles[row][col + 1] = TileType.PIPE_TOP_RIGHT;
        for (let r = row + 1; r < this.rows; r++) {
          this.tiles[r][col] = TileType.PIPE_BODY_LEFT;
          this.tiles[r][col + 1] = TileType.PIPE_BODY_RIGHT;
        }
      }
    } else if (tool === 'goomba') {
      this.enemies.push({ type: 'goomba', x: col * 16, y: row * 16 });
    } else if (tool === 'koopa') {
      this.enemies.push({ type: 'koopa', x: col * 16, y: (row - 1) * 16 });
    } else if (tool === 'bowser') {
      this.enemies.push({ type: 'bowser', x: col * 16, y: (row - 1) * 16 });
    } else if (tool === 'flagpole') {
      this.flagpoleX = col * 16;
      for (let r = 0; r < this.rows; r++) {
        if (this.tiles[r][col] === TileType.FLAG_POLE || this.tiles[r][col] === TileType.FLAG_TOP) {
          this.tiles[r][col] = TileType.EMPTY;
        }
      }
      this.tiles[2][col] = TileType.FLAG_TOP;
      for (let r = 3; r <= 12; r++) {
        this.tiles[r][col] = TileType.FLAG_POLE;
      }
    }

    this.drawCanvas();
  }

  private drawCanvas(): void {
    const canvas = this.editorCanvas()?.nativeElement;
    if (!canvas) return;

    canvas.width = this.cols * 16;
    canvas.height = this.rows * 16;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgColors: Record<string, string> = {
      overworld: '#5c94fc',
      underground: '#000000',
      athletic: '#5c94fc',
      castle: '#000000'
    };

    ctx.fillStyle = bgColors[this.theme()];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * 16, 0);
      ctx.lineTo(c * 16, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * 16);
      ctx.lineTo(canvas.width, r * 16);
      ctx.stroke();
    }

    // Draw Tiles
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.tiles[r][c];
        if (t !== TileType.EMPTY) {
          SpriteRenderer.drawTile(ctx, c * 16, r * 16, t, this.theme());
        }
      }
    }

    // Draw Enemies
    this.enemies.forEach(e => {
      if (e.type === 'goomba') {
        SpriteRenderer.drawGoomba(ctx, e.x, e.y, 'walk', 0);
      } else if (e.type === 'koopa') {
        SpriteRenderer.drawKoopa(ctx, e.x, e.y, -1, 'walk', 0);
      } else if (e.type === 'bowser') {
        SpriteRenderer.drawBowser(ctx, e.x, e.y, -1, 0, false);
      }
    });
  }

  public playCustomLevel(): void {
    const customData: LevelData = {
      id: 'custom',
      name: 'Custom Level',
      worldName: 'CUSTOM',
      timeLimit: 400,
      backgroundColor: this.theme() === 'castle' || this.theme() === 'underground' ? '#000000' : '#5c94fc',
      theme: this.theme(),
      width: this.cols * 16,
      height: this.rows * 16,
      tiles: JSON.parse(JSON.stringify(this.tiles)),
      spawn: { x: 40, y: 190 },
      flagpoleX: this.flagpoleX,
      enemies: [...this.enemies]
    };
    this.testLevel.emit(customData);
  }
}
