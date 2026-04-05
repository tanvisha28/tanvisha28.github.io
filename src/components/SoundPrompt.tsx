import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Volume2 } from "lucide-react";
import { useSound } from "../audio/useSound";

export function SoundPrompt() {
  const { showSoundPrompt, enableSound, dismissSoundPrompt } = useSound();

  return (
    <AnimatePresence>
      {showSoundPrompt ? (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex justify-center sm:inset-x-auto sm:right-5 sm:bottom-5"
        >
          <div className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/[0.72] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:w-[23rem]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_42%)]"
            />
            <div className="relative">
              <div className="flex items-center gap-3 text-white">
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 p-2 text-emerald-200">
                  <Volume2 size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">Cinematic Audio</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">Enable the full space-grade soundscape.</p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                Ambient atmosphere, section sweeps, and premium transition cues are available once you opt in.
              </p>

              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                <Sparkles size={13} className="text-cyan-300" />
                Balanced for desktop and mobile
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    void enableSound();
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-black transition-all hover:bg-emerald-400 hover:text-white"
                >
                  Enable Sound
                </button>
                <button
                  type="button"
                  onClick={dismissSoundPrompt}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-gray-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
