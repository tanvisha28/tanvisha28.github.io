/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import {
  AppWindow,
  ArrowRight,
  ChartCandlestick,
  ChartColumnIncreasing,
  DatabaseZap,
  FlaskConical,
  Gauge,
  GraduationCap,
  Languages,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { Project, Experience, SkillGroup, Education } from "../data/portfolioData";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ComponentType, RefObject } from "react";
import type { SoundInteractionHandlers } from "../audio/useSoundInteractions";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getProjectTone(project: Project) {
  const icon =
    project.icon === "trend"
      ? ChartCandlestick
      : project.icon === "pipeline"
        ? DatabaseZap
        : project.icon === "monitoring"
          ? Gauge
          : project.icon === "application"
            ? AppWindow
            : project.icon === "translation"
              ? Languages
              : ShieldCheck;

  const type = project.type;

  if (type === "AI") {
    return {
      icon,
      badge: "text-blue-400 border-blue-400/20 bg-blue-400/5",
      line: "bg-blue-400/40",
      glow: "shadow-[0_0_40px_rgba(59,130,246,0.08)]",
      markerIcon: "text-blue-400",
      restoreBorder: "border-blue-300/35",
      restoreGlow: "shadow-[0_0_65px_rgba(96,165,250,0.18)]",
      restoreWash: "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_60%)]",
      restoreBeam: "bg-gradient-to-r from-transparent via-blue-300/40 to-transparent",
    };
  }

  if (type === "DE") {
    return {
      icon,
      badge: "text-amber-400 border-amber-400/20 bg-amber-400/5",
      line: "bg-amber-400/40",
      glow: "shadow-[0_0_40px_rgba(245,158,11,0.08)]",
      markerIcon: "text-amber-400",
      restoreBorder: "border-amber-300/35",
      restoreGlow: "shadow-[0_0_65px_rgba(251,191,36,0.18)]",
      restoreWash: "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_60%)]",
      restoreBeam: "bg-gradient-to-r from-transparent via-amber-200/45 to-transparent",
    };
  }

  return {
    icon,
    badge: "text-purple-400 border-purple-400/20 bg-purple-400/5",
    line: "bg-purple-400/40",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.08)]",
    markerIcon: "text-purple-400",
    restoreBorder: "border-violet-300/35",
    restoreGlow: "shadow-[0_0_65px_rgba(196,181,253,0.18)]",
    restoreWash: "bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.18),transparent_60%)]",
    restoreBeam: "bg-gradient-to-r from-transparent via-violet-200/45 to-transparent",
  };
}

function getExperienceTone(experience: Experience) {
  const icon =
    experience.company === "Rutgers University"
      ? FlaskConical
      : experience.company === "Sonaflex Industries"
        ? ServerCog
        : ChartColumnIncreasing;

  return {
    icon,
    line: "bg-emerald-400/35",
    markerIcon: "text-emerald-400",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.08)]",
  };
}

function TimelineMarker({
  Icon,
  isLeft,
  lineClassName,
  iconClassName,
  glowClassName,
}: {
  Icon: ComponentType<{ className?: string; size?: string | number }>;
  isLeft: boolean;
  lineClassName: string;
  iconClassName: string;
  glowClassName?: string;
}) {
  return (
    <div className="relative order-1 flex items-center justify-center md:order-none md:col-start-2 md:row-start-1">
      <div
        className={cn(
          "absolute top-1/2 h-px w-5 -translate-y-1/2 md:w-7",
          lineClassName,
          isLeft ? "left-5 md:left-auto md:right-1/2" : "left-5 md:left-1/2"
        )}
      />
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black shadow-[0_0_25px_rgba(255,255,255,0.08)] md:h-14 md:w-14",
          glowClassName
        )}
      >
        <Icon size={18} className={cn(iconClassName, "md:h-5 md:w-5")} />
      </div>
    </div>
  );
}

