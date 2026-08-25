import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controls-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="virtual-gamepad">
      <!-- D-Pad (Left side) -->
      <div class="dpad-container">
        <div class="dpad">
          <button 
            class="dpad-btn dpad-up" 
            (pointerdown)="onBtnDown('up')" 
            (pointerup)="onBtnUp('up')" 
            (pointercancel)="onBtnUp('up')">
            ▲
          </button>
          <div class="dpad-middle">
            <button 
              class="dpad-btn dpad-left" 
              (pointerdown)="onBtnDown('left')" 
              (pointerup)="onBtnUp('left')" 
              (pointercancel)="onBtnUp('left')">
              ◀
            </button>
            <div class="dpad-center"></div>
            <button 
              class="dpad-btn dpad-right" 
              (pointerdown)="onBtnDown('right')" 
              (pointerup)="onBtnUp('right')" 
              (pointercancel)="onBtnUp('right')">
              ▶
            </button>
          </div>
          <button 
            class="dpad-btn dpad-down" 
            (pointerdown)="onBtnDown('down')" 
            (pointerup)="onBtnUp('down')" 
            (pointercancel)="onBtnUp('down')">
            ▼
          </button>
        </div>
      </div>

      <!-- Action Buttons (Right side: B & A) -->
      <div class="actions-container">
        <div class="action-btn-wrapper">
          <button 
            class="action-btn btn-b" 
            (pointerdown)="onBtnDown('run'); onBtnDown('fire')" 
            (pointerup)="onBtnUp('run'); onBtnUp('fire')" 
            (pointercancel)="onBtnUp('run'); onBtnUp('fire')">
            B
          </button>
          <span class="btn-label">RUN/FIRE</span>
        </div>
        <div class="action-btn-wrapper">
          <button 
            class="action-btn btn-a" 
            (pointerdown)="onBtnDown('jump')" 
            (pointerup)="onBtnUp('jump')" 
            (pointercancel)="onBtnUp('jump')">
            A
          </button>
          <span class="btn-label">JUMP</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .virtual-gamepad {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: none;
      padding: 10px 24px;
      background: rgba(10, 10, 15, 0.95);
      border-top: 2px solid #222;
      touch-action: none;
    }

    /* D-Pad */
    .dpad-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dpad {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dpad-middle {
      display: flex;
      align-items: center;
    }

    .dpad-btn {
      width: 44px;
      height: 44px;
      background: #2a2a35;
      color: #fff;
      border: 2px solid #555;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
    }

    .dpad-btn:active {
      background: #e45c10;
      border-color: #ffd700;
    }

    .dpad-center {
      width: 44px;
      height: 44px;
      background: #1a1a22;
      border: 1px solid #333;
    }

    /* Action Buttons */
    .actions-container {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .action-btn-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .action-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #d82800;
      color: #fff;
      border: 3px solid #ffd700;
      font-family: inherit;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 0 #800;
      user-select: none;
      touch-action: manipulation;
    }

    .action-btn:active {
      transform: translateY(3px);
      box-shadow: 0 1px 0 #800;
      background: #ff451a;
    }

    .btn-b {
      background: #d82800;
    }

    .btn-a {
      background: #00a800;
      border-color: #fff;
      box-shadow: 0 4px 0 #005000;
    }
    .btn-a:active {
      box-shadow: 0 1px 0 #005000;
    }

    .btn-label {
      font-size: 8px;
      color: #aaa;
    }

    @media (max-width: 600px) {
      .virtual-gamepad {
        padding: 8px 12px;
      }
      .dpad-btn, .dpad-center {
        width: 38px;
        height: 38px;
      }
      .action-btn {
        width: 44px;
        height: 44px;
        font-size: 13px;
      }
    }
  `]
})
export class ControlsOverlayComponent {
  public buttonChange = output<{ key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'fire'; pressed: boolean }>();

  public onBtnDown(key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'fire'): void {
    this.buttonChange.emit({ key, pressed: true });
  }

  public onBtnUp(key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'fire'): void {
    this.buttonChange.emit({ key, pressed: false });
  }
}
