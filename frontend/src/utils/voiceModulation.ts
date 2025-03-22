import { Theme } from '../components/MainLearningInterface';

class VoiceModulator {
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pitchNode: any = null; // TODO: Implement pitch shifting

  constructor() {
    try {
      this.context = new AudioContext();
      this.gainNode = this.context.createGain();
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
    }
  }

  async setupStream(stream: MediaStream) {
    if (!this.context) return;

    try {
      this.source = this.context.createMediaStreamSource(stream);
      this.source.connect(this.gainNode!);
      this.gainNode!.connect(this.context.destination);
    } catch (error) {
      console.error('Failed to setup audio stream:', error);
    }
  }

  applyThemeEffects(theme: Theme) {
    if (!this.gainNode) return;

    if (theme === 'darth-vader') {
      // Deep, intimidating voice
      this.gainNode.gain.value = 1.5;
      // TODO: Add pitch shifting for Darth Vader voice
    } else {
      // Friendly, gentle voice for Panda
      this.gainNode.gain.value = 1.0;
      // TODO: Add slight pitch up for Panda voice
    }
  }

  cleanup() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

export const voiceModulator = new VoiceModulator(); 