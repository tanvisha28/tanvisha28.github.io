import type { Howl } from "howler";
import {
  ambientDuckFadeMs,
  ambientDuckVolume,
  ambientRestoreFadeMs,
  choirDuckRestoreDelayMs,
  soundRegistry,
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
  private ambientTargetVolume = soundRegistry.ambient.volume;
  private ambientStopTimeout: number | null = null;
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

  private clearAmbientStopTimeout() {
    if (this.ambientStopTimeout !== null) {
      window.clearTimeout(this.ambientStopTimeout);
      this.ambientStopTimeout = null;
    }
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
      preload: false,
      volume: cue === "ambient" ? 0 : definition.volume,
      onloaderror: (_, error) => logAudioWarning(`[audio] Failed to load ${cue}.`, error),
      onplayerror: (_, error) => logAudioWarning(`[audio] Failed to play ${cue}.`, error),
    });

    this.sounds.set(cue, sound);
    return sound;
  }

  async playTransient(cue: Exclude<SoundCue, "ambient">, volume = soundRegistry[cue].volume) {
    try {
      const sound = await this.getSound(cue);
      sound.stop();
      sound.volume(volume);
      sound.play();

      if (cue === "choirHit") {
        await this.duckAmbient();
      }
    } catch (error) {
      logAudioWarning(`[audio] Could not play ${cue}.`, error);
    }
  }

  async startAmbient(targetVolume = soundRegistry.ambient.volume) {
    try {
      const sound = await this.getSound("ambient");
      this.clearAmbientStopTimeout();
      this.clearDuckRestoreTimeout();
      this.ambientTargetVolume = targetVolume;

      if (!sound.playing()) {
        sound.volume(0);
        sound.play();
      }

      sound.fade(sound.volume(), targetVolume, soundRegistry.ambient.fadeInMs ?? 1500);
    } catch (error) {
      logAudioWarning("[audio] Could not start ambient audio.", error);
    }
  }

  async fadeOutAmbient(shouldPause = false) {
    try {
      const sound = this.sounds.get("ambient");
      if (!sound) {
        return;
      }
      this.clearAmbientStopTimeout();
      this.clearDuckRestoreTimeout();

      if (!sound.playing()) {
        return;
      }

      const currentVolume = sound.volume();
      const fadeOutMs = soundRegistry.ambient.fadeOutMs ?? 400;
      sound.fade(currentVolume, 0, fadeOutMs);

      this.ambientStopTimeout = window.setTimeout(() => {
        if (shouldPause) {
          sound.pause();
        } else {
          sound.stop();
        }
        sound.volume(0);
        this.ambientStopTimeout = null;
      }, fadeOutMs);
    } catch (error) {
      logAudioWarning("[audio] Could not stop ambient audio.", error);
    }
  }

  async resumeAmbient() {
    try {
      const sound = this.sounds.get("ambient");
      if (!sound) {
        return;
      }
      this.clearAmbientStopTimeout();

      if (!sound.playing()) {
        sound.volume(0);
        sound.play();
      }

      sound.fade(sound.volume(), this.ambientTargetVolume, soundRegistry.ambient.fadeInMs ?? 1500);
    } catch (error) {
      logAudioWarning("[audio] Could not resume ambient audio.", error);
    }
  }

  async duckAmbient() {
    try {
      const sound = this.sounds.get("ambient");
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
      }, choirDuckRestoreDelayMs);
    } catch (error) {
      logAudioWarning("[audio] Could not duck ambient audio.", error);
    }
  }

  stopTransients() {
    this.clearDuckRestoreTimeout();

    this.sounds.forEach((sound, cue) => {
      if (cue === "ambient") {
        return;
      }

      sound.stop();
    });
  }

  stopAll() {
    this.clearAmbientStopTimeout();
    this.clearDuckRestoreTimeout();

    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }
}
