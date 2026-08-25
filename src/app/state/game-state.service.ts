import { Injectable, computed, signal } from '@angular/core';
import { GameState, MarioPower } from '../engine/types';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  // Signals State
  public score = signal<number>(0);
  public coins = signal<number>(0);
  public lives = signal<number>(3);
  public time = signal<number>(400);
  public world = signal<string>('1-1');
  public gameState = signal<GameState>(GameState.TITLE);
  public marioPower = signal<MarioPower>(MarioPower.SMALL);
  public highScore = signal<number>(this.loadHighScore());
  public currentLevelIndex = signal<number>(0);
  public isCustomLevel = signal<boolean>(false);

  // Computed Signals
  public formattedScore = computed(() => {
    return this.score().toString().padStart(6, '0');
  });

  public formattedCoins = computed(() => {
    return this.coins().toString().padStart(2, '0');
  });

  public formattedTime = computed(() => {
    return Math.max(0, Math.floor(this.time())).toString().padStart(3, '0');
  });

  public isGameOver = computed(() => {
    return this.gameState() === GameState.GAME_OVER;
  });

  public isVictory = computed(() => {
    return this.gameState() === GameState.VICTORY;
  });

  public isPlaying = computed(() => {
    return this.gameState() === GameState.PLAYING;
  });

  public isPaused = computed(() => {
    return this.gameState() === GameState.PAUSED;
  });

  public addScore(points: number): void {
    const newScore = this.score() + points;
    this.score.set(newScore);
    if (newScore > this.highScore()) {
      this.highScore.set(newScore);
      this.saveHighScore(newScore);
    }
  }

  public addCoin(): void {
    const newCoins = this.coins() + 1;
    if (newCoins >= 100) {
      this.coins.set(newCoins - 100);
      this.gainLife();
    } else {
      this.coins.set(newCoins);
    }
    this.addScore(200);
  }

  public setTime(t: number): void {
    this.time.set(t);
  }

  public decrementTime(dt = 1): void {
    const cur = this.time();
    if (cur > 0) {
      this.time.set(Math.max(0, cur - dt));
    }
  }

  public loseLife(): number {
    const remaining = this.lives() - 1;
    this.lives.set(Math.max(0, remaining));
    return remaining;
  }

  public gainLife(): void {
    this.lives.update(l => l + 1);
  }

  public setMarioPower(power: MarioPower): void {
    this.marioPower.set(power);
  }

  public setGameState(state: GameState): void {
    this.gameState.set(state);
  }

  public setLevel(index: number, worldName: string): void {
    this.currentLevelIndex.set(index);
    this.world.set(worldName);
  }

  public resetGame(): void {
    this.score.set(0);
    this.coins.set(0);
    this.lives.set(3);
    this.time.set(400);
    this.marioPower.set(MarioPower.SMALL);
    this.currentLevelIndex.set(0);
    this.world.set('1-1');
  }

  private loadHighScore(): number {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('ng_mario_high_score');
      return val ? parseInt(val, 10) : 0;
    }
    return 0;
  }

  private saveHighScore(score: number): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('ng_mario_high_score', score.toString());
      } catch (e) {
        // Storage failure fallback
      }
    }
  }
}
