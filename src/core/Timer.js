/**
 * Represents a single timer instance.
 * Extends EventTarget to emit 'tick' and 'complete' events.
 */
export class Timer extends EventTarget {
    constructor(id, label, duration) {
        super();
        this.id = id;
        this.label = label;
        this.duration = duration; // Total duration in ms
        this.remaining = duration;
        this.state = 'IDLE'; // IDLE, RUNNING, PAUSED, COMPLETED
        this.startTime = null;
        this.rafId = null;
        this.lastTick = null;
    }

    start() {
        if (this.state === 'COMPLETED') return;
        if (this.state === 'RUNNING') return;

        this.state = 'RUNNING';
        this.lastTick = performance.now();
        this._tick();
    }

    pause() {
        if (this.state !== 'RUNNING') return;
        this.state = 'PAUSED';
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    reset() {
        this.pause();
        this.state = 'IDLE';
        this.remaining = this.duration;
        this.dispatchEvent(new CustomEvent('tick', { detail: { remaining: this.remaining } }));
    }

    complete() {
        this.pause();
        this.state = 'COMPLETED';
        this.remaining = 0;
        this.dispatchEvent(new CustomEvent('tick', { detail: { remaining: 0 } }));
        this.dispatchEvent(new CustomEvent('complete'));
    }

    _tick() {
        if (this.state !== 'RUNNING') return;

        const now = performance.now();
        const delta = now - this.lastTick;
        this.lastTick = now;

        this.remaining = Math.max(0, this.remaining - delta);

        this.dispatchEvent(new CustomEvent('tick', { detail: { remaining: this.remaining } }));

        if (this.remaining <= 0) {
            this.complete();
        } else {
            this.rafId = requestAnimationFrame(() => this._tick());
        }
    }

    /**
     * Sets duration and resets timer.
     * @param {number} ms 
     */
    setDuration(ms) {
        this.duration = ms;
        this.reset();
    }
}
