import { expose } from 'comlink';
import { GameEngine } from './engine';

const engine = new GameEngine();
expose(engine);

export type { GameEngine };
