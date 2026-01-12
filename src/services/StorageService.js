const STORAGE_KEY_QUEUE = 'pres_timer_queue';
const STORAGE_KEY_SETTINGS = 'pres_timer_settings';

export const StorageService = {
    saveQueue(timers) {
        const data = timers.map(t => ({
            id: t.id,
            label: t.label,
            duration: t.duration
        }));
        try {
            localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(data));
        } catch (e) {
            console.error('Save failed', e);
        }
    },

    loadQueue() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_QUEUE);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Load failed', e);
            return null;
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error('Settings save failed', e);
        }
    },

    loadSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
            // Default settings
            const defaults = { theme: 'dark', muted: false };
            return data ? { ...defaults, ...JSON.parse(data) } : defaults;
        } catch (e) {
            return { theme: 'dark', muted: false };
        }
    }
};
