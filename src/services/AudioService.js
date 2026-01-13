import { playBeep, playCompletion } from '../utils/beep.js';

/**
 * Service for handling audio feedback using Web Audio API.
 * Uses synthesized sounds to avoid external dependencies.
 */
export class AudioService {
    constructor() {
        this.audioCtx = null;
        this.muted = false;

        // TTS Properties
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.voiceEnabled = false; // Master toggle for TTS

        // Load voices immediately if possible, or wait for event
        this.initSpeech();
    }

    initAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
    }

    initSpeech() {
        if (this.synth) {
            const loadVoices = () => {
                this.voices = this.synth.getVoices();
                // Try to auto-select a good English voice if none selected
                if (!this.selectedVoice && this.voices.length > 0) {
                    this.selectedVoice = this.voices.find(v => v.name.includes('Google US English')) ||
                        this.voices.find(v => v.lang.startsWith('en')) ||
                        this.voices[0];
                }
            };

            // Voices loading is async in some browsers
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = loadVoices;
            }
            loadVoices();
        }
    }

    /**
     * Get all available voices
     */
    getVoices() {
        return this.voices;
    }

    /**
     * Set specific voice by name
     */
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.selectedVoice = voice;
        }
    }

    setVoiceEnabled(enabled) {
        this.voiceEnabled = enabled;
    }

    /**
     * Speak text using TTS
     */
    speak(text) {
        if (this.muted || !this.voiceEnabled || !this.synth) return;

        // Cancel any pending speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        this.synth.speak(utterance);
    }

    /**
     * Must be called on user interaction (search 'AutoPlay Policy')
     */
    async resumeContext() {
        this.initAudioContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        // Also cancel any ongoing speech if muting
        if (this.muted && this.synth) {
            this.synth.cancel();
        }
        return this.muted;
    }

    /**
     * Get localized text based on selected voice language
     */
    getText(key, replacements = {}) {
        const langCode = this.selectedVoice ? this.selectedVoice.lang.split('-')[0] : 'en';

        const TRANSLATIONS = {
            en: {
                start: "Starting {label}",
                warning: "{seconds} seconds remaining",
                finished: "Presentation finished"
            },
            nl: {
                start: "Starten met {label}",
                warning: "Nog {seconds} seconden",
                finished: "Presentatie afgelopen"
            },
            fr: {
                start: "Début de {label}",
                warning: "Il reste {seconds} secondes",
                finished: "Présentation terminée"
            },
            de: {
                start: "Beginne mit {label}",
                warning: "Noch {seconds} Sekunden",
                finished: "Präsentation beendet"
            },
            es: {
                start: "Comenzando {label}",
                warning: "Quedan {seconds} segundos",
                finished: "Presentación terminada"
            }
        };

        // Fallback to English if language not found
        const dict = TRANSLATIONS[langCode] || TRANSLATIONS['en'];
        let text = dict[key] || "";

        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(`{${placeholder}}`, value);
        }

        return text;
    }

    /**
     * Plays a short beep for timer transition.
     */
    async playTransition(nextLabel = null) {
        if (this.muted) return;
        await this.resumeContext();

        // Play beep
        playBeep(this.audioCtx);

        // Speak next timer label if enabled
        if (nextLabel) {
            // Small delay to let beep finish/start
            setTimeout(() => {
                const text = this.getText('start', { label: nextLabel });
                this.speak(text);
            }, 500);
        }
    }

    /**
     * Announced when the user manually clicks "Start"
     */
    async playStart(label) {
        if (this.muted) return;
        await this.resumeContext();

        // Optional: Play a "start" chock or just speak
        const text = this.getText('start', { label });
        this.speak(text);
    }

    /**
     * Plays warning sound/speech
     */
    async playWarning(msg = "1 minute remaining") {
        if (this.muted) return;

        // Extract number of seconds to localize the message
        // We expect msg to be like "10 seconds remaining" or similar
        // We only care about the number
        const match = msg.match(/^(\d+)/);
        if (match) {
            const seconds = match[1];
            const text = this.getText('warning', { seconds });
            this.speak(text);
        } else {
            // Fallback for custom messages if valid, or just speak as is
            this.speak(msg);
        }
    }

    /**
     * Plays a longer sequence for final completion.
     */
    async playCompletion() {
        if (this.muted) return;
        await this.resumeContext();
        playCompletion(this.audioCtx);
        setTimeout(() => {
            const text = this.getText('finished');
            this.speak(text);
        }, 1000);
    }
}
