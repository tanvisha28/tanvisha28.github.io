import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SoundController } from "./soundController";
import {
  SOUND_PROMPT_SESSION_KEY,
  SOUND_STORAGE_KEY,
  soundRegistry,
  soundscapeAmbientCueByMode,
  type MajorHomeSection,
  type SoundCue,
  type SoundscapeMode,
} from "./soundConfig";

type PlayCueOptions = {
  automatic?: boolean;
  volume?: number;
};

export interface SoundContextValue {
  enabled: boolean;
  ready: boolean;
  reducedMotion: boolean;
  showSoundPrompt: boolean;
  toggleSound: () => Promise<void>;
  enableSound: () => Promise<void>;
  dismissSoundPrompt: () => void;
  playCue: (cue: Exclude<SoundCue, "ambientHome" | "ambientDetail">, options?: PlayCueOptions) => void;
  playClick: () => void;
  playHover: () => void;
  setSoundscapeMode: (mode: SoundscapeMode) => void;
  markSectionEntered: (section: MajorHomeSection) => void;
}

export const SoundContext = createContext<SoundContextValue | null>(null);

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return reducedMotion;
}

function useCoarsePointerPreference() {
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return coarsePointer;
}

function readStoredPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SOUND_STORAGE_KEY) === "true";
}

function readPromptDismissed() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(SOUND_PROMPT_SESSION_KEY) === "true";
}

