/**
 * Play a standard transition beep.
 * @param {AudioContext} audioCtx 
 */
export function playBeep(audioCtx) {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

/**
 * Play a completion sequence (Arpeggio).
 * @param {AudioContext} audioCtx 
 */
export function playCompletion(audioCtx) {
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // Arpeggio
    playNote(audioCtx, 523.25, now, 0.2);       // C5
    playNote(audioCtx, 659.25, now + 0.2, 0.2); // E5
    playNote(audioCtx, 783.99, now + 0.4, 0.4); // G5
    playNote(audioCtx, 1046.50, now + 0.8, 0.6); // C6
}

function playNote(audioCtx, freq, time, duration) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(0.1, time);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(time);
    oscillator.stop(time + duration);
}
