// lib/audio/audio.gunshot.ts
import {
  WEAPONS,
  type ProceduralWeaponAudioKind,
  type WeaponId,
} from "@toyota/combat";

export class ProceduralGunshot {
  private static audioCtx: AudioContext | null = null;
  private static sampleBuffers = new Map<string, Promise<AudioBuffer | null>>();

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

  public static play(weapon: WeaponId): void {
    const audio = WEAPONS[weapon].audio;
    if (audio.kind === "sample") {
      void this.playSample(audio.src, audio.volume, audio.fallback);
      return;
    }
    this.playProcedural(audio.kind);
  }

  private static playProcedural(kind: ProceduralWeaponAudioKind): void {
    switch (kind) {
      case "heavyMg":
        this.playHeavyMg();
        break;
      case "autocannon":
        this.playAutocannon();
        break;
      case "rocket":
        this.playRocket();
        break;
    }
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
            throw new Error(`Failed to load weapon audio: ${src}`);
          }
          return response.arrayBuffer();
        })
        .then((data) => ctx.decodeAudioData(data))
        .catch((error) => {
          console.warn("Unable to decode weapon audio:", error);
          return null;
        });
      this.sampleBuffers.set(src, pending);
    }
    return pending;
  }

  private static async playSample(
    src: string,
    volume = 1,
    fallback?: ProceduralWeaponAudioKind,
  ): Promise<void> {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const buffer = await this.loadSample(ctx, src);
      if (!buffer) {
        if (fallback) this.playProcedural(fallback);
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
    } catch (error) {
      console.warn("Weapon audio playback failed:", error);
      if (fallback) this.playProcedural(fallback);
    }
  }

  private static noiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private static playHeavyMg(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.35;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer(ctx, duration);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(4000, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported:", error);
    }
  }

  private static playAutocannon(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.22;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer(ctx, duration);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(5200, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      filter.Q.setValueAtTime(0.8, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (error) {
      console.warn("AudioContext blocked or not supported:", error);
    }
  }

  private static playRocket(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.7;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer(ctx, duration);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + duration);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const thump = ctx.createOscillator();
      thump.type = "sine";
      thump.frequency.setValueAtTime(110, now);
      thump.frequency.exponentialRampToValueAtTime(38, now + 0.35);

      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.9, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
      thump.start(now);
      thump.stop(now + 0.4);
    } catch (error) {
      console.warn("AudioContext blocked or not supported:", error);
    }
  }
}
