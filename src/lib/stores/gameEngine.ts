import { wrap } from 'comlink';
import type { GameEngine } from '../../worker/main';

const worker = new Worker(new URL('../../worker/main.ts', import.meta.url), {
    type: 'module'
});

export const engine = wrap<GameEngine>(worker);
