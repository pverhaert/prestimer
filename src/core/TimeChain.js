/**
 * Node for the Doubly Linked List
 */
class TimerNode {
    constructor(timer) {
        this.timer = timer;
        this.next = null;
        this.prev = null;
    }
}

/**
 * Manages the sequence of timers using a Doubly Linked List.
 */
export class TimeChain {
    constructor(audioService) {
        this.head = null;
        this.tail = null;
        this.activeNode = null;
        this.audioService = audioService;
        this.count = 0;
        this.isChainCompleted = false; // Flag to track if all timers finished
    }

    /**
     * Adds a timer to the end of the chain.
     * @param {Timer} timer 
     */
    add(timer) {
        const newNode = new TimerNode(timer);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.activeNode = newNode; // Auto-select first added
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }

        this.count++;

        // Listen for completion to trigger next
        timer.addEventListener('complete', () => this.onTimerComplete(newNode));

        return newNode;
    }

    /**
     * Removes a timer by ID.
     * @param {string} id 
     */
    remove(id) {
        let current = this.head;
        while (current) {
            if (current.timer.id === id) {
                // If removing active node, stop it first
                if (current === this.activeNode) {
                    current.timer.pause();
                    this.activeNode = current.next || current.prev; // Try next, then prev
                }

                // Logic to remove node
                if (current.prev) {
                    current.prev.next = current.next;
                } else {
                    this.head = current.next;
                }

                if (current.next) {
                    current.next.prev = current.prev;
                } else {
                    this.tail = current.prev;
                }

                this.count--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    /**
     * Starts the current active timer.
     * If chain is completed, auto-reset and start from beginning.
     */
    start() {
        // If chain was completed, auto-reset and restart
        if (this.isChainCompleted) {
            this.resetAll();
        }

        if (this.activeNode) {
            this.activeNode.timer.start();
        }
    }

    /**
     * Pauses the current active timer.
     */
    pause() {
        if (this.activeNode) {
            this.activeNode.timer.pause();
        }
    }

    /**
     * Skips to the next timer.
     */
    skip() {
        if (this.activeNode) {
            this.activeNode.timer.reset(); // Reset current back to start or 0? Usually just stop.
            // Actually, skip usually implies "done with this one".
            // Let's reset it to 0 so it looks "done" or just reset to full duration but not active?
            // Requirement says: "Forces current to 0 (or skips it)"
            // Let's just pause current and move next.
            this.activeNode.timer.pause();

            if (this.activeNode.next) {
                this.activeNode = this.activeNode.next;
                // Optionally auto-start next?
                // Requirement 5 in User Feature Flow: "Timer 2 starts automatically" (on completion).
                // For manual skip: "Triggers the next timer". This implies auto-start.
                this.start();
            } else {
                // End of list
                this.audioService.playCompletion();
            }
        }
    }

    resetAll() {
        let current = this.head;
        while (current) {
            current.timer.reset();
            current = current.next;
        }
        this.activeNode = this.head;
        this.isChainCompleted = false; // Clear completion flag
    }

    onTimerComplete(node) {
        // Only act if this is indeed the active node (sanity check)
        if (node !== this.activeNode) return;

        if (node.next) {
            // Pass next timer's label for TTS
            this.audioService.playTransition(node.next.timer.label);
            this.activeNode = node.next;
            this.activeNode.timer.start();
        } else {
            // Last timer completed - mark chain as finished
            this.isChainCompleted = true;
            this.audioService.playCompletion();
        }
    }

    /**
     * Returns array of timers for UI rendering
     */
    getAllTimers() {
        const timers = [];
        let current = this.head;
        while (current) {
            timers.push(current.timer);
            current = current.next;
        }
        return timers;
    }
}
