import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngine } from '../../engine/game-engine';
import { GameStateService } from '../../state/game-state.service';
import { AudioService } from '../../audio/audio.service';
import { GameState, LevelData } from '../../engine/types';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-wrapper">
      <canvas 
        #gameCanvas 
        width="256" 
        height="240" 
        class="nes-canvas">
      </canvas>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      flex: 1;
      overflow: hidden;
    }

    .canvas-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      flex: 1;
      position: relative;
      background: #000000;
      overflow: hidden;
    }

    .nes-canvas {
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
      aspect-ratio: 256 / 240;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      background: #000000;
    }
  `]
})
export class GameCanvasComponent implements OnInit, OnDestroy {
  public gameCanvas = viewChild<ElementRef<HTMLCanvasElement>>('gameCanvas');

  public gameStateService = inject(GameStateService);
  public audioService = inject(AudioService);

  public engine: GameEngine | null = null;

  ngOnInit(): void {
    setTimeout(() => this.initEngine(), 50);
  }

  ngOnDestroy(): void {
    if (this.engine) {
      this.engine.stop();
    }
  }

  private initEngine(): void {
    const canvas = this.gameCanvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Crisp pixelated canvas settings
    ctx.imageSmoothingEnabled = false;

    this.engine = new GameEngine(canvas, ctx, this.gameStateService, this.audioService);
  }

  public startLevel(levelIndex = 0, customData: LevelData | null = null): void {
    if (!this.engine) {
      this.initEngine();
    }
    if (this.engine) {
      this.engine.startLevel(levelIndex, customData);
    }
  }

  public setInputKey(key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'fire', pressed: boolean): void {
    if (this.engine) {
      this.engine.keys[key] = pressed;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.engine) return;

    this.audioService.unlockAudio();

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.engine.keys.left = true;
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.engine.keys.right = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.engine.keys.down = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.engine.keys.up = true;
        event.preventDefault();
        break;
      case 'KeyZ':
      case 'Space':
        this.engine.keys.jump = true;
        event.preventDefault();
        break;
      case 'KeyX':
      case 'ShiftLeft':
      case 'ShiftRight':
        this.engine.keys.run = true;
        this.engine.keys.fire = true;
        event.preventDefault();
        break;
      case 'KeyP':
      case 'Escape':
        if (this.gameStateService.gameState() === GameState.PLAYING) {
          this.gameStateService.setGameState(GameState.PAUSED);
          this.audioService.stopMusic();
        } else if (this.gameStateService.gameState() === GameState.PAUSED) {
          this.gameStateService.setGameState(GameState.PLAYING);
          this.engine.resumeStandardBgm();
        }
        event.preventDefault();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (!this.engine) return;

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.engine.keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.engine.keys.right = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.engine.keys.down = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.engine.keys.up = false;
        break;
      case 'KeyZ':
      case 'Space':
        this.engine.keys.jump = false;
        break;
      case 'KeyX':
      case 'ShiftLeft':
      case 'ShiftRight':
        this.engine.keys.run = false;
        this.engine.keys.fire = false;
        break;
    }
  }
}
