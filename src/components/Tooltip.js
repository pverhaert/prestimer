
export class Tooltip {
    constructor() {
        this.init();
        this.addListeners();
    }

    init() {
        // Create tooltip element
        this.element = document.createElement('div');
        this.element.className = `
      fixed z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 
      rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 
      transform -translate-x-1/2 translate-y-2
    `;
        this.element.style.top = '0';
        this.element.style.left = '0';
        document.body.appendChild(this.element);
    }

    addListeners() {
        let showTimeout;

        document.body.addEventListener('mouseenter', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (!target) return;

            const text = target.getAttribute('data-tooltip');
            if (!text) return;

            // Clear any pending hide
            clearTimeout(this.hideTimeout);

            // Small delay prevents flickering when moving fast
            showTimeout = setTimeout(() => {
                this.show(target, text);
            }, 100);

        }, true); // Use capture to ensure we catch it

        document.body.addEventListener('mouseleave', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (!target) return;

            clearTimeout(showTimeout);
            this.hide();
        }, true);

        // Also handle focus/blur for accessibility (keyboard users) - though standard tooltips don't always appear on focus, nice ones do
        document.body.addEventListener('focusin', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.show(target, target.getAttribute('data-tooltip'));
            }
        });

        document.body.addEventListener('focusout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hide();
            }
        });
    }

    show(target, text) {
        this.element.textContent = text;

        const rect = target.getBoundingClientRect();
        const tooltipRect = this.element.getBoundingClientRect();

        let top = rect.top - tooltipRect.height - 8; // Default: 8px above
        let left = rect.left + (rect.width / 2);

        // Check if off screen top
        if (top < 0) {
            top = rect.bottom + 8; // Move to bottom
        }

        // Check if off screen left/right
        if (left - (tooltipRect.width / 2) < 0) {
            // Too far left, shift right
            left = 8 + (tooltipRect.width / 2);
        } else if (left + (tooltipRect.width / 2) > window.innerWidth) {
            // Too far right, shift left
            left = window.innerWidth - 8 - (tooltipRect.width / 2);
        }

        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;

        // Removing translate-y-2 to move into place
        this.element.classList.remove('opacity-0', 'translate-y-2');
    }

    hide() {
        this.element.classList.add('opacity-0', 'translate-y-2');
    }
}
