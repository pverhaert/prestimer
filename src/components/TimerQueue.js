import { Trash2 } from 'lucide';

export class TimerQueue {
    constructor(element, onDelete, onUpdate) {
        this.element = element;
        this.onDelete = onDelete;
        this.onUpdate = onUpdate; // New callback for updates
        this.timers = [];
        this.activeId = null;
        this.lastRenderKey = null;
    }

    update(timers, activeId) {
        // Always re-render if activeId changed
        const activeChanged = this.activeId !== activeId;

        // Create a key to detect other changes
        const newKey = JSON.stringify({
            ids: timers.map(t => t.id),
            labels: timers.map(t => t.label),
            durations: timers.map(t => t.duration),
        });

        // Re-render if active changed OR data changed
        if (!activeChanged && this.lastRenderKey === newKey) return;

        this.timers = timers;
        this.activeId = activeId;
        this.lastRenderKey = newKey;
        this.render();
    }

    formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    parseDuration(str) {
        const parts = str.split(':');
        if (parts.length === 2) {
            const min = parseInt(parts[0], 10) || 0;
            const sec = parseInt(parts[1], 10) || 0;
            return (min * 60 + sec) * 1000;
        }
        return 0;
    }

    render() {
        if (this.timers.length === 0) {
            this.element.innerHTML = '<div class="text-center text-gray-500 italic p-4">No timers in queue</div>';
            return;
        }

        this.element.innerHTML = `
      <div class="space-y-2 max-w-md mx-auto w-full">
        ${this.timers.map((timer, index) => {
            const isActive = timer.id === this.activeId;

            return `
            <div class="flex items-center justify-between p-3 rounded-lg border ${isActive ? 'bg-indigo-50 dark:bg-gray-800 border-indigo-500 ring-1 ring-indigo-500/50' : 'bg-gray-100 dark:bg-gray-900/50 border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700'} transition-all">
              <div class="flex items-center gap-3 overflow-hidden flex-1">
                <div class="text-sm font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} w-6 text-center flex-shrink-0">
                  ${index + 1}
                </div>
                <div class="flex flex-col overflow-hidden flex-1 gap-1">
                  <input 
                    type="text" 
                    data-id="${timer.id}" 
                    data-field="label"
                    value="${timer.label}" 
                    class="label-input font-medium bg-transparent border-0 border-b border-transparent hover:border-gray-400 dark:hover:border-gray-600 focus:border-indigo-500 focus:outline-none px-0 py-0.5 w-full ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}"
                  />
                  <input 
                    type="text" 
                    data-id="${timer.id}" 
                    data-field="duration"
                    value="${this.formatDuration(timer.duration)}" 
                    class="duration-input text-xs text-gray-500 font-mono bg-transparent border-0 border-b border-transparent hover:border-gray-400 dark:hover:border-gray-600 focus:border-indigo-500 focus:outline-none px-0 py-0.5 w-16"
                    placeholder="MM:SS"
                  />
                </div>
              </div>
              
              <button data-id="${timer.id}" class="delete-btn p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0" data-tooltip="Remove Timer" aria-label="Remove Timer">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

        this.attachListeners();
    }

    attachListeners() {
        // Delete buttons
        this.element.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (this.onDelete) this.onDelete(id);
            });
        });

        // Label inputs
        this.element.querySelectorAll('.label-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                const id = e.target.dataset.id;
                const newLabel = e.target.value.trim() || 'Untitled';
                if (this.onUpdate) this.onUpdate(id, 'label', newLabel);
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        });

        // Duration inputs
        this.element.querySelectorAll('.duration-input').forEach(input => {
            // Auto-format as user types (insert colon)
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits

                // Limit to 4 digits max
                if (value.length > 4) {
                    value = value.slice(0, 4);
                }

                // Auto-insert colon after 2 digits
                if (value.length > 2) {
                    value = value.slice(0, value.length - 2) + ':' + value.slice(-2);
                }

                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                const id = e.target.dataset.id;
                let value = e.target.value;

                // If no colon, treat as seconds only or auto-format
                if (!value.includes(':')) {
                    const digits = value.replace(/[^\d]/g, '');
                    if (digits.length <= 2) {
                        // Treat as seconds only
                        value = '00:' + digits.padStart(2, '0');
                    } else {
                        // Split into MM:SS
                        value = digits.slice(0, -2) + ':' + digits.slice(-2);
                    }
                    e.target.value = value;
                }

                const newDuration = this.parseDuration(value);
                if (newDuration > 0 && this.onUpdate) {
                    this.onUpdate(id, 'duration', newDuration);
                } else {
                    // Reset to original if invalid
                    const timer = this.timers.find(t => t.id === id);
                    if (timer) e.target.value = this.formatDuration(timer.duration);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        });
    }
}
