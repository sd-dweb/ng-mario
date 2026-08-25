import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../state/game-state.service';
import { GameState } from '../../engine/types';

@Component({
  selector: 'app-menu-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="menu-backdrop">
      <!-- Title Screen -->
      @if (gameStateService.gameState() === GameState.TITLE) {
        <div class="title-screen nes-panel">
          <div class="mario-logo">
            <h1 class="logo-super">SUPER</h1>
            <h1 class="logo-mario">MARIO</h1>
            <div class="logo-badge">ANGULAR 22 EDITION</div>
          </div>

          <div class="high-score-tag">
            TOP SCORE - {{ gameStateService.highScore().toString().padStart(6, '0') }}
          </div>

          <div class="menu-actions">
            <button class="nes-btn nes-btn-primary" (click)="startGame.emit(0)">
              ▶ 1 PLAYER GAME
            </button>
            <button class="nes-btn nes-btn-gold" (click)="showLevelSelect.set(true)">
              🗺️ SELECT LEVEL
            </button>
            <button class="nes-btn nes-btn-green" (click)="openEditor.emit()">
              🛠️ LEVEL BUILDER
            </button>
            <button class="nes-btn" (click)="showHelp.set(true)">
              ❓ HOW TO PLAY
            </button>
          </div>

          <div class="copyright-text">
            © 2026 ANGULAR SIGNALS GAME ENGINE
          </div>
        </div>
      }

      <!-- Pause Screen -->
      @if (gameStateService.gameState() === GameState.PAUSED) {
        <div class="pause-dialog nes-panel">
          <h2 class="dialog-title blink">PAUSED</h2>
          <div class="menu-actions">
            <button class="nes-btn nes-btn-green" (click)="resumeGame.emit()">
              CONTINUE
            </button>
            <button class="nes-btn nes-btn-primary" (click)="restartLevel.emit()">
              RESTART LEVEL
            </button>
            <button class="nes-btn" (click)="goToTitle.emit()">
              QUIT TO MENU
            </button>
          </div>
        </div>
      }

      <!-- Game Over Screen -->
      @if (gameStateService.gameState() === GameState.GAME_OVER) {
        <div class="game-over-dialog nes-panel">
          <h2 class="game-over-title">GAME OVER</h2>
          <p class="score-summary">FINAL SCORE: {{ gameStateService.formattedScore() }}</p>
          <div class="menu-actions">
            <button class="nes-btn nes-btn-primary" (click)="restartGame.emit()">
              🔄 TRY AGAIN
            </button>
            <button class="nes-btn" (click)="goToTitle.emit()">
              🏠 MAIN MENU
            </button>
          </div>
        </div>
      }

      <!-- Victory Screen (Bowser Defeated) -->
      @if (gameStateService.gameState() === GameState.VICTORY) {
        <div class="victory-dialog nes-panel">
          <div class="fireworks-anim">🎆 ✨ 👑 ✨ 🎆</div>
          <h2 class="victory-title">CONGRATULATIONS!</h2>
          <p class="peach-quote">"THANK YOU MARIO! YOUR QUEST IS OVER. WE PRESENT YOU A NEW PEACE!"</p>
          <div class="victory-stats">
            <div>SCORE: {{ gameStateService.formattedScore() }}</div>
            <div>COINS: {{ gameStateService.formattedCoins() }}</div>
          </div>
          <div class="menu-actions">
            <button class="nes-btn nes-btn-gold" (click)="goToTitle.emit()">
              PLAY AGAIN
            </button>
          </div>
        </div>
      }

      <!-- Level Select Modal -->
      @if (showLevelSelect()) {
        <div class="modal-overlay">
          <div class="modal-content nes-panel">
            <h3 class="modal-title">SELECT WORLD</h3>
            <div class="level-grid">
              <button class="nes-btn level-btn" (click)="onSelectLevel(0)">
                <span class="level-tag">WORLD 1-1</span>
                <span class="level-desc">GRASSY OVERWORLD</span>
              </button>
              <button class="nes-btn level-btn" (click)="onSelectLevel(1)">
                <span class="level-tag">WORLD 1-2</span>
                <span class="level-desc">UNDERGROUND CAVERN</span>
              </button>
              <button class="nes-btn level-btn" (click)="onSelectLevel(2)">
                <span class="level-tag">WORLD 1-3</span>
                <span class="level-desc">ATHLETIC TREETOPS</span>
              </button>
              <button class="nes-btn level-btn nes-btn-primary" (click)="onSelectLevel(3)">
                <span class="level-tag">WORLD 1-4</span>
                <span class="level-desc">BOWSER'S CASTLE 🔥</span>
              </button>
            </div>
            <button class="nes-btn close-btn" (click)="showLevelSelect.set(false)">
              BACK
            </button>
          </div>
        </div>
      }

      <!-- How to Play Modal -->
      @if (showHelp()) {
        <div class="modal-overlay">
          <div class="modal-content nes-panel help-content">
            <h3 class="modal-title">CONTROLS & HOW TO PLAY</h3>
            <div class="controls-guide">
              <div class="guide-row">
                <span class="guide-key">⬅️ ➡️ / A, D</span>
                <span class="guide-action">Move Left / Right</span>
              </div>
              <div class="guide-row">
                <span class="guide-key">⬇️ / S</span>
                <span class="guide-action">Crouch / Enter Pipes</span>
              </div>
              <div class="guide-row">
                <span class="guide-key">Z / SPACE / A-BTN</span>
                <span class="guide-action">Jump (Hold to jump higher)</span>
              </div>
              <div class="guide-row">
                <span class="guide-key">X / SHIFT / B-BTN</span>
                <span class="guide-action">Sprint / Throw Fireballs</span>
              </div>
              <div class="guide-row">
                <span class="guide-key">P / ESC</span>
                <span class="guide-action">Pause Game</span>
              </div>
            </div>

            <div class="mechanics-guide">
              <p>🍄 <b>Mushroom</b>: Grow into Super Mario & break bricks</p>
              <p>🔥 <b>Fire Flower</b>: Shoot fireballs to defeat enemies</p>
              <p>⭐ <b>Super Star</b>: Temporary invincibility</p>
              <p>🐢 <b>Koopa Shell</b>: Stomp & kick shell into enemies!</p>
            </div>

            <button class="nes-btn close-btn" (click)="showHelp.set(false)">
              CLOSE
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .menu-backdrop {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.75);
      z-index: 20;
      padding: 16px;
    }

    .title-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }

    .mario-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .logo-super {
      color: #ffd700;
      font-size: 18px;
      letter-spacing: 4px;
      text-shadow: 2px 2px #d82800, 4px 4px #000;
    }

    .logo-mario {
      color: #d82800;
      font-size: 32px;
      letter-spacing: 6px;
      text-shadow: 3px 3px #ffd700, 6px 6px #000;
    }

    .logo-badge {
      background: #0058f8;
      color: #fff;
      font-size: 9px;
      padding: 4px 10px;
      border: 2px solid #fff;
      margin-top: 4px;
      letter-spacing: 1px;
    }

    .high-score-tag {
      font-size: 10px;
      color: #f8b800;
      letter-spacing: 1px;
    }

    .menu-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 280px;
    }

    .copyright-text {
      font-size: 8px;
      color: #777;
    }

    .pause-dialog, .game-over-dialog, .victory-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .dialog-title {
      color: #ffd700;
      font-size: 20px;
    }

    .game-over-title {
      color: #d82800;
      font-size: 24px;
      letter-spacing: 3px;
    }

    .score-summary {
      font-size: 12px;
      color: #fff;
    }

    .victory-title {
      color: #ffd700;
      font-size: 18px;
      letter-spacing: 2px;
    }

    .fireworks-anim {
      font-size: 22px;
    }

    .peach-quote {
      font-size: 10px;
      line-height: 1.6;
      color: #fce4a0;
      background: #222;
      padding: 10px;
      border: 2px solid #555;
    }

    .victory-stats {
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: #00a800;
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 30;
      padding: 16px;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      max-width: 520px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-title {
      color: #ffd700;
      font-size: 14px;
      text-align: center;
    }

    .level-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 100%;
    }

    .level-btn {
      flex-direction: column;
      align-items: flex-start;
      padding: 12px 10px;
      text-align: left;
    }

    .level-tag {
      font-size: 11px;
      color: #ffd700;
      margin-bottom: 4px;
    }

    .level-desc {
      font-size: 8px;
      color: #ddd;
    }

    .help-content {
      max-width: 560px;
    }

    .controls-guide {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      font-size: 9px;
    }

    .guide-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1a1a24;
      padding: 6px 10px;
      border: 1px solid #444;
    }

    .guide-key {
      color: #ffd700;
      font-weight: bold;
    }

    .guide-action {
      color: #fff;
    }

    .mechanics-guide {
      font-size: 9px;
      line-height: 1.6;
      background: #111;
      padding: 10px;
      border: 1px solid #333;
      width: 100%;
      text-align: left;
    }

    .close-btn {
      margin-top: 6px;
      width: 100%;
      max-width: 180px;
    }

    @media (max-width: 500px) {
      .level-grid {
        grid-template-columns: 1fr;
      }
      .logo-mario {
        font-size: 24px;
      }
    }
  `]
})
export class MenuOverlayComponent {
  public gameStateService = inject(GameStateService);
  public GameState = GameState;

  public startGame = output<number>();
  public resumeGame = output<void>();
  public restartLevel = output<void>();
  public restartGame = output<void>();
  public goToTitle = output<void>();
  public openEditor = output<void>();

  public showLevelSelect = signal<boolean>(false);
  public showHelp = signal<boolean>(false);

  public onSelectLevel(index: number): void {
    this.showLevelSelect.set(false);
    this.startGame.emit(index);
  }
}
