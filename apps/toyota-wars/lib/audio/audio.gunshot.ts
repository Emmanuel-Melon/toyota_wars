// lib/audio/audio.gunshot.ts
import { WEAPONS } from "@/lib/weapons/weapon.config";
import type { WeaponId } from "@/lib/weapons/weapon.types";

export class ProceduralGunshot {
  private static audioCtx: AudioContext | null = null;

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
    switch (WEAPONS[weapon].audio.kind) {
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
