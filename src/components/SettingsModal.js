import { Moon, Sun, Volume2, VolumeX, AlertTriangle, Mic } from 'lucide';

export class SettingsModal {
  constructor(state, onChange, onClose, audioService) {
    this.state = state; // { theme, muted, warningSeconds, voiceEnabled, selectedVoice }
    this.onChange = onChange;
    this.onClose = onClose;
    this.audioService = audioService; // Need access to get voices

    // Ensure defaults
    if (this.state.warningSeconds === undefined) this.state.warningSeconds = 5;
    if (this.state.voiceEnabled === undefined) this.state.voiceEnabled = false;
  }

  render(container) {
    const isDark = this.state.theme === 'dark';
    const isMuted = this.state.muted;
    const warningSeconds = this.state.warningSeconds || 5;
    const voiceEnabled = this.state.voiceEnabled;

    // Get voices
    const voices = this.audioService ? this.audioService.getVoices() : [];

    container.innerHTML = `
      <div class="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
          <button id="settings-close" class="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">Close</button>
        </div>
        
        <div class="space-y-4">
          <!-- Theme Toggle -->
          <div class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-indigo-500 dark:text-indigo-400">
                <i data-lucide="${isDark ? 'moon' : 'sun'}" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Appearance</div>
                <div class="text-xs text-gray-500">${isDark ? 'Dark Mode' : 'Light Mode'}</div>
              </div>
            </div>
            <button id="toggle-theme" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-gray-400'}">
              <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition ${isDark ? 'translate-x-6' : 'translate-x-1'}"/>
            </button>
          </div>

          <!-- Mute Toggle -->
          <div class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-pink-500">
                <i data-lucide="${isMuted ? 'volume-x' : 'volume-2'}" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Sound Effects</div>
                <div class="text-xs text-gray-500">${isMuted ? 'Muted' : 'Enabled'}</div>
              </div>
            </div>
            <button id="toggle-mute" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isMuted ? 'bg-indigo-600' : 'bg-gray-400'}">
              <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition ${!isMuted ? 'translate-x-6' : 'translate-x-1'}"/>
            </button>
          </div>

          <!-- Voice Announcements -->
          <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-purple-500">
                  <i data-lucide="mic" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Voice Announcements</div>
                  <div class="text-xs text-gray-500">Speak timer updates</div>
                </div>
              </div>
              <button id="toggle-voice" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${voiceEnabled ? 'bg-indigo-600' : 'bg-gray-400'}">
                <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition ${voiceEnabled ? 'translate-x-6' : 'translate-x-1'}"/>
              </button>
            </div>

            ${voiceEnabled ? `
            <div class="pl-12 pt-0 animation-fade-in">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Voice Selection</label>
                <select id="voice-select" class="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                   ${voices.map(v => `<option value="${v.name}" ${this.state.selectedVoice === v.name ? 'selected' : ''}>${v.name}</option>`).join('')}
                </select>
            </div>
            ` : ''}
          </div>

          <!-- Warning Seconds -->
          <div class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-orange-500">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Warning Alert</div>
                <div class="text-xs text-gray-500">Warn before timer ends</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input 
                type="number" 
                id="warning-seconds" 
                value="${warningSeconds}" 
                min="0" 
                max="60"
                class="w-16 px-2 py-1 text-center text-sm font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-xs text-gray-500">sec</span>
            </div>
          </div>
        </div>

        <div class="pt-2 text-center">
          <p class="text-xs text-gray-400">Sequential Presentation Timer v1.1</p>
        </div>
      </div>
    `;

    // Listeners
    container.querySelector('#settings-close').addEventListener('click', () => this.onClose());

    container.querySelector('#toggle-theme').addEventListener('click', () => {
      const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
      this.state.theme = newTheme;
      this.onChange('theme', newTheme);
      this.render(container);
    });

    container.querySelector('#toggle-mute').addEventListener('click', () => {
      const newMuted = !this.state.muted;
      this.state.muted = newMuted;
      this.onChange('muted', newMuted);
      this.render(container);
    });

    container.querySelector('#warning-seconds').addEventListener('change', (e) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0 && value <= 60) {
        this.state.warningSeconds = value;
        this.onChange('warningSeconds', value);
      }
    });

    // Voice Toggle
    container.querySelector('#toggle-voice').addEventListener('click', () => {
      const newState = !this.state.voiceEnabled;
      this.state.voiceEnabled = newState;
      this.onChange('voiceEnabled', newState);
      this.render(container);
    });

    // Voice Selection
    const voiceSelect = container.querySelector('#voice-select');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        this.state.selectedVoice = e.target.value;
        this.onChange('selectedVoice', e.target.value);
      });
    }
  }
}
