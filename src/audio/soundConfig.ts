import { withBasePath } from "../utils/publicAsset";

export const SOUND_STORAGE_KEY = "portfolio-sound-enabled";
export const SOUND_PROMPT_SESSION_KEY = "portfolio-sound-prompt-dismissed";

export const homeSoundZones = ["hero", "projects", "experience", "education", "contact"] as const;
export type HomeSoundZone = (typeof homeSoundZones)[number];

export const homeSoundZoneBySection = {
  hero: "hero",
  about: "hero",
  skills: "hero",
  projects: "projects",
  experience: "experience",
  education: "education",
  contact: "contact",
  footer: "contact",
} as const;

export type HomeScrollSectionForSound = keyof typeof homeSoundZoneBySection;

export const ambientCues = [
  "heroAmbientLoop",
  "projectsAmbientLoop",
  "experienceAmbientLoop",
  "educationAmbientLoop",
  "contactAmbientLoop",
  "caseStudyAmbientLoop",
] as const;

export type AmbientCue = (typeof ambientCues)[number];

export type SoundCue =
  | AmbientCue
  | "soundActivationCue"
  | "uiClick"
  | "uiHover"
  | "sectionArrival"
  | "scrollDownTransition"
  | "scrollUpTransition"
  | "caseStudyOpen"
  | "caseStudyReturn";

export type SoundscapeMode = "off" | "home" | "detail";

export interface SoundConfigEntry {
  src: string[];
  volume: number;
  loop?: boolean;
  preload?: boolean;
  fadeInMs?: number;
  fadeOutMs?: number;
  cooldownMs?: number;
  mobileVolumeMultiplier?: number;
  duckAmbient?: boolean;
}

function ambientSources(baseName: string) {
  return [withBasePath(`audio/${baseName}.wav`), withBasePath(`audio/${baseName}.m4a`)];
}

function cueSources(baseName: string) {
  return [withBasePath(`audio/${baseName}.m4a`), withBasePath(`audio/${baseName}.wav`)];
}

export const soundRegistry: Record<SoundCue, SoundConfigEntry> = {
  heroAmbientLoop: {
    src: ambientSources("hero-ambient-loop"),
    volume: 0.064,
    loop: true,
    preload: true,
    fadeInMs: 1800,
    fadeOutMs: 620,
    mobileVolumeMultiplier: 0.78,
  },
  projectsAmbientLoop: {
    src: ambientSources("projects-ambient-loop"),
    volume: 0.059,
    loop: true,
    preload: true,
    fadeInMs: 1500,
    fadeOutMs: 520,
    mobileVolumeMultiplier: 0.78,
  },
  experienceAmbientLoop: {
    src: ambientSources("experience-ambient-loop"),
    volume: 0.058,
    loop: true,
    preload: true,
    fadeInMs: 1400,
    fadeOutMs: 520,
    mobileVolumeMultiplier: 0.77,
  },
  educationAmbientLoop: {
    src: ambientSources("education-ambient-loop"),
    volume: 0.054,
    loop: true,
    preload: true,
    fadeInMs: 1400,
    fadeOutMs: 480,
    mobileVolumeMultiplier: 0.76,
  },
  contactAmbientLoop: {
    src: ambientSources("contact-ambient-loop"),
    volume: 0.056,
    loop: true,
    preload: true,
    fadeInMs: 1500,
    fadeOutMs: 520,
    mobileVolumeMultiplier: 0.77,
  },
  caseStudyAmbientLoop: {
    src: ambientSources("case-study-ambient-loop"),
    volume: 0.05,
    loop: true,
    preload: true,
    fadeInMs: 1200,
    fadeOutMs: 420,
    mobileVolumeMultiplier: 0.74,
  },
  soundActivationCue: {
    src: cueSources("sound-activation-cue"),
    volume: 0.15,
    preload: true,
    cooldownMs: 1600,
    mobileVolumeMultiplier: 0.9,
  },
  uiClick: {
    src: cueSources("ui-click"),
    volume: 0.082,
    mobileVolumeMultiplier: 0.9,
  },
  uiHover: {
    src: cueSources("ui-hover"),
    volume: 0.044,
    cooldownMs: 1200,
    mobileVolumeMultiplier: 0.84,
  },
  sectionArrival: {
    src: cueSources("section-arrival"),
    volume: 0.084,
    cooldownMs: 1200,
    mobileVolumeMultiplier: 0.82,
    duckAmbient: true,
  },
  scrollDownTransition: {
    src: cueSources("scroll-down-transition"),
    volume: 0.078,
    cooldownMs: 680,
    mobileVolumeMultiplier: 0.82,
    duckAmbient: true,
  },
  scrollUpTransition: {
    src: cueSources("scroll-up-transition"),
    volume: 0.072,
    cooldownMs: 680,
    mobileVolumeMultiplier: 0.82,
    duckAmbient: true,
  },
  caseStudyOpen: {
    src: cueSources("case-study-open"),
    volume: 0.114,
    cooldownMs: 900,
    mobileVolumeMultiplier: 0.8,
    duckAmbient: true,
  },
  caseStudyReturn: {
    src: cueSources("case-study-return"),
    volume: 0.104,
    cooldownMs: 900,
    mobileVolumeMultiplier: 0.8,
    duckAmbient: true,
  },
};

export const homeAmbientCueByZone: Record<HomeSoundZone, AmbientCue> = {
  hero: "heroAmbientLoop",
  projects: "projectsAmbientLoop",
  experience: "experienceAmbientLoop",
  education: "educationAmbientLoop",
  contact: "contactAmbientLoop",
};

export const detailAmbientCue: AmbientCue = "caseStudyAmbientLoop";

export const ambientDuckVolume = 0.032;
export const ambientDuckFadeMs = 220;
export const ambientRestoreFadeMs = 920;
export const ambientDuckRestoreDelayMs = 880;

export const homeZoneFocusLineRatio = 0.42;
export const homeZoneChangeHoldMs = 120;
export const homeZoneChangeCooldownMs = 260;
export const homeZoneArrivalDelayMs = 280;
