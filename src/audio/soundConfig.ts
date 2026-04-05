import { withBasePath } from "../utils/publicAsset";

export const SOUND_STORAGE_KEY = "portfolio-sound-enabled";
export const SOUND_PROMPT_SESSION_KEY = "portfolio-sound-prompt-dismissed";

export type AmbientCue = "ambientHome" | "ambientDetail";
export type SoundCue =
  | AmbientCue
  | "activationTone"
  | "uiClick"
  | "uiHover"
  | "sectionSweep"
  | "sectionImpact"
  | "caseStudyOpen"
  | "caseStudyReturn";

export type SoundscapeMode = "off" | "home" | "detail";

export type MajorHomeSection = "projects" | "experience" | "education" | "contact";

export interface SoundConfigEntry {
  src: string;
  volume: number;
  loop?: boolean;
  fadeInMs?: number;
  fadeOutMs?: number;
  cooldownMs?: number;
  mobileVolumeMultiplier?: number;
  duckAmbient?: boolean;
}

export const soundRegistry: Record<SoundCue, SoundConfigEntry> = {
  ambientHome: {
    src: withBasePath("audio/ambient-home-loop.wav"),
    volume: 0.062,
    loop: true,
    fadeInMs: 1800,
    fadeOutMs: 520,
    mobileVolumeMultiplier: 0.78,
  },
  ambientDetail: {
    src: withBasePath("audio/ambient-detail-loop.wav"),
    volume: 0.051,
    loop: true,
    fadeInMs: 1200,
    fadeOutMs: 420,
    mobileVolumeMultiplier: 0.74,
  },
  activationTone: {
    src: withBasePath("audio/activation-tone.m4a"),
    volume: 0.15,
    cooldownMs: 1600,
    mobileVolumeMultiplier: 0.9,
  },
  uiClick: {
    src: withBasePath("audio/ui-click.m4a"),
    volume: 0.088,
    mobileVolumeMultiplier: 0.9,
  },
  uiHover: {
    src: withBasePath("audio/ui-hover.m4a"),
    volume: 0.052,
    cooldownMs: 1400,
    mobileVolumeMultiplier: 0.84,
  },
  sectionSweep: {
    src: withBasePath("audio/section-sweep.m4a"),
    volume: 0.086,
    cooldownMs: 1700,
    mobileVolumeMultiplier: 0.82,
  },
  sectionImpact: {
    src: withBasePath("audio/section-impact.m4a"),
    volume: 0.128,
    cooldownMs: 2500,
    mobileVolumeMultiplier: 0.8,
    duckAmbient: true,
  },
  caseStudyOpen: {
    src: withBasePath("audio/case-study-open.m4a"),
    volume: 0.12,
    cooldownMs: 900,
    mobileVolumeMultiplier: 0.8,
    duckAmbient: true,
  },
  caseStudyReturn: {
    src: withBasePath("audio/case-study-return.m4a"),
    volume: 0.108,
    cooldownMs: 900,
    mobileVolumeMultiplier: 0.8,
    duckAmbient: true,
  },
};

export const soundscapeAmbientCueByMode: Record<Exclude<SoundscapeMode, "off">, AmbientCue> = {
  home: "ambientHome",
  detail: "ambientDetail",
};

export const majorHomeSections: readonly MajorHomeSection[] = ["projects", "experience", "education", "contact"];
export const automaticHomepageRevealIds = [
  "skills-intro",
  "projects-intro",
  "projects-tree",
  "experience-intro",
  "experience-timeline",
  "education-intro",
  "contact-panel",
] as const;

export const ambientDuckVolume = 0.036;
export const ambientDuckFadeMs = 220;
export const ambientRestoreFadeMs = 900;
export const ambientDuckRestoreDelayMs = 980;
