import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../state/game-state.service';
import { AudioService } from '../../audio/audio.service';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="hud-container">
      <div class="hud-item score-box">
        <div class="hud-label">MARIO</div>
        <div class="hud-val">{{ gameStateService.formattedScore() }}</div>
      </div>

      <div class="hud-item coin-box">
        <span class="coin-bounce coin-icon">🪙</span>
        <span class="hud-val">x{{ gameStateService.formattedCoins() }}</span>
      </div>

      <div class="hud-item world-box">
        <div class="hud-label">WORLD</div>
        <div class="hud-val">{{ gameStateService.world() }}</div>
      </div>

      <div class="hud-item time-box">
        <div class="hud-label">TIME</div>
        <div class="hud-val" [class.danger]="gameStateService.time() <= 50">
          {{ gameStateService.formattedTime() }}
        </div>
      </div>

      <div class="hud-item lives-box">
        <span class="heart-icon">❤️</span>
        <span class="hud-val">x{{ gameStateService.lives() }}</span>
      </div>

      <div class="hud-controls">
        <button 
          class="hud-btn" 
          (click)="toggleSound()" 
          [title]="audioService.soundEnabled() ? 'Mute Sound' : 'Enable Sound'">
          {{ audioService.soundEnabled() ? '🔊' : '🔇' }}
        </button>
        <button 
          class="hud-btn" 
          (click)="toggleMusic()" 
          [title]="audioService.musicEnabled() ? 'Mute Music' : 'Enable Music'">
          {{ audioService.musicEnabled() ? '🎵' : '⏹️' }}
        </button>
        <button 
          class="hud-btn" 
          (click)="toggleGamepad.emit()" 
          title="Toggle Virtual Gamepad">
          🎮
        </button>
        <button 
          class="hud-btn" 
          (click)="toggleFullscreen.emit()" 
          title="Toggle Fullscreen">
          ⛶
        </button>
        <button class="hud-btn menu-btn" (click)="openMenu.emit()" title="Menu">
          ☰
        </button>
      </div>
    </header>
  `,
  styles: [`
    .hud-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: none;
      padding: 8px 16px;
      background: #000000;
      border-bottom: 2px solid #222222;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
      font-size: 11px;
      letter-spacing: 1px;
      z-index: 10;
    }

    .hud-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .hud-label {
      color: #ffd700;
      font-size: 9px;
    }

    .hud-val {
      color: #ffffff;
      font-weight: bold;
    }

    .coin-box, .lives-box {
      flex-direction: row;
      gap: 5px;
      align-items: center;
    }

    .coin-icon {
      font-size: 12px;
    }

    .heart-icon {
      font-size: 12px;
    }

    .danger {
      color: #ff3333;
      animation: blink 0.5s infinite;
    }

    .hud-controls {
      display: flex;
      gap: 6px;
    }

    .hud-btn {
      background: #222;
      color: #fff;
      border: 2px solid #555;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.15s;
    }

    .hud-btn:hover {
      background: #444;
      border-color: #ffd700;
    }

    .menu-btn {
      font-family: inherit;
      font-weight: bold;
    }

    @media (max-width: 600px) {
      .hud-container {
        font-size: 8px;
        padding: 6px 8px;
      }
      .hud-label {
        font-size: 7px;
      }
      .hud-btn {
        padding: 2px 5px;
        font-size: 10px;
      }
    }
  `]
})
export class HudComponent {
  public gameStateService = inject(GameStateService);
  public audioService = inject(AudioService);
  public openMenu = output<void>();
  public toggleGamepad = output<void>();
  public toggleFullscreen = output<void>();

  public toggleSound(): void {
    this.audioService.toggleSound();
  }

  public toggleMusic(): void {
    this.audioService.toggleMusic();
  }
}