export function SkillsGrid({
  skills,
  viewportRoot,
}: {
  skills: SkillGroup[];
  viewportRoot?: RefObject<Element | null>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {skills.map((group, idx) => (
        <motion.article
          key={group.category}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportRoot ? { once: true, amount: 0.3, root: viewportRoot } : { once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: idx * 0.08 }}
          className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-zinc-900/[0.55] md:p-8"
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

          <div className="relative">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                  {group.category}
                </h4>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">
                {group.skills.length} Skills
              </span>
            </div>

            <ul className="space-y-3">
              {group.skills.map((skill, skillIdx) => (
                <li
                  key={skill}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm font-medium text-gray-300 transition-all duration-300 hover:border-emerald-400/20 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]" />
                    <span>{skill}</span>
                  </div>
                  <span
                    aria-hidden
                    className={cn(
                      "h-px rounded-full bg-gradient-to-r from-emerald-500/0 via-emerald-400/70 to-cyan-400/0 transition-all duration-300 group-hover:w-14",
                      skillIdx % 4 === 0 ? "w-8" : skillIdx % 4 === 1 ? "w-10" : skillIdx % 4 === 2 ? "w-12" : "w-14"
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export function ProjectTree({
  projects,
  onProjectSelect,
  restoredProjectId,
  revealSoundId,
  viewportRoot,
  withClickSound,
  withHoverSound,
}: {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  restoredProjectId?: string | null;
  revealSoundId?: string;
  viewportRoot?: RefObject<Element | null>;
  withClickSound: SoundInteractionHandlers["withClickSound"];
  withHoverSound: SoundInteractionHandlers["withHoverSound"];
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-6xl"
      data-sound-reveal={revealSoundId ? "sectionSweep" : undefined}
      data-sound-reveal-id={revealSoundId}
    >
      <div className="absolute left-5 top-0 h-full w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />

      <div className="space-y-6 md:space-y-8">
        {projects.map((project, idx) => {
          const tone = getProjectTone(project);
          const Icon = tone.icon;
          const isLeft = idx % 2 === 0;
          const isRestoredProject = restoredProjectId === project.id;

          return (
            <motion.div
              key={project.id}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportRoot ? { once: true, amount: 0.25, root: viewportRoot } : { once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="grid items-center grid-cols-[40px_minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] md:gap-6"
            >
              <div
                className={cn(
                  "order-2 self-center md:order-none md:row-start-1",
                  isLeft ? "md:col-start-1" : "md:col-start-3"
                )}
              >
                <motion.article 
                  initial={false}
                  animate={isRestoredProject ? { y: [0, -10, 0], scale: [1, 1.014, 1] } : { y: 0, scale: 1 }}
                  transition={
                    isRestoredProject
                      ? { duration: 1.35, times: [0, 0.38, 1], ease: [0.22, 1, 0.36, 1] }
                      : { duration: 0.2 }
                  }
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 30 },
                  }}
                  className={cn(
                    "group pointer-events-auto relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-7 backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-500 hover:border-white/20 hover:bg-black/80 md:p-8",
                    tone.glow,
                    isRestoredProject && [tone.restoreBorder, tone.restoreGlow]
                  )}
                  data-restored-project={isRestoredProject ? "true" : undefined}
                >
                  <div
                    aria-hidden
                    className={cn("pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700", tone.restoreWash, isRestoredProject && "opacity-100")}
                  />
                  <motion.div
                    aria-hidden
                    className={cn("pointer-events-none absolute inset-y-0 -left-[22%] w-[44%] skew-x-[-22deg] blur-2xl", tone.restoreBeam)}
                    initial={false}
                    animate={
                      isRestoredProject
                        ? { x: ["0%", "220%"], opacity: [0, 0.78, 0] }
                        : { x: "0%", opacity: 0 }
                    }
                    transition={
                      isRestoredProject
                        ? { duration: 1.2, times: [0, 0.22, 1], ease: [0.22, 1, 0.36, 1] }
                        : { duration: 0.2 }
                    }
                  />
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent transition-opacity",
                      isRestoredProject ? "opacity-100" : "opacity-50 group-hover:opacity-100"
                    )}
                  />

                  <span className={cn("relative mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest", tone.badge)}>
                    <Icon size={14} />
                    {project.typeLabel}
                  </span>

                  <h3 className="relative mb-3 text-3xl font-bold text-white md:text-4xl">{project.title}</h3>
                  <p className="relative mb-6 text-sm font-medium uppercase tracking-[0.24em] text-gray-500">{project.domain}</p>
                  <p className="relative mb-8 leading-relaxed text-gray-400">{project.summary}</p>

                  <div className="relative mb-7 flex flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="relative mb-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500">Outcome</p>
                    <p className="text-sm leading-relaxed text-gray-300">{project.outcomes[0]}</p>
                  </div>

                  <button
                    type="button"
                    onClick={withClickSound(() => onProjectSelect(project.id))}
                    onMouseEnter={withHoverSound(`project-cta-${project.id}`)}
                    onFocus={withHoverSound(`project-cta-${project.id}`)}
                    className="relative inline-flex items-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95"
                  >
                    View Case Study <ArrowRight size={16} className="ml-2" />
                  </button>
                </motion.article>
              </div>

              <TimelineMarker
                Icon={Icon}
                isLeft={isLeft}
                lineClassName={tone.line}
                iconClassName={tone.markerIcon}
                glowClassName={tone.glow}
              />

              <div
                className={cn(
                  "order-3 hidden self-center items-center text-sm font-bold uppercase tracking-[0.24em] text-gray-500 md:flex md:row-start-1",
                  isLeft ? "md:col-start-3 md:justify-start" : "md:col-start-1 md:justify-end"
                )}
              >
                {project.role}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ExperienceTimeline({
  experiences,
  revealSoundId,
  viewportRoot,
}: {
  experiences: Experience[];
  revealSoundId?: string;
  viewportRoot?: RefObject<Element | null>;
}) {
  return (
    <div
      className="relative space-y-8 before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-white/10 md:space-y-10 md:before:left-1/2 md:before:-translate-x-1/2"
      data-sound-reveal={revealSoundId ? "sectionSweep" : undefined}
      data-sound-reveal-id={revealSoundId}
    >
      {experiences.map((exp, idx) => (
        <motion.div
          key={exp.company + idx}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportRoot ? { once: true, amount: 0.25, root: viewportRoot } : { once: true, amount: 0.25 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          className="grid items-center grid-cols-[40px_minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] md:gap-6"
        >
          {(() => {
            const isLeft = idx % 2 === 0;
            const tone = getExperienceTone(exp);
            const Icon = tone.icon;

            return (
              <>
                <div
                  className={cn(
                    "order-2 self-center md:order-none md:row-start-1",
                    isLeft ? "md:col-start-1" : "md:col-start-3"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="pointer-events-auto rounded-2xl border border-white/10 bg-zinc-900/50 p-7 text-left backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-zinc-900/70"
                  >
                    <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-emerald-400">
                      {exp.period}
                    </span>
                    <h3 className="mb-1 text-2xl font-bold text-white">{exp.role}</h3>
                    <p className="mb-5 text-sm font-medium text-gray-400">{exp.company}</p>
                    <ul className="mb-6 space-y-3">
                      {exp.description.map((item, i) => (
                        <li key={i} className="text-sm leading-relaxed text-gray-400">
                          • {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <TimelineMarker
                  Icon={Icon}
                  isLeft={isLeft}
                  lineClassName={tone.line}
                  iconClassName={tone.markerIcon}
                  glowClassName={tone.glow}
                />
              </>
            );
          })()}
        </motion.div>
      ))}
    </div>
  );
}

export function EducationGrid({
  education,
  viewportRoot,
}: {
  education: Education[];
  viewportRoot?: RefObject<Element | null>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {education.map((entry, idx) => (
        <motion.article
          key={entry.school}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportRoot ? { once: true, amount: 0.25, root: viewportRoot } : { once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: idx * 0.08 }}
          className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900/45 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-zinc-900/[0.58] md:p-8"
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_48%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                  <GraduationCap size={12} />
                  Education
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white">{entry.school}</h3>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">{entry.period}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">
                {entry.location}
              </span>
            </div>

            <p className="mb-5 text-base font-medium leading-relaxed text-gray-200">{entry.degree}</p>

            <ul className="space-y-3">
              {entry.details.map((detail) => (
                <li key={detail} className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm leading-relaxed text-gray-300">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
