
export interface MusicParams {
  segmentName?: string;
  bpm: number;
  scale: 'major' | 'minor' | 'pentatonic' | 'lydian' | 'phrygian';
  explanation: string;
  density: number;
  baseFreq: number;
}

export class BGMEngine {
  private ctx: AudioContext | null = null;
  private oscillators: Set<OscillatorNode> = new Set();
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.15;
    }
  }

  private getFrequency(root: number, step: number, scaleType: string): number {
    const scales: Record<string, number[]> = {
      major: [0, 2, 4, 5, 7, 9, 11, 12],
      minor: [0, 2, 3, 5, 7, 8, 10, 12],
      pentatonic: [0, 2, 4, 7, 9, 12],
      lydian: [0, 2, 4, 6, 7, 9, 11, 12],
      phrygian: [0, 1, 3, 5, 7, 8, 10, 12]
    };
    const scale = scales[scaleType] || scales.major;
    const octave = Math.floor(step / scale.length);
    const noteIndex = step % scale.length;
    const semitones = scale[noteIndex] + (octave * 12);
    return root * Math.pow(2, semitones / 12);
  }

  private synthNote(context: BaseAudioContext, destination: AudioNode, time: number, duration: number, freq: number) {
    const osc = context.createOscillator();
    const g = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.1, time + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(g);
    g.connect(destination);
    osc.start(time);
    osc.stop(time + duration);
    return osc;
  }

  public async play(params: MusicParams) {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const runSequence = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const stepDuration = 60 / params.bpm;
      const freq = this.getFrequency(params.baseFreq, Math.floor(Math.random() * 12), params.scale);
      const osc = this.synthNote(this.ctx, this.gainNode, now, stepDuration * 4, freq);
      this.oscillators.add(osc);
      osc.onended = () => this.oscillators.delete(osc);
      setTimeout(runSequence, (60000 / params.bpm) * (params.density > 0.5 ? 1 : 2));
    };
    runSequence();
  }

  public async renderToWav(params: MusicParams, durationSeconds: number = 30): Promise<Blob> {
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, sampleRate * durationSeconds, sampleRate);
    const masterGain = offlineCtx.createGain();
    masterGain.connect(offlineCtx.destination);
    masterGain.gain.value = 0.5;

    let currentTime = 0;
    while (currentTime < durationSeconds) {
      const stepDuration = 60 / params.bpm;
      const freq = this.getFrequency(params.baseFreq, Math.floor(Math.random() * 12), params.scale);
      this.synthNote(offlineCtx, masterGain, currentTime, stepDuration * 6, freq);
      if (currentTime % (stepDuration * 4) < 0.1) {
        this.synthNote(offlineCtx, masterGain, currentTime, durationSeconds - currentTime, params.baseFreq / 2);
      }
      currentTime += (60 / params.bpm) * (params.density > 0.5 ? 2 : 4);
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  private bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numOfChan * 2;
    const bufferArr = new ArrayBuffer(44 + length);
    const view = new DataView(bufferArr);
    let pos = 0;
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };

    setUint32(0x46464952); setUint32(36 + length); setUint32(0x45564157); // RIFF WAVE
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); // fmt
    setUint32(sampleRate); setUint32(sampleRate * numOfChan * 2); setUint16(numOfChan * 2); setUint16(16);
    setUint32(0x61746164); setUint32(length); // data

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < channel.length; j++) {
        let sample = Math.max(-1, Math.min(1, channel[j]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
    }
    return new Blob([bufferArr], { type: "audio/wav" });
  }

  public stop() {
    this.isPlaying = false;
    this.oscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
    this.oscillators.clear();
    if (this.ctx) this.ctx.suspend();
  }
}

export const bgmEngine = new BGMEngine();
