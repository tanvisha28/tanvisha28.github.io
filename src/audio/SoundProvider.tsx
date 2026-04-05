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
  ambientCues,
  detailAmbientCue,
  homeAmbientCueByZone,
  type HomeSoundZone,
  soundRegistry,
  type AmbientCue,
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
  playCue: (cue: Exclude<SoundCue, AmbientCue>, options?: PlayCueOptions) => void;
  playClick: () => void;
  playHover: () => void;
  setSoundscapeMode: (mode: SoundscapeMode) => void;
  setHomeSoundZone: (zone: HomeSoundZone) => void;
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

function isAmbientCue(cue: SoundCue): cue is AmbientCue {
  return ambientCues.includes(cue as AmbientCue);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotionPreference();
  const coarsePointer = useCoarsePointerPreference();
  const controllerRef = useRef<SoundController | null>(null);
  const cueLastPlayedAtRef = useRef<Partial<Record<SoundCue, number>>>({});
  const enabledRef = useRef(readStoredPreference());
  const reducedMotionRef = useRef(reducedMotion);
  const coarsePointerRef = useRef(coarsePointer);
  const userActivationRef = useRef(false);
  const soundscapeModeRef = useRef<SoundscapeMode>("off");
  const homeSoundZoneRef = useRef<HomeSoundZone>("hero");
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

  const resolveActiveAmbientCue = useCallback((): AmbientCue | null => {
    if (soundscapeModeRef.current === "home") {
      return homeAmbientCueByZone[homeSoundZoneRef.current];
    }

    if (soundscapeModeRef.current === "detail") {
      return detailAmbientCue;
    }

    return null;
  }, []);

  const shouldRunAmbient = useCallback(() => {
    return enabledRef.current && userActivationRef.current && soundscapeModeRef.current !== "off" && !document.hidden;
  }, []);

  const syncAmbientState = useCallback(async () => {
    const controller = controllerRef.current;
    if (!controller || !controller.isReady()) {
      return;
    }

    if (shouldRunAmbient()) {
      const cue = resolveActiveAmbientCue();
      if (!cue) {
        return;
      }

      await controller.startAmbient(cue, resolveCueVolume(cue));
      return;
    }

    const shouldPause = soundscapeModeRef.current !== "off" && document.hidden;
    await controller.fadeOutAmbient(shouldPause);
  }, [resolveActiveAmbientCue, resolveCueVolume, shouldRunAmbient]);

  const initializeAudio = useCallback(
    async ({ playActivationTone }: { playActivationTone: boolean }) => {
      userActivationRef.current = true;
      const controller = ensureController();
      await controller.ensureReady();
      await controller.prewarm(["soundActivationCue"]);
      setReady(true);

      if (playActivationTone) {
        await controller.playTransient("soundActivationCue", resolveCueVolume("soundActivationCue"));
      }

      void controller.prewarm(ambientCues);
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
    (cue: Exclude<SoundCue, AmbientCue>, options?: PlayCueOptions) => {
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
      soundscapeModeRef.current = mode;
      void syncAmbientState();
    },
    [syncAmbientState]
  );

  const setHomeSoundZone = useCallback(
    (zone: HomeSoundZone) => {
      if (homeSoundZoneRef.current === zone) {
        return;
      }

      homeSoundZoneRef.current = zone;
      if (soundscapeModeRef.current === "home") {
        void syncAmbientState();
      }
    },
    [syncAmbientState]
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
      setHomeSoundZone,
    }),
    [
      dismissSoundPrompt,
      enableSound,
      enabled,
      playClick,
      playCue,
      playHover,
      promptDismissed,
      ready,
      reducedMotion,
      setHomeSoundZone,
      setSoundscapeMode,
      toggleSound,
    ]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
