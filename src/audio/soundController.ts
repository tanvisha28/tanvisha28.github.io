import type { Howl } from "howler";
import {
  ambientDuckFadeMs,
  ambientDuckVolume,
  ambientDuckRestoreDelayMs,
  ambientRestoreFadeMs,
  soundRegistry,
  type AmbientCue,
  type SoundCue,
} from "./soundConfig";

type HowlerModule = typeof import("howler");

function logAudioWarning(message: string, error?: unknown) {
  if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
    console.warn(message, error);
  }
}

export class SoundController {
  private module: HowlerModule | null = null;
  private modulePromise: Promise<HowlerModule> | null = null;
  private sounds = new Map<SoundCue, Howl>();
  private activeAmbientCue: AmbientCue | null = null;
  private ambientTargetVolume = soundRegistry.ambientHome.volume;
  private ambientStopTimeouts = new Set<number>();
  private duckRestoreTimeout: number | null = null;

  async ensureReady() {
    if (this.module) {
      return this.module;
    }

    if (!this.modulePromise) {
      this.modulePromise = import("howler")
        .then((module) => {
          this.module = module;
          return module;
        })
        .catch((error) => {
          this.modulePromise = null;
          throw error;
        });
    }

    return this.modulePromise;
  }

  isReady() {
    return this.module !== null;
  }

  private clearAmbientStopTimeouts() {
    this.ambientStopTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    this.ambientStopTimeouts.clear();
  }

  private clearDuckRestoreTimeout() {
    if (this.duckRestoreTimeout !== null) {
      window.clearTimeout(this.duckRestoreTimeout);
      this.duckRestoreTimeout = null;
    }
  }

  private async getSound(cue: SoundCue) {
    const existing = this.sounds.get(cue);
    if (existing) {
      return existing;
    }

    const module = await this.ensureReady();
    const definition = soundRegistry[cue];

    const sound = new module.Howl({
      src: [definition.src],
      loop: Boolean(definition.loop),
      preload: cue === "ambientHome" || cue === "ambientDetail",
      html5: cue === "ambientHome" || cue === "ambientDetail",
      volume: cue === "ambientHome" || cue === "ambientDetail" ? 0 : definition.volume,
      onloaderror: (_, error) => logAudioWarning(`[audio] Failed to load ${cue}.`, error),
      onplayerror: (_, error) => logAudioWarning(`[audio] Failed to play ${cue}.`, error),
    });

    this.sounds.set(cue, sound);
    return sound;
  }

  async playTransient(
    cue: Exclude<SoundCue, "ambientHome" | "ambientDetail">,
    volume = soundRegistry[cue].volume
  ) {
    try {
      const sound = await this.getSound(cue);
      sound.stop();
      sound.volume(volume);
      sound.play();

      if (soundRegistry[cue].duckAmbient) {
        await this.duckAmbient();
      }
    } catch (error) {
      logAudioWarning(`[audio] Could not play ${cue}.`, error);
    }
  }

  async startAmbient(cue: AmbientCue, targetVolume = soundRegistry[cue].volume) {
    try {
      const sound = await this.getSound(cue);
      const previousCue = this.activeAmbientCue;
      const previousSound = previousCue ? this.sounds.get(previousCue) ?? null : null;
      this.clearAmbientStopTimeouts();
      this.clearDuckRestoreTimeout();
      this.ambientTargetVolume = targetVolume;

      if (previousCue && previousCue !== cue && previousSound && previousSound.playing()) {
        const fadeOutMs = soundRegistry[previousCue].fadeOutMs ?? 400;
        previousSound.fade(previousSound.volume(), 0, fadeOutMs);
        const timeout = window.setTimeout(() => {
          previousSound.stop();
          previousSound.volume(0);
          this.ambientStopTimeouts.delete(timeout);
        }, fadeOutMs);
        this.ambientStopTimeouts.add(timeout);
      }

      if (!sound.playing()) {
        sound.volume(0);
        sound.play();
      }

      sound.fade(sound.volume(), targetVolume, soundRegistry[cue].fadeInMs ?? 1500);
      this.activeAmbientCue = cue;
    } catch (error) {
      logAudioWarning("[audio] Could not start ambient audio.", error);
    }
  }

  async fadeOutAmbient(shouldPause = false) {
    try {
      const activeAmbientCue = this.activeAmbientCue;
      if (!activeAmbientCue) {
        return;
      }
      const sound = this.sounds.get(activeAmbientCue);
      if (!sound) {
        return;
      }
      this.clearAmbientStopTimeouts();
      this.clearDuckRestoreTimeout();

      if (!sound.playing()) {
        return;
      }

      const currentVolume = sound.volume();
      const fadeOutMs = soundRegistry[activeAmbientCue].fadeOutMs ?? 400;
      sound.fade(currentVolume, 0, fadeOutMs);

      const timeout = window.setTimeout(() => {
        if (shouldPause) {
          sound.pause();
        } else {
          sound.stop();
          if (this.activeAmbientCue === activeAmbientCue) {
            this.activeAmbientCue = null;
          }
        }
        sound.volume(0);
        this.ambientStopTimeouts.delete(timeout);
      }, fadeOutMs);
      this.ambientStopTimeouts.add(timeout);
    } catch (error) {
      logAudioWarning("[audio] Could not stop ambient audio.", error);
    }
  }

  async duckAmbient() {
    try {
      const activeAmbientCue = this.activeAmbientCue;
      if (!activeAmbientCue) {
        return;
      }
      const sound = this.sounds.get(activeAmbientCue);
      if (!sound) {
        return;
      }
      if (!sound.playing()) {
        return;
      }

      this.clearDuckRestoreTimeout();
      sound.fade(sound.volume(), ambientDuckVolume, ambientDuckFadeMs);
      this.duckRestoreTimeout = window.setTimeout(() => {
        sound.fade(sound.volume(), this.ambientTargetVolume, ambientRestoreFadeMs);
        this.duckRestoreTimeout = null;
      }, ambientDuckRestoreDelayMs);
    } catch (error) {
      logAudioWarning("[audio] Could not duck ambient audio.", error);
    }
  }

  stopTransients() {
    this.clearDuckRestoreTimeout();

    this.sounds.forEach((sound, cue) => {
      if (cue === "ambientHome" || cue === "ambientDetail") {
        return;
      }

      sound.stop();
    });
  }

  stopAll() {
    this.clearAmbientStopTimeouts();
    this.clearDuckRestoreTimeout();

    this.sounds.forEach((sound) => {
      sound.stop();
    });
    this.activeAmbientCue = null;
  }
}
