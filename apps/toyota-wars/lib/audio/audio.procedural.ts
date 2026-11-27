// lib/audio/audio.procedural.ts
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";

export class ProceduralAudio {
  private static audioCtx: AudioContext | null = null;
  private static sampleBuffers = new Map<string, Promise<AudioBuffer | null>>();
  private static vehicleSource: AudioBufferSourceNode | null = null;
  private static vehicleGain: GainNode | null = null;
  private static vehicleSourcePending = false;

  private static getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return null;
      this.audioCtx = new AudioContextClass();
    }

    if (this.audioCtx.state === "suspended") {
      void this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  private static loadSample(
    ctx: AudioContext,
    src: string,
  ): Promise<AudioBuffer | null> {
    let pending = this.sampleBuffers.get(src);
    if (!pending) {
      pending = fetch(src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load audio sample: ${src}`);
          }
          return response.arrayBuffer();
        })
        .then((data) => ctx.decodeAudioData(data))
        .catch((error) => {
          console.warn("Unable to decode audio sample:", error);
          return null;
        });
      this.sampleBuffers.set(src, pending);
    }
    return pending;
  }

  private static async playSample(
    src: string,
    fallback?: () => void,
  ): Promise<void> {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const buffer = await this.loadSample(ctx, src);
      if (!buffer) {
        fallback?.();
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (error) {
      console.warn("Audio sample playback failed:", error);
      fallback?.();
    }
  }

  public static playVehicleExplosion(): void {
    void this.playSample("/audio/explosion_car.mp3", () =>
      this.playExplosion(),
    );
  }

  public static playBulletImpact(): void {
    void this.playSample("/audio/bullet.mp3", () => this.playMetalImpact());
  }

  private static async startVehicleAudioAsync(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx || this.vehicleSource || this.vehicleSourcePending) return;

    this.vehicleSourcePending = true;
    try {
      const buffer = await this.loadSample(ctx, "/audio/toyota.mp3");
      if (!buffer || this.vehicleSource) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      this.vehicleSource = source;
      this.vehicleGain = gain;
    } catch (error) {
      console.warn("Vehicle audio playback failed:", error);
    } finally {
      this.vehicleSourcePending = false;
    }
  }

  public static startVehicleAudio(): void {
    void this.startVehicleAudioAsync();
  }

  public static setVehicleAudioSpeed(speed: number): void {
    const ctx = this.audioCtx;
    if (!ctx || !this.vehicleGain) return;

    const ratio = Math.min(1, Math.abs(speed) / MOVEMENT_CONFIG.body.maxSpeed);
    const level = ratio <= 0.02 ? 0 : 0.08 + ratio * 0.32;
    this.vehicleGain.gain.setTargetAtTime(level, ctx.currentTime, 0.08);
    this.vehicleSource?.playbackRate.setTargetAtTime(
      0.85 + ratio * 0.3,
      ctx.currentTime,
      0.12,
    );
  }

  public static stopVehicleAudio(): void {
    const ctx = this.audioCtx;
    if (!ctx || !this.vehicleGain) return;
    this.vehicleGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }

  public static playMetalImpact(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.15;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200 + Math.random() * 400, now);
      filter.Q.setValueAtTime(5, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.8, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported yet:", error);
    }
  }

  public static playRockImpact(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.14;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + duration);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.55, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported yet:", error);
    }
  }

  public static playExplosion(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.9;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + duration * 0.85);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.9, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      const thump = ctx.createOscillator();
      thump.type = "sine";
      thump.frequency.setValueAtTime(82, now);
      thump.frequency.exponentialRampToValueAtTime(28, now + duration * 0.65);

      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.001, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.55, now + 0.02);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.75);

      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);

      thump.start(now);
      thump.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported yet:", error);
    }
  }

  public static playVehicleCollision(closingSpeed = 0): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const intensity = Math.max(0, Math.min(1, closingSpeed / 20));
      const duration = 0.22 + intensity * 0.12;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700 + intensity * 900, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + duration * 0.8);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.22 + intensity * 0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      const thud = ctx.createOscillator();
      thud.type = "sine";
      thud.frequency.setValueAtTime(95 + intensity * 35, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + duration * 0.7);

      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.18 + intensity * 0.35, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);

      thud.connect(thudGain);
      thudGain.connect(ctx.destination);

      thud.start(now);
      thud.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported yet:", error);
    }
  }

  public static playBulletWhizz(pan = 0): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.24;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(1.4, now);
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(520, now + duration);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.65, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);

      const stereoPanner = ctx.createStereoPanner?.();
      if (stereoPanner) {
        stereoPanner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        gainNode.connect(stereoPanner);
        stereoPanner.connect(ctx.destination);
      } else {
        gainNode.connect(ctx.destination);
      }

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported yet:", error);
    }
  }
}
