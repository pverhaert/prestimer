export class AddTimerForm {
    constructor(onSubmit, onCancel) {
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
    }

    render(container) {
        container.innerHTML = `
      <div class="p-6 space-y-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          New Timer
        </h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-gray-400 mb-1">Label</label>
            <input type="text" id="input-label" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" placeholder="e.g. Q&A Session" autofocus>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-gray-400 mb-1">Minutes</label>
              <input type="number" id="input-min" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" min="0">
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-gray-400 mb-1">Seconds</label>
              <input type="number" id="input-sec" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" min="0" max="59">
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-4">
          <button id="btn-cancel" class="flex-1 py-3 px-4 rounded-lg bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button id="btn-submit" class="flex-1 py-3 px-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all">
            Add Timer
          </button>
        </div>
      </div>
    `;

        // Focus input
        setTimeout(() => {
            container.querySelector('#input-label').focus();
        }, 50);

        // Listeners
        container.querySelector('#btn-cancel').addEventListener('click', () => this.onCancel());

        container.querySelector('#btn-submit').addEventListener('click', () => this.submit(container));

        // Enter key support
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submit(container);
            if (e.key === 'Escape') this.onCancel();
        });
    }

    submit(container) {
        const label = container.querySelector('#input-label').value.trim() || 'Untitled';
        const min = parseInt(container.querySelector('#input-min').value) || 0;
        const sec = parseInt(container.querySelector('#input-sec').value) || 0;

        const totalMs = ((min * 60) + sec) * 1000;

        if (totalMs <= 0) {
            // flash error? for now just ignore
            return;
        }

        this.onSubmit({ label, duration: totalMs });
    }
}
