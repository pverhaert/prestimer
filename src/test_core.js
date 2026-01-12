import { Timer } from './core/Timer.js';
import { TimeChain } from './core/TimeChain.js';
import { AudioService } from './services/AudioService.js';

console.log('--- Starting Core Logic Test ---');

const audio = new AudioService();
const chain = new TimeChain(audio);

// Create 3 quick timers
const t1 = new Timer('1', 'Test 1', 3000);
const t2 = new Timer('2', 'Test 2', 2000);
const t3 = new Timer('3', 'Test 3', 1000);

chain.add(t1);
chain.add(t2);
chain.add(t3);

console.log('Added 3 timers. Chains count:', chain.count);

// Log ticks
t1.addEventListener('tick', (e) => console.log('T1 Tick:', e.detail.remaining));
t2.addEventListener('tick', (e) => console.log('T2 Tick:', e.detail.remaining));
t3.addEventListener('tick', (e) => console.log('T3 Tick:', e.detail.remaining));

console.log('Starting chain...');
chain.start();

// Expose to window for manual manipulation
window.testChain = chain;
window.testAudio = audio;
