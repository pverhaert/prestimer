import { playBeep, playCompletion } from '../utils/beep.js';

/**
 * Service for handling audio feedback using Web Audio API.
 * Uses synthesized sounds to avoid external dependencies.
 */
export class AudioService {
    constructor() {
        this.audioCtx = null;
        this.muted = false;
        // Context is initialized lazily or explicitly via resumeContext()
    }

    initAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
    }

    /**
     * Must be called on user interaction (search 'AutoPlay Policy')
     */
    async resumeContext() {
        this.initAudioContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    /**
     * Plays a short beep for timer transition.
     */
    async playTransition() {
        if (this.muted) return;
        await this.resumeContext();
        playBeep(this.audioCtx);
    }

    /**
     * Plays a longer sequence for final completion.
     */
    async playCompletion() {
        if (this.muted) return;
        await this.resumeContext();
        playCompletion(this.audioCtx); // Function name conflict handled by import alias or direct call if names match
    }
}
