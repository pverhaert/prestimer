export class TimerDisplay {
  constructor(element) {
    this.element = element;
    this.lastRenderKey = null;
    this.render({ remaining: 0, label: '', state: 'IDLE' });
  }

  formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  update(state) {
    // Only re-render if something changed
    const newKey = `${state.remaining}-${state.label}-${state.state}`;
    if (this.lastRenderKey === newKey) return;
    this.lastRenderKey = newKey;
    this.render(state);
  }

  render({ remaining, label, state }) {
    this.element.innerHTML = `
      <div class="flex flex-col items-center justify-center p-4">
        <div class="text-lg text-gray-600 dark:text-gray-400 mb-1 font-medium tracking-wide truncate max-w-[200px]">
          ${label || 'No Timer'}
        </div>
        <div style="font-family: 'JetBrains Mono', monospace;" class="text-6xl sm:text-7xl leading-none font-bold tracking-tighter ${state === 'RUNNING' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'} transition-colors duration-300">
          ${this.formatTime(remaining)}
        </div>
        <div class="mt-2 text-xs font-semibold uppercase tracking-widest ${state === 'RUNNING' ? 'text-indigo-500' : 'text-gray-500'}">
          ${state}
        </div>
      </div>
    `;
  }
}
