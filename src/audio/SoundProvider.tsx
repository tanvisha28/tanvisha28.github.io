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
import { SOUND_STORAGE_KEY, soundRegistry, type MajorHomeSection, type SoundCue } from "./soundConfig";

type PlayCueOptions = {
  automatic?: boolean;
  volume?: number;
};

export interface SoundContextValue {
  enabled: boolean;
  ready: boolean;
  reducedMotion: boolean;
  toggleSound: () => Promise<void>;
  playCue: (cue: Exclude<SoundCue, "ambient">, options?: PlayCueOptions) => void;
  playClick: () => void;
  playHover: () => void;
  setHomeSoundscapeActive: (active: boolean) => void;
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

function readStoredPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SOUND_STORAGE_KEY) === "true";
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotionPreference();
  const controllerRef = useRef<SoundController | null>(null);
  const cueLastPlayedAtRef = useRef<Partial<Record<SoundCue, number>>>({});
  const enteredSectionsRef = useRef<Set<MajorHomeSection>>(new Set());
  const enabledRef = useRef(readStoredPreference());
  const reducedMotionRef = useRef(reducedMotion);
  const userActivationRef = useRef(false);
  const homeSoundscapeActiveRef = useRef(false);
  const [enabled, setEnabled] = useState(enabledRef.current);
  const [ready, setReady] = useState(false);

  const ensureController = useCallback(() => {
    if (!controllerRef.current) {
      controllerRef.current = new SoundController();
    }

    return controllerRef.current;
  }, []);

  const shouldRunAmbient = useCallback(() => {
    return enabledRef.current && userActivationRef.current && homeSoundscapeActiveRef.current && !document.hidden;
  }, []);

  const syncAmbientState = useCallback(async () => {
    const controller = controllerRef.current;
    if (!controller || !controller.isReady()) {
      return;
    }

    if (shouldRunAmbient()) {
      await controller.startAmbient();
      return;
    }

    const shouldPause = homeSoundscapeActiveRef.current && document.hidden;
    await controller.fadeOutAmbient(shouldPause);
  }, [shouldRunAmbient]);

  const initializeAudio = useCallback(
    async ({ playActivationHum }: { playActivationHum: boolean }) => {
      userActivationRef.current = true;
      const controller = ensureController();
      await controller.ensureReady();
      setReady(true);

      if (playActivationHum) {
        await controller.playTransient("heroHum");
      }

      if (shouldRunAmbient()) {
        await controller.startAmbient();
      }
    },
    [ensureController, shouldRunAmbient]
  );

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    enabledRef.current = enabled;
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!enabled || userActivationRef.current) {
      return;
    }

    // Restored sound preferences still wait for a user gesture before playback.
    const activate = () => {
      window.removeEventListener("pointerdown", activate, true);
      window.removeEventListener("keydown", activate, true);
      void initializeAudio({ playActivationHum: false });
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

  const playCue = useCallback(
    (cue: Exclude<SoundCue, "ambient">, options?: PlayCueOptions) => {
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
      void ensureController().playTransient(cue, options?.volume ?? soundRegistry[cue].volume);
    },
    [ensureController]
  );

  const playClick = useCallback(() => {
    playCue("uiClick");
  }, [playCue]);

  const playHover = useCallback(() => {
    playCue("uiHover");
  }, [playCue]);

  const toggleSound = useCallback(async () => {
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

    enabledRef.current = true;
    setEnabled(true);
    await initializeAudio({ playActivationHum: true });
  }, [initializeAudio]);

  const setHomeSoundscapeActive = useCallback(
    (active: boolean) => {
      homeSoundscapeActiveRef.current = active;

      if (active) {
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
      playCue("choirHit", { automatic: true, volume: soundRegistry.choirHit.volume });
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
      toggleSound,
      playCue,
      playClick,
      playHover,
      setHomeSoundscapeActive,
      markSectionEntered,
    }),
    [enabled, markSectionEntered, playClick, playCue, playHover, ready, reducedMotion, setHomeSoundscapeActive, toggleSound]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
