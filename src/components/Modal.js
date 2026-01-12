export class Modal {
    constructor(element) {
        this.element = element;
        this.isOpen = false;
        this.content = null;
        this.onClose = null;
        this.render();
    }

    open(contentComponent, onClose) {
        this.isOpen = true;
        this.content = contentComponent;
        this.onClose = onClose;
        this.render();

        // Trigger fade-in animation after a small delay
        requestAnimationFrame(() => {
            const overlay = this.element.querySelector('.modal-overlay');
            const panel = this.element.querySelector('.modal-panel');
            if (overlay) overlay.classList.add('opacity-100');
            if (panel) panel.classList.add('opacity-100', 'scale-100');
        });
    }

    close() {
        // Trigger fade-out animation
        const overlay = this.element.querySelector('.modal-overlay');
        const panel = this.element.querySelector('.modal-panel');

        if (overlay) overlay.classList.remove('opacity-100');
        if (panel) panel.classList.remove('opacity-100', 'scale-100');

        // Wait for animation to complete before hiding
        setTimeout(() => {
            this.isOpen = false;
            this.content = null;
            if (this.onClose) this.onClose();
            this.onClose = null;
            this.render();
        }, 200);
    }

    render() {
        if (!this.isOpen) {
            this.element.innerHTML = '';
            this.element.classList.add('hidden');
            return;
        }

        this.element.classList.remove('hidden');
        this.element.innerHTML = `
      <div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0 transition-opacity duration-200">
        <div class="modal-panel bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden opacity-0 scale-95 transition-all duration-200">
          <div id="modal-content"></div>
        </div>
      </div>
    `;

        // Render content
        const contentContainer = this.element.querySelector('#modal-content');
        if (this.content && typeof this.content.render === 'function') {
            this.content.render(contentContainer);
        }

        // Close on backdrop click
        const overlay = this.element.querySelector('.modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });
    }
}
