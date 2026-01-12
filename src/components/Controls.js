export class Controls {
  constructor(element, callbacks) {
    this.element = element;
    this.callbacks = callbacks; // { onStart, onPause, onSkip, onReset }
    this.state = 'IDLE'; // IDLE, RUNNING, PAUSED
    this.lastRenderedState = null;
    this.render();
  }

  updateState(state) {
    // Only re-render if state actually changed
    if (this.state === state) return;
    this.state = state;
    this.render();
  }

  render() {
    // Skip if already rendered this state
    if (this.lastRenderedState === this.state) return;
    this.lastRenderedState = this.state;

    const isRunning = this.state === 'RUNNING';

    // Button Base Classes
    const btnBase = "p-4 rounded-full transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryBtn = `${btnBase} bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:scale-95`;
    const secondaryBtn = `${btnBase} bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-95`;

    this.element.innerHTML = `
      <div class="flex items-center justify-center gap-6">
        <button id="btn-reset" class="${secondaryBtn}" data-tooltip="Reset Sequence" aria-label="Reset Sequence">
          <i data-lucide="rotate-ccw" class="w-6 h-6"></i>
        </button>

        ${isRunning ? `
          <button id="btn-pause" class="${primaryBtn} w-16 h-16" data-tooltip="Pause" aria-label="Pause">
            <i data-lucide="pause" class="w-8 h-8 fill-current"></i>
          </button>
        ` : `
          <button id="btn-start" class="${primaryBtn} w-16 h-16" data-tooltip="Start" aria-label="Start">
            <i data-lucide="play" class="w-8 h-8 fill-current pl-1"></i>
          </button>
        `}

        <button id="btn-skip" class="${secondaryBtn}" data-tooltip="Skip to Next" aria-label="Skip to Next">
          <i data-lucide="skip-forward" class="w-6 h-6"></i>
        </button>
      </div>
    `;

    this.attachListeners();
  }

  attachListeners() {
    const startBtn = this.element.querySelector('#btn-start');
    const pauseBtn = this.element.querySelector('#btn-pause');
    const skipBtn = this.element.querySelector('#btn-skip');
    const resetBtn = this.element.querySelector('#btn-reset');

    if (startBtn) startBtn.addEventListener('click', () => this.callbacks.onStart?.());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.callbacks.onPause?.());
    skipBtn?.addEventListener('click', () => this.callbacks.onSkip?.());
    resetBtn?.addEventListener('click', () => this.callbacks.onReset?.());
  }
}
