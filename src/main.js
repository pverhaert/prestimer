import './index.css';
import { createIcons, Timer, RotateCcw, Play, Pause, SkipForward, Trash2, Settings2, Plus, Moon, Sun, Volume2, VolumeX, AlertTriangle, Mic } from 'lucide';
import { TimeChain } from './core/TimeChain.js';
import { Timer as TimerModel } from './core/Timer.js';
import { AudioService } from './services/AudioService.js';
import { StorageService } from './services/StorageService.js';
import { TimerDisplay } from './components/TimerDisplay.js';
import { TimerQueue } from './components/TimerQueue.js';
import { Controls } from './components/Controls.js';
import { Modal } from './components/Modal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { Tooltip } from './components/Tooltip.js';

// --- Initialization ---

// Services
const audioService = new AudioService();
const timeChain = new TimeChain(audioService);

// Load Settings
const savedSettings = StorageService.loadSettings();

// Apply Audio Settings
if (savedSettings.muted) audioService.muted = true;
if (savedSettings.voiceEnabled) audioService.setVoiceEnabled(true);

// Apply Theme
if (savedSettings.theme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

// Ensure voice is set once voices are loaded (handled by AudioService internal init but we set preference)
if (savedSettings.selectedVoice) {
  audioService.setVoice(savedSettings.selectedVoice);
}

// Load Queue
const savedQueue = StorageService.loadQueue();
if (savedQueue && savedQueue.length > 0) {
  savedQueue.forEach(t => {
    addTimerToChain(new TimerModel(t.id, t.label, t.duration));
  });
} else {
  // Defaults
  addTimerToChain(new TimerModel(crypto.randomUUID(), 'Introduction', 10 * 1000));
  addTimerToChain(new TimerModel(crypto.randomUUID(), 'Main Topic', 20 * 1000));
}

// Components
const tooltip = new Tooltip();
const modal = new Modal(document.querySelector('#modal-root'));
const timerDisplay = new TimerDisplay(document.querySelector('#timer-display-container'));

// TimerQueue with onDelete and onUpdate callbacks
const timerQueue = new TimerQueue(
  document.querySelector('#queue-container'),
  // onDelete
  (id) => {
    timeChain.remove(id);
    saveData();
    updateQueueUI();
  },
  // onUpdate (for inline editing)
  (id, field, value) => {
    const timer = timeChain.getAllTimers().find(t => t.id === id);
    if (timer) {
      if (field === 'label') {
        timer.label = value;
      } else if (field === 'duration') {
        timer.duration = value;
        timer.remaining = value; // Reset remaining to new duration
      }
      saveData();
      updateFullUI();
    }
  }
);

const controls = new Controls(document.querySelector('#controls-container'), {
  onStart: async () => {
    await audioService.resumeContext();
    const activeLabel = timeChain.activeNode ? timeChain.activeNode.timer.label : null;
    timeChain.start();
    // Speak start if enabled
    if (activeLabel) {
      audioService.playStart(activeLabel);
    }

    controls.updateState('RUNNING');
    refreshIcons();
    updateTimerDisplayOnly();
  },
  onPause: () => {
    timeChain.pause();
    controls.updateState('PAUSED');
    refreshIcons();
    updateTimerDisplayOnly();
  },
  onSkip: () => {
    timeChain.skip();
    updateFullUI();
  },
  onReset: () => {
    timeChain.resetAll();
    updateFullUI();
  }
});

// --- Helper Functions ---

function addTimerToChain(timer) {
  // Listen to tick events for real-time display updates
  timer.addEventListener('tick', () => {
    updateTimerDisplayOnly();
  });

  // Listen to complete events
  // Use setTimeout to ensure TimeChain's handler runs first (changes activeNode)
  timer.addEventListener('complete', () => {
    setTimeout(() => updateFullUI(), 0);
  });

  timeChain.add(timer);
}

function saveData() {
  StorageService.saveQueue(timeChain.getAllTimers());
}

function refreshIcons() {
  try {
    createIcons({
      icons: { Timer, RotateCcw, Play, Pause, SkipForward, Trash2, Settings2, Plus, Moon, Sun, Volume2, VolumeX, AlertTriangle, Mic }
    });
  } catch (e) {
    // ignore
  }
}

// Flash overlay element
const flashOverlay = document.getElementById('flash-overlay');

// Warning overlay element
const warningOverlay = document.getElementById('warning-overlay');

// State to prevent repeating warning
let warningSpoken = false;

// Only update the timer display (called on every tick)
function updateTimerDisplayOnly() {
  const activeNode = timeChain.activeNode;
  const currentTimer = activeNode ? activeNode.timer : null;

  if (currentTimer) {
    timerDisplay.update({
      remaining: currentTimer.remaining,
      label: currentTimer.label,
      state: currentTimer.state
    });

    // Warning effect logic
    const warningSeconds = savedSettings.warningSeconds || 5;
    const remainingSeconds = Math.ceil(currentTimer.remaining / 1000);

    if (currentTimer.state === 'RUNNING') {
      // Overlay (Red Pulse)
      if (remainingSeconds <= warningSeconds && remainingSeconds > 0) {
        warningOverlay.classList.add('warning-active');
      } else {
        warningOverlay.classList.remove('warning-active');
      }

      // Voice Warning + Yellow Flash
      if (remainingSeconds === warningSeconds && !warningSpoken && remainingSeconds > 0) {
        warningSpoken = true;
        audioService.playWarning(`${warningSeconds} seconds remaining`);

        // Trigger yellow flash on dedicated overlay
        flashOverlay.classList.add('flash-warning');
        // Remove class after animation (1s) to allow re-triggering
        setTimeout(() => {
          flashOverlay.classList.remove('flash-warning');
        }, 1000);
      }
    } else {
      warningOverlay.classList.remove('warning-active');
      flashOverlay.classList.remove('flash-warning');
    }

    // Reset warning flag if redundant (e.g. paused or reset)
    if (currentTimer.state !== 'RUNNING' || remainingSeconds > warningSeconds) {
      warningSpoken = false;
    }

  } else {
    timerDisplay.update({ remaining: 0, label: 'Finished', state: 'COMPLETED' });
    warningOverlay.classList.remove('warning-active');
    warningSpoken = false;
  }
}

// Update queue UI only
function updateQueueUI() {
  const activeNode = timeChain.activeNode;
  const currentTimer = activeNode ? activeNode.timer : null;
  timerQueue.update(timeChain.getAllTimers(), currentTimer ? currentTimer.id : null);
  refreshIcons();
}

// Full UI update (for major state changes like skip, reset, add timer)
function updateFullUI() {
  const activeNode = timeChain.activeNode;
  const currentTimer = activeNode ? activeNode.timer : null;

  // Display
  updateTimerDisplayOnly();

  // Controls
  const isRunning = currentTimer && currentTimer.state === 'RUNNING';
  controls.updateState(isRunning ? 'RUNNING' : 'PAUSED');

  // Queue
  updateQueueUI();
}

// --- Event Listeners ---

// Add Timer Button - Now adds default timer directly (no popup)
const btnAdd = document.querySelector('#btn-add-timer');
if (btnAdd) {
  btnAdd.addEventListener('click', () => {
    const timerCount = timeChain.getAllTimers().length + 1;
    const newTimer = new TimerModel(
      crypto.randomUUID(),
      `Timer ${timerCount}`,
      5 * 60 * 1000 // 5 minutes default
    );
    addTimerToChain(newTimer);
    saveData();
    updateFullUI();
  });
}

// Settings Button
const btnSettings = document.querySelector('#btn-settings');
if (btnSettings) {
  btnSettings.addEventListener('click', () => {
    modal.open(new SettingsModal(
      savedSettings,
      (key, value) => {
        savedSettings[key] = value;

        if (key === 'muted') audioService.muted = value;
        if (key === 'voiceEnabled') audioService.setVoiceEnabled(value);
        if (key === 'selectedVoice') audioService.setVoice(value);

        if (key === 'theme') {
          if (value === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        StorageService.saveSettings(savedSettings);
        setTimeout(() => refreshIcons(), 0);
      },
      () => modal.close(),
      audioService // Pass service to modal for voice list
    ), () => { });

    setTimeout(() => refreshIcons(), 0);
  });
}

// Initial UI render
updateFullUI();
console.log('✅ Initial UI rendered');

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registered'))
      .catch(err => console.error('❌ SW registration failed:', err));
  });
}
