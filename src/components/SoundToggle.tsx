import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "../audio/useSound";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { enabled, ready, toggleSound } = useSound();

  return (
    <button
      type="button"
      onClick={() => {
        void toggleSound();
      }}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable cinematic audio" : "Enable cinematic audio"}
      className={`group inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md transition-all hover:border-emerald-400/30 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${className}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full transition-all ${enabled ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" : "bg-white/30"} ${enabled && !ready ? "animate-pulse" : ""}`}
      />
      {enabled ? <Volume2 size={15} className="text-emerald-300" /> : <VolumeX size={15} className="text-white/70" />}
      <span>{enabled ? "Sound On" : "Sound Off"}</span>
    </button>
  );
}
