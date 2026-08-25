import { LevelConfig } from '../engine/types';
import {
  generateLevel1_1,
  generateLevel1_2,
  generateLevel1_3,
  generateLevel1_4
} from '../engine/level-data';

export const LEVELS_CONFIG: LevelConfig[] = [
  {
    id: '1-1',
    worldName: '1-1',
    name: 'World 1-1',
    title: 'GRASSY OVERWORLD',
    description: 'The legendary journey begins! Sprint across grassy plains, explore warp pipes, stomp Goombas, and jump to the flagpole.',
    theme: 'overworld',
    timeLimit: 400,
    backgroundColor: '#5c94fc',
    icon: '🍄',
    badge: 'CLASSIC',
    generate: generateLevel1_1
  },
  {
    id: '1-2',
    worldName: '1-2',
    name: 'World 1-2',
    title: 'UNDERGROUND CAVERN',
    description: 'Subterranean labyrinth with solid blue brick ceilings, tight corridors, piranha pipes, and hidden coin caches.',
    theme: 'underground',
    timeLimit: 400,
    backgroundColor: '#000000',
    icon: '⛏️',
    badge: 'UNDERGROUND',
    generate: generateLevel1_2
  },
  {
    id: '1-3',
    worldName: '1-3',
    name: 'World 1-3',
    title: 'ATHLETIC TREETOPS',
    description: 'High-altitude precision leaps across bouncing mushroom platforms with flying Koopas and perilous bottomless pits.',
    theme: 'athletic',
    timeLimit: 300,
    backgroundColor: '#5c94fc',
    icon: '🌲',
    badge: 'ATHLETIC',
    generate: generateLevel1_3
  },
  {
    id: '1-4',
    worldName: '1-4',
    name: 'World 1-4',
    title: "BOWSER'S CASTLE",
    description: "Infiltrate King Bowser's volcanic fortress! Dodge blazing lava, avoid fire-breath attacks, and sever the bridge with the golden Axe.",
    theme: 'castle',
    timeLimit: 300,
    backgroundColor: '#000000',
    icon: '🔥',
    badge: 'BOSS BATTLE',
    generate: generateLevel1_4
  }
];

export function getLevelConfig(index: number): LevelConfig {
  return LEVELS_CONFIG[index] || LEVELS_CONFIG[0];
}

export function getLevelConfigById(id: string): LevelConfig | undefined {
  return LEVELS_CONFIG.find(c => c.id === id);
}
