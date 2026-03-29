export const SOUND_STORAGE_KEY = "portfolio-sound-enabled";

export type SoundCue =
  | "ambient"
  | "choirHit"
  | "heroHum"
  | "uiClick"
  | "uiHover"
  | "sectionSweep";

export type MajorHomeSection = "projects" | "experience" | "contact";

export interface SoundConfigEntry {
  src: string;
  volume: number;
  loop?: boolean;
  fadeInMs?: number;
  fadeOutMs?: number;
  cooldownMs?: number;
}

export const soundRegistry: Record<SoundCue, SoundConfigEntry> = {
  ambient: {
    src: "/audio/ambient-loop.mp3",
    volume: 0.065,
    loop: true,
    fadeInMs: 1500,
    fadeOutMs: 400,
  },
  choirHit: {
    src: "/audio/choir-hit.mp3",
    volume: 0.12,
    cooldownMs: 2500,
  },
  heroHum: {
    src: "/audio/hero-hum.mp3",
    volume: 0.08,
  },
  uiClick: {
    src: "/audio/ui-click.mp3",
    volume: 0.1,
  },
  uiHover: {
    src: "/audio/ui-hover.mp3",
    volume: 0.085,
    cooldownMs: 1400,
  },
  sectionSweep: {
    src: "/audio/section-sweep.mp3",
    volume: 0.08,
    cooldownMs: 1600,
  },
};

export const majorHomeSections: readonly MajorHomeSection[] = ["projects", "experience", "contact"];
export const automaticHomepageRevealIds = [
  "skills-intro",
  "projects-intro",
  "projects-tree",
  "experience-intro",
  "experience-timeline",
] as const;

export const ambientDuckVolume = 0.04;
export const ambientDuckFadeMs = 220;
export const ambientRestoreFadeMs = 800;
export const choirDuckRestoreDelayMs = 1150;
