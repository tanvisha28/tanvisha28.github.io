/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, Bot, BrainCircuit, Database } from "lucide-react";
import { Project, Experience, SkillGroup } from "../data/portfolioData";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getProjectTone(type: Project["type"]) {
  if (type === "AI") {
    return {
      icon: Bot,
      badge: "text-blue-400 border-blue-400/20 bg-blue-400/5",
      line: "bg-blue-400/40",
      glow: "shadow-[0_0_40px_rgba(59,130,246,0.08)]",
    };
  }

  if (type === "DE") {
    return {
      icon: Database,
      badge: "text-amber-400 border-amber-400/20 bg-amber-400/5",
      line: "bg-amber-400/40",
      glow: "shadow-[0_0_40px_rgba(245,158,11,0.08)]",
    };
  }

  return {
    icon: BrainCircuit,
    badge: "text-purple-400 border-purple-400/20 bg-purple-400/5",
    line: "bg-purple-400/40",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.08)]",
  };
}

export function SkillsGrid({ skills }: { skills: SkillGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {skills.map((group, idx) => (
        <motion.div
          key={group.category}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: idx * 0.08 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/35 p-8 backdrop-blur-sm transition-all hover:border-emerald-400/30"
        >
          <motion.div
            aria-hidden
            className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
          />

          <div className="relative">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-emerald-400">
              {group.category}
            </h4>

            <ul className="space-y-3">
              {group.skills.map((skill, skillIdx) => (
                <motion.li
                  key={skill}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 + skillIdx * 0.04 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm font-medium text-gray-300 transition-colors group-hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{skill}</span>
                  </div>
                  <motion.span
                    aria-hidden
                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500/80 to-cyan-400/70"
                    animate={{ width: ["24px", "42px", "24px"] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: skillIdx * 0.15 }}
                  />
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ProjectTree({
  projects,
  onProjectSelect,
}: {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="absolute left-5 top-0 h-full w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />

      <div className="space-y-6 md:space-y-8">
        {projects.map((project, idx) => {
          const tone = getProjectTone(project.type);
          const Icon = tone.icon;
          const isLeft = idx % 2 === 0;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] md:gap-6"
            >
              <div className={cn("hidden md:block", isLeft ? "order-1" : "order-3")} />

              <div className={cn("order-2 md:order-none", isLeft ? "md:col-start-1" : "md:col-start-3")}>
                <article className={cn("pointer-events-auto relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-7 backdrop-blur-xl transition-all hover:border-white/20 md:p-8", tone.glow)}>
                  <motion.div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.25 }}
                  />

                  <span className={cn("mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest", tone.badge)}>
                    <Icon size={14} />
                    {project.type} Project
                  </span>

                  <h3 className="mb-3 text-3xl font-bold text-white md:text-4xl">{project.title}</h3>
                  <p className="mb-6 text-sm font-medium uppercase tracking-[0.24em] text-gray-500">{project.domain}</p>
                  <p className="mb-8 leading-relaxed text-gray-400">{project.summary}</p>

                  <div className="mb-7 flex flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mb-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500">Outcome</p>
                    <p className="text-sm leading-relaxed text-gray-300">{project.outcomes[0]}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onProjectSelect(project.id)}
                    className="inline-flex items-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-500 hover:text-white"
                  >
                    View Case Study <ArrowRight size={16} className="ml-2" />
                  </button>
                </article>
              </div>

              <div className="relative order-1 flex items-start justify-center md:order-none md:col-start-2">
                <div className={cn("absolute top-7 h-px w-5 md:w-7", tone.line, isLeft ? "left-5 md:left-auto md:right-1/2" : "left-5 md:left-1/2")} />
                <div className="relative z-10 mt-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black shadow-[0_0_25px_rgba(255,255,255,0.08)] md:h-14 md:w-14">
                  <Icon size={18} className={cn(project.type === "AI" ? "text-blue-400" : project.type === "DE" ? "text-amber-400" : "text-purple-400", "md:h-5 md:w-5")} />
                </div>
              </div>

              <div className={cn("order-3 hidden items-center text-sm font-bold uppercase tracking-[0.24em] text-gray-500 md:flex", isLeft ? "md:col-start-3 md:justify-start" : "md:col-start-1 md:justify-end")}>
                {project.role}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="relative space-y-8 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-white/10 md:space-y-10 md:before:left-1/2 md:before:-translate-x-1/2">
      {experiences.map((exp, idx) => (
        <motion.div
          key={exp.company + idx}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          className={cn(
            "relative flex w-full flex-col md:flex-row md:items-center",
            idx % 2 === 0 ? "md:justify-start" : "md:justify-end"
          )}
        >
          <div className="absolute left-0 top-8 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-black bg-emerald-500 md:left-1/2 md:top-1/2 md:-translate-y-1/2" />

          <div className={cn("w-full pl-8 md:w-1/2 md:pl-0", idx % 2 === 0 ? "md:pr-10" : "md:pl-10")}>
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-zinc-900/50 p-7 text-left backdrop-blur-sm">
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
                  <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
