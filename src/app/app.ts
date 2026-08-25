import { Component, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HudComponent } from './components/hud/hud.component';
import { GameCanvasComponent } from './components/game-canvas/game-canvas.component';
import { ControlsOverlayComponent } from './components/controls-overlay/controls-overlay.component';
import { MenuOverlayComponent } from './components/menu-overlay/menu-overlay.component';
import { LevelEditorComponent } from './components/level-editor/level-editor.component';
import { GameStateService } from './state/game-state.service';
import { AudioService } from './audio/audio.service';
import { GameState, LevelData } from './engine/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HudComponent,
    GameCanvasComponent,
    ControlsOverlayComponent,
    MenuOverlayComponent,
    LevelEditorComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public gameStateService = inject(GameStateService);
  public audioService = inject(AudioService);

  public gameCanvas = viewChild(GameCanvasComponent);

  public inEditor = signal<boolean>(false);
  public showGamepad = signal<boolean>(true);
  public GameState = GameState;

  public onStartGame(levelIndex = 0): void {
    this.inEditor.set(false);
    this.audioService.unlockAudio();
    this.gameCanvas()?.startLevel(levelIndex);
  }

  public onResumeGame(): void {
    this.gameStateService.setGameState(GameState.PLAYING);
    this.gameCanvas()?.engine?.resumeStandardBgm();
  }

  public onRestartLevel(): void {
    this.audioService.unlockAudio();
    this.gameCanvas()?.startLevel(this.gameStateService.currentLevelIndex());
  }

  public onRestartGame(): void {
    this.gameStateService.resetGame();
    this.onStartGame(0);
  }

  public onGoToTitle(): void {
    this.inEditor.set(false);
    this.gameStateService.setGameState(GameState.TITLE);
    this.audioService.stopMusic();
  }

  public onOpenEditor(): void {
    this.audioService.stopMusic();
    this.inEditor.set(true);
  }

  public onCloseEditor(): void {
    this.inEditor.set(false);
    this.gameStateService.setGameState(GameState.TITLE);
  }

  public onTestCustomLevel(data: LevelData): void {
    this.inEditor.set(false);
    this.audioService.unlockAudio();
    this.gameCanvas()?.startLevel(0, data);
  }

  public onButtonChange(event: { key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'fire'; pressed: boolean }): void {
    this.audioService.unlockAudio();
    this.gameCanvas()?.setInputKey(event.key, event.pressed);
  }

  public onToggleGamepad(): void {
    this.showGamepad.update(v => !v);
  }

  public onToggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
}