function writePromptDismissed(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SOUND_PROMPT_SESSION_KEY, String(value));
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotionPreference();
  const coarsePointer = useCoarsePointerPreference();
  const controllerRef = useRef<SoundController | null>(null);
  const cueLastPlayedAtRef = useRef<Partial<Record<SoundCue, number>>>({});
  const enteredSectionsRef = useRef<Set<MajorHomeSection>>(new Set());
  const enabledRef = useRef(readStoredPreference());
  const reducedMotionRef = useRef(reducedMotion);
  const coarsePointerRef = useRef(coarsePointer);
  const userActivationRef = useRef(false);
  const soundscapeModeRef = useRef<SoundscapeMode>("off");
  const [enabled, setEnabled] = useState(enabledRef.current);
  const [ready, setReady] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(readPromptDismissed());

  const ensureController = useCallback(() => {
    if (!controllerRef.current) {
      controllerRef.current = new SoundController();
    }

    return controllerRef.current;
  }, []);

  const resolveCueVolume = useCallback(
    (cue: SoundCue, baseVolume = soundRegistry[cue].volume) => {
      const coarsePointerMultiplier = coarsePointerRef.current
        ? soundRegistry[cue].mobileVolumeMultiplier ?? 0.88
        : 1;

      return baseVolume * coarsePointerMultiplier;
    },
    []
  );

  const shouldRunAmbient = useCallback(() => {
    return enabledRef.current && userActivationRef.current && soundscapeModeRef.current !== "off" && !document.hidden;
  }, []);

  const syncAmbientState = useCallback(async () => {
    const controller = controllerRef.current;
    if (!controller || !controller.isReady()) {
      return;
    }

    if (shouldRunAmbient()) {
      const cue = soundscapeAmbientCueByMode[soundscapeModeRef.current as Exclude<SoundscapeMode, "off">];
      await controller.startAmbient(cue, resolveCueVolume(cue));
      return;
    }

    const shouldPause = soundscapeModeRef.current !== "off" && document.hidden;
    await controller.fadeOutAmbient(shouldPause);
  }, [resolveCueVolume, shouldRunAmbient]);

  const initializeAudio = useCallback(
    async ({ playActivationTone }: { playActivationTone: boolean }) => {
      userActivationRef.current = true;
      const controller = ensureController();
      await controller.ensureReady();
      setReady(true);

      if (playActivationTone) {
        await controller.playTransient("activationTone", resolveCueVolume("activationTone"));
      }

      await syncAmbientState();
    },
    [ensureController, resolveCueVolume, syncAmbientState]
  );

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    coarsePointerRef.current = coarsePointer;
  }, [coarsePointer]);

  useEffect(() => {
    enabledRef.current = enabled;
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!enabled || userActivationRef.current) {
      return;
    }

    const activate = () => {
      window.removeEventListener("pointerdown", activate, true);
      window.removeEventListener("keydown", activate, true);
      void initializeAudio({ playActivationTone: false });
    };

    window.addEventListener("pointerdown", activate, true);
    window.addEventListener("keydown", activate, true);

    return () => {
      window.removeEventListener("pointerdown", activate, true);
      window.removeEventListener("keydown", activate, true);
    };
  }, [enabled, initializeAudio]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      void syncAmbientState();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncAmbientState]);

  const dismissSoundPrompt = useCallback(() => {
    setPromptDismissed(true);
    writePromptDismissed(true);
  }, []);

  const playCue = useCallback(
    (cue: Exclude<SoundCue, "ambientHome" | "ambientDetail">, options?: PlayCueOptions) => {
      if (!enabledRef.current || !userActivationRef.current) {
        return;
      }

      if (options?.automatic && reducedMotionRef.current) {
        return;
      }

      const cooldownMs = soundRegistry[cue].cooldownMs;
      const now = window.performance.now();
      const lastPlayedAt = cueLastPlayedAtRef.current[cue] ?? -Infinity;

      if (cooldownMs && now - lastPlayedAt < cooldownMs) {
        return;
      }

      cueLastPlayedAtRef.current[cue] = now;
      void ensureController().playTransient(cue, resolveCueVolume(cue, options?.volume ?? soundRegistry[cue].volume));
    },
    [ensureController, resolveCueVolume]
  );

  const playClick = useCallback(() => {
    playCue("uiClick");
  }, [playCue]);

  const playHover = useCallback(() => {
    playCue("uiHover");
  }, [playCue]);

  const enableSound = useCallback(async () => {
    dismissSoundPrompt();

    if (enabledRef.current) {
      await initializeAudio({ playActivationTone: true });
      return;
    }

    enabledRef.current = true;
    setEnabled(true);
    await initializeAudio({ playActivationTone: true });
  }, [dismissSoundPrompt, initializeAudio]);

  const toggleSound = useCallback(async () => {
    dismissSoundPrompt();

    if (enabledRef.current) {
      enabledRef.current = false;
      setEnabled(false);
      userActivationRef.current = false;
      enteredSectionsRef.current.clear();
      cueLastPlayedAtRef.current = {};

      if (controllerRef.current) {
        await controllerRef.current.fadeOutAmbient(false);
        controllerRef.current.stopTransients();
      }

      return;
    }

    await enableSound();
  }, [dismissSoundPrompt, enableSound]);

  const setSoundscapeMode = useCallback(
    (mode: SoundscapeMode) => {
      const previousMode = soundscapeModeRef.current;
      soundscapeModeRef.current = mode;

      if (mode === "home" && previousMode !== "home") {
        enteredSectionsRef.current.clear();
      }

      void syncAmbientState();
    },
    [syncAmbientState]
  );

  const markSectionEntered = useCallback(
    (section: MajorHomeSection) => {
      if (!enabledRef.current || !userActivationRef.current || reducedMotionRef.current) {
        return;
      }

      if (enteredSectionsRef.current.has(section)) {
        return;
      }

      enteredSectionsRef.current.add(section);
      playCue("sectionImpact", { automatic: true });
    },
    [playCue]
  );

  useEffect(() => {
    return () => {
      controllerRef.current?.stopAll();
    };
  }, []);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled,
      ready,
      reducedMotion,
      showSoundPrompt: !enabled && !promptDismissed,
      toggleSound,
      enableSound,
      dismissSoundPrompt,
      playCue,
      playClick,
      playHover,
      setSoundscapeMode,
      markSectionEntered,
    }),
    [
      dismissSoundPrompt,
      enableSound,
      enabled,
      markSectionEntered,
      playClick,
      playCue,
      playHover,
      promptDismissed,
      ready,
      reducedMotion,
      setSoundscapeMode,
      toggleSound,
    ]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
