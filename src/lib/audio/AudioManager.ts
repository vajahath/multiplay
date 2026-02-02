class AudioManager {
    private ctx: AudioContext | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
            this.initialized = true;
            console.log('Audio initialized');
        } catch (e) {
            console.error('Audio initialization failed', e);
        }
    }

    playCorrect() {
        this.beep(880, 0.1, 'sine', 0.1);
    }

    playWrong() {
        this.beep(220, 0.2, 'square', 0.05);
    }

    playTick(progress: number) {
        // progress 1 -> 0
        const freq = 440 + (1 - progress) * 440;
        this.beep(freq, 0.05, 'sine', 0.02);
    }

    private beep(freq: number, duration: number, type: OscillatorType, volume: number) {
        if (!this.ctx || !this.initialized) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Silence on error
        }
    }
}

export const audio = new AudioManager();
