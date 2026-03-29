import { useCallback, useRef } from "react";
import { useSound } from "./useSound";

export interface SoundInteractionHandlers {
  withClickSound: <EventType,>(handler?: (event: EventType) => void) => (event: EventType) => void;
  withHoverSound: <EventType,>(
    key: string,
    handler?: (event: EventType) => void,
    cooldownMs?: number
  ) => (event: EventType) => void;
}

export function useSoundInteractions(): SoundInteractionHandlers {
  const { playClick, playHover } = useSound();
  const hoverTimestampsRef = useRef<Record<string, number>>({});

  const withClickSound = useCallback(
    <EventType,>(handler?: (event: EventType) => void) => {
      return (event: EventType) => {
        playClick();
        handler?.(event);
      };
    },
    [playClick]
  );

  const withHoverSound = useCallback(
    <EventType,>(key: string, handler?: (event: EventType) => void, cooldownMs = 1800) => {
      return (event: EventType) => {
        const now = window.performance.now();
        const lastPlayedAt = hoverTimestampsRef.current[key] ?? -Infinity;

        if (now - lastPlayedAt >= cooldownMs) {
          hoverTimestampsRef.current[key] = now;
          playHover();
        }

        handler?.(event);
      };
    },
    [playHover]
  );

  return {
    withClickSound,
    withHoverSound,
  };
}
