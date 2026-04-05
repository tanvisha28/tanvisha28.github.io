/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";
import { ChevronDown, Mail, Linkedin, Github, MapPin, FileText } from "lucide-react";
import { defaultProfileSlug, isProfileSlug, portfolioProfiles, type PortfolioData } from "../data/portfolioData";
import { defaultHomeSceneRanges, type HomeSceneRanges, type SectionRange } from "../data/homeSceneData";
import { SceneLights } from "../components/3d/Common";
import { StoryScene } from "../components/3d/StoryScene";
import { Layout, Footer } from "../components/Layout";
import { SkillsGrid, ExperienceTimeline, ProjectTree, EducationGrid } from "../components/HomeSections";
import { useLocation, useNavigate, useNavigationType, useParams, Navigate } from "react-router-dom";
import { Component, useEffect, useMemo, useState, useRef, type ErrorInfo, type ReactNode, type RefObject } from "react";
import { motion, useIsPresent, useMotionValue } from "motion/react";
import { majorHomeSections } from "../audio/soundConfig";
import { useSound } from "../audio/useSound";
import { useSoundInteractions, type SoundInteractionHandlers } from "../audio/useSoundInteractions";
import { getEmailComposeUrl } from "../utils/contact";
import { withBasePath } from "../utils/publicAsset";
import { getProfileHomePath, getProfileProjectPath } from "../utils/profileRoutes";
import {
  clearPendingHomeRestore,
  createCaseStudyEntryState,
  getHomeRestoreState,
  markPendingHomeRestore,
  readHomeScrollSnapshot,
  readPendingHomeRestore,
  saveHomeScrollSnapshot,
  type HomeScrollMode,
} from "../utils/homeScrollState";

const HOME_SCROLL_SECTION_ORDER = ["hero", "about", "skills", "projects", "experience", "education", "contact", "footer"] as const;
type HomeScrollSectionName = (typeof HOME_SCROLL_SECTION_ORDER)[number];
const HOME_HASH_SECTION_IDS = ["projects", "experience", "education", "contact"] as const;
type HomeHashSectionId = (typeof HOME_HASH_SECTION_IDS)[number];
const HOME_SCROLL_SECTION_SELECTOR = ":scope > [data-home-scroll-section]";
const HOME_NAV_ANCHOR_BUFFER_PX = 18;
export const HOME_NAV_SCROLL_REQUEST_EVENT = "portfolio-home-nav-request";

function isHomeHashSectionId(value: string): value is HomeHashSectionId {
  return HOME_HASH_SECTION_IDS.includes(value as HomeHashSectionId);
}

function getHomeHashSectionId(hash: string) {
  const normalizedHash = hash.replace(/^#/, "");
  return isHomeHashSectionId(normalizedHash) ? normalizedHash : null;
}

function getHomeScrollSections(element: HTMLElement) {
  return Array.from(element.querySelectorAll<HTMLElement>(HOME_SCROLL_SECTION_SELECTOR));
}

function getHomeScrollSectionNames(element: HTMLElement) {
  return getHomeScrollSections(element)
    .map((section) => section.dataset.homeScrollSection)
    .filter((section): section is HomeScrollSectionName => HOME_SCROLL_SECTION_ORDER.includes(section as HomeScrollSectionName));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function SectionNavAnchor({ sectionId }: { sectionId: HomeHashSectionId }) {
  return <div aria-hidden data-home-nav-anchor={sectionId} className="pointer-events-none h-0 w-full" />;
}

type ScrollViewportState = {
  el: HTMLDivElement;
  fixed: HTMLDivElement;
  horizontal: boolean | undefined;
  pages: number;
  offset: number;
  delta: number;
  scroll?: { current: number };
};

function getHomeAnchorTopWithinContainer(anchor: HTMLElement, container: HTMLElement) {
  const ownerSection = anchor.closest<HTMLElement>("[data-home-scroll-section]");
  if (ownerSection && container.contains(ownerSection)) {
    const anchorDeltaWithinSection = anchor.getBoundingClientRect().top - ownerSection.getBoundingClientRect().top;
    return ownerSection.offsetTop + anchorDeltaWithinSection;
  }

  if (container.contains(anchor)) {
    return anchor.getBoundingClientRect().top - container.getBoundingClientRect().top;
  }

  return null;
}

function measureSceneSectionRange(
  container: HTMLElement,
  scrollViewport: HTMLDivElement,
  sectionName: "projects" | "experience" | "education" | "contact",
  fallback: SectionRange
) {
  const section = container.querySelector<HTMLElement>(`[data-home-scroll-section="${sectionName}"]`);
  if (!section) return fallback;

  const maxScroll = Math.max(1, scrollViewport.scrollHeight - scrollViewport.clientHeight);
  const start = clamp01(section.offsetTop / maxScroll);
  const end = clamp01((section.offsetTop + section.offsetHeight) / maxScroll);

  if (end <= start) return fallback;
  return { start, end };
}

function measureHomeSceneRanges(container: HTMLElement, scrollViewport: HTMLDivElement): HomeSceneRanges {
  return {
    projects: measureSceneSectionRange(container, scrollViewport, "projects", defaultHomeSceneRanges.projects),
    experience: measureSceneSectionRange(container, scrollViewport, "experience", defaultHomeSceneRanges.experience),
    education: measureSceneSectionRange(container, scrollViewport, "education", defaultHomeSceneRanges.education),
    contact: measureSceneSectionRange(container, scrollViewport, "contact", defaultHomeSceneRanges.contact),
  };
}

function canCreateWebGLContext() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    const attributes: WebGLContextAttributes = {
      alpha: true,
      antialias: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "high-performance",
    };

    const context =
      canvas.getContext("webgl2", attributes) ||
      canvas.getContext("webgl", attributes) ||
      canvas.getContext("experimental-webgl", attributes);

    if (!context) {
      return false;
    }

    const glContext = context as WebGL2RenderingContext | WebGLRenderingContext;
    const loseContext = glContext.getExtension?.("WEBGL_lose_context");
    loseContext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function isWebGLFailureMessage(message: string | undefined) {
  if (!message) return false;
  return /webgl context|webglrenderer|error creating webgl context/i.test(message);
}

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  state: CanvasErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

function AnimatedSectionIntro({
  children,
  className,
  soundRevealId,
  motionViewportRoot,
}: {
  children: ReactNode;
  className: string;
  soundRevealId?: string;
  motionViewportRoot?: RefObject<Element | null>;
}) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={motionViewportRoot ? { once: true, amount: 0.3, root: motionViewportRoot } : { once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
      data-sound-reveal={soundRevealId ? "sectionSweep" : undefined}
      data-sound-reveal-id={soundRevealId}
    >
      {children}
    </motion.div>
  );
}

function HomeScrollContent({
  canvasMode,
  portfolioData,
  containerRef,
  heroSectionRef,
  heroPortraitRef,
  onProjectSelect,
  onScrollToSection,
  restoredProjectId,
  sectionIntroClassName,
  motionViewportRoot,
  withClickSound,
  withHoverSound,
}: {
  canvasMode: boolean;
  portfolioData: PortfolioData;
  containerRef: RefObject<HTMLDivElement | null>;
  heroSectionRef: RefObject<HTMLElement | null>;
  heroPortraitRef: RefObject<HTMLDivElement | null>;
  onProjectSelect: (projectId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  restoredProjectId?: string | null;
  sectionIntroClassName: string;
  motionViewportRoot?: RefObject<Element | null>;
  withClickSound: SoundInteractionHandlers["withClickSound"];
  withHoverSound: SoundInteractionHandlers["withHoverSound"];
}) {
  return (
    <div
      ref={containerRef}
      className={canvasMode ? "relative z-10 flex w-full flex-col gap-0 pointer-events-none" : "relative z-10 flex w-full flex-col gap-0"}
    >
      {/* Hero */}
      <section
        ref={heroSectionRef}
        id="hero"
        data-home-scroll-section="hero"
        className="relative px-6 pt-28 pb-12 md:pt-32 md:pb-16"
      >
        <div className="home-hero-content pointer-events-auto mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl flex-col items-center justify-center text-center">
          <div className="relative mb-8 flex flex-col items-center">
            <div aria-hidden className="absolute inset-x-[-20%] top-10 h-28 rounded-full bg-emerald-500/10 blur-3xl" />
            <div ref={heroPortraitRef} className="relative">
              <div aria-hidden className="absolute inset-[-16px] rounded-full border border-emerald-400/15" />
              <div aria-hidden className="absolute inset-[-26px] rounded-full border border-emerald-300/10" />
              <div aria-hidden className="absolute inset-[-42px] rounded-full bg-emerald-500/10 blur-3xl" />
              <div aria-hidden className="absolute inset-[-56px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.14),transparent_70%)] blur-[72px]" />
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(52,211,153,0.15)] md:h-52 md:w-52">
                <img
                  src={withBasePath("profile.jpg")}
                  alt={portfolioData.personal.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
              </div>
            </div>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-[0.9] tracking-tighter text-white md:text-7xl lg:text-8xl">
            {portfolioData.personal.name}
          </h1>
          <p className="mx-auto mb-6 max-w-3xl text-lg leading-relaxed text-gray-400 md:mb-7 md:text-xl">
            {portfolioData.personal.headline}
          </p>

          <div className="mb-7 flex flex-wrap items-center justify-center gap-2.5 md:mb-8 md:gap-3">
            {portfolioData.personal.focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-300 backdrop-blur-sm"
              >
                {area}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={withClickSound(() => onScrollToSection("projects"))}
              onMouseEnter={withHoverSound("hero-projects")}
              onFocus={withHoverSound("hero-projects")}
              className="rounded-full bg-white px-6 py-3 text-[13px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-emerald-500 hover:text-white md:px-7 md:py-3.5 md:text-sm md:tracking-widest"
            >
              View Selected Work
            </button>
            <button
              type="button"
              onClick={withClickSound(() => onScrollToSection("contact"))}
              onMouseEnter={withHoverSound("hero-contact")}
              onFocus={withHoverSound("hero-contact")}
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-emerald-400/40 hover:bg-white/10 md:px-7 md:py-3.5 md:text-sm md:tracking-widest"
            >
              <Mail size={16} className="mr-2" /> Let&apos;s Talk
            </button>
          </div>

          <div className="mt-6 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500 md:mt-7 md:text-[11px]">
            Scroll to Explore <ChevronDown size={16} className="ml-2 animate-bounce text-emerald-400" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" data-home-scroll-section="about" className="px-6 py-14 md:py-20">
        <div className="pointer-events-auto mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/[0.5] shadow-[0_0_70px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_34%)]" />

            <div className="relative grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[minmax(0,1.32fr)_minmax(320px,0.9fr)] lg:gap-8 lg:px-10">
              <motion.div
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={motionViewportRoot ? { once: true, amount: 0.3, root: motionViewportRoot } : { once: true, amount: 0.3 }}
                transition={{ duration: 0.45 }}
                className="lg:pr-8"
              >
                <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {portfolioData.sectionCopy.about.eyebrow}
                </span>
                <h2 className="mb-6 max-w-4xl text-4xl font-bold tracking-tighter text-white md:text-5xl xl:text-[4.25rem] xl:leading-[0.94]">
                  {portfolioData.sectionCopy.about.title}
                </h2>
                <div className="max-w-3xl space-y-4 text-base leading-relaxed text-gray-400 md:text-lg">
                  {portfolioData.personal.about.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>

              <motion.aside
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={motionViewportRoot ? { once: true, amount: 0.35, root: motionViewportRoot } : { once: true, amount: 0.35 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="lg:border-l lg:border-white/8 lg:pl-8"
              >
                <div className="flex h-full flex-col gap-6 lg:justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.26em] text-gray-500">
                      {portfolioData.sectionCopy.about.impactLabel}
                    </span>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {portfolioData.metrics.map((metric, idx) => (
                        <motion.div
                          key={metric.label}
                          initial={false}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={motionViewportRoot ? { once: true, amount: 0.4, root: motionViewportRoot } : { once: true, amount: 0.4 }}
                          transition={{ duration: 0.35, delay: idx * 0.08 }}
                          className="flex min-h-[118px] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-black/35 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-md md:min-h-[128px] md:p-5"
                        >
                          <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">{metric.value}</div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{metric.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md md:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gray-500">
                      {portfolioData.sectionCopy.about.focusLabel}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {portfolioData.personal.focusAreas.map((area) => (
                        <span
                          key={area}
                          className="rounded-full border border-white/10 bg-black/25 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-300"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" data-home-scroll-section="skills" className="px-6 py-16 md:py-20">
        <div className="pointer-events-auto max-w-7xl mx-auto">
          <AnimatedSectionIntro
            className={`mb-10 max-w-5xl ${sectionIntroClassName}`}
            soundRevealId="skills-intro"
            motionViewportRoot={motionViewportRoot}
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_58%)]" />
            <div className="relative text-center">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">
                {portfolioData.sectionCopy.skills.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-4">{portfolioData.sectionCopy.skills.title}</h2>
              <p className="max-w-3xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                {portfolioData.sectionCopy.skills.description}
              </p>
            </div>
          </AnimatedSectionIntro>
          <div className="rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-[0_0_60px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-10">
            <SkillsGrid skills={portfolioData.skills} viewportRoot={motionViewportRoot} />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" data-home-scroll-section="projects" className="px-6 py-20 md:py-24">
        <div className="pointer-events-auto max-w-7xl mx-auto">
          <SectionNavAnchor sectionId="projects" />
          <AnimatedSectionIntro
            className={`mb-14 max-w-5xl ${sectionIntroClassName}`}
            soundRevealId="projects-intro"
            motionViewportRoot={motionViewportRoot}
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_56%)]" />
            <div className="relative text-center">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">{portfolioData.sectionCopy.projects.eyebrow}</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-5">{portfolioData.sectionCopy.projects.title}</h2>
              <p className="max-w-4xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                {portfolioData.sectionCopy.projects.description}
              </p>
            </div>
          </AnimatedSectionIntro>
          <ProjectTree
            projects={portfolioData.projects}
            onProjectSelect={onProjectSelect}
            restoredProjectId={restoredProjectId}
            revealSoundId="projects-tree"
            viewportRoot={motionViewportRoot}
            withClickSound={withClickSound}
            withHoverSound={withHoverSound}
          />
        </div>
      </section>

      {/* Experience */}
      <section id="experience" data-home-scroll-section="experience" className="px-6 py-16 md:py-20">
        <div className="pointer-events-auto w-full max-w-7xl mx-auto">
          <SectionNavAnchor sectionId="experience" />
          <AnimatedSectionIntro
            className={`mb-12 max-w-4xl ${sectionIntroClassName}`}
            soundRevealId="experience-intro"
            motionViewportRoot={motionViewportRoot}
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_58%)]" />
            <div className="relative text-center">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">{portfolioData.sectionCopy.experience.eyebrow}</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-4">{portfolioData.sectionCopy.experience.title}</h2>
              <p className="max-w-3xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                {portfolioData.sectionCopy.experience.description}
              </p>
            </div>
          </AnimatedSectionIntro>
          <div className="px-2 md:px-4">
            <ExperienceTimeline
              experiences={portfolioData.experience}
              revealSoundId="experience-timeline"
              viewportRoot={motionViewportRoot}
            />
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" data-home-scroll-section="education" className="px-6 py-16 md:py-20">
        <div className="pointer-events-auto max-w-7xl mx-auto">
          <SectionNavAnchor sectionId="education" />
          <AnimatedSectionIntro
            className={`mb-12 max-w-5xl ${sectionIntroClassName}`}
            soundRevealId="education-intro"
            motionViewportRoot={motionViewportRoot}
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.14),transparent_58%)]" />
            <div className="relative text-center">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">{portfolioData.sectionCopy.education.eyebrow}</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-4">{portfolioData.sectionCopy.education.title}</h2>
              <p className="max-w-3xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                {portfolioData.sectionCopy.education.description}
              </p>
            </div>
          </AnimatedSectionIntro>
          <EducationGrid education={portfolioData.education} viewportRoot={motionViewportRoot} />
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        data-home-scroll-section="contact"
        className="relative overflow-hidden px-6 pt-16 pb-14 md:pt-24 md:pb-20"
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_72%_34%,rgba(16,185,129,0.14),transparent_40%)]" />
        <div className="pointer-events-auto relative z-10 max-w-5xl mx-auto">
          <SectionNavAnchor sectionId="contact" />
          <div
            data-sound-reveal="sectionSweep"
            data-sound-reveal-id="contact-panel"
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/[0.58] px-6 py-8 shadow-[0_0_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:px-10 md:py-10"
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_56%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="text-center lg:text-left">
                <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {portfolioData.sectionCopy.contact.eyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tighter text-white md:text-5xl">
                  {portfolioData.sectionCopy.contact.title}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
                  {portfolioData.sectionCopy.contact.description}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                  {portfolioData.sectionCopy.contact.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-300"
                    >
                      {chip}
                    </span>
                  ))}
                  <span className="rounded-full border border-emerald-400/18 bg-emerald-400/[0.04] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                    {portfolioData.personal.location}
                  </span>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <a
                    href={getEmailComposeUrl(portfolioData.personal.email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={withClickSound()}
                    onMouseEnter={withHoverSound("contact-email")}
                    onFocus={withHoverSound("contact-email")}
                    className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-500 hover:text-white"
                  >
                    <Mail size={16} className="mr-2" /> Email Me
                  </a>
                  <a
                    href={portfolioData.personal.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={withClickSound()}
                    onMouseEnter={withHoverSound("contact-resume")}
                    onFocus={withHoverSound("contact-resume")}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:border-emerald-400/35 hover:bg-white/[0.08]"
                  >
                    <FileText size={16} className="mr-2" /> View Resume
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-6">
                <div className="mb-5 border-b border-white/8 pb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    {portfolioData.sectionCopy.contact.reachLabel}
                  </p>
                  <a
                    href={getEmailComposeUrl(portfolioData.personal.email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-base font-semibold text-white transition-colors hover:text-emerald-300 md:text-lg"
                  >
                    <Mail size={17} className="mr-3 text-emerald-400" />
                    {portfolioData.personal.email}
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin size={16} className="mr-3 text-emerald-400" />
                      Base Location
                    </div>
                    <span className="text-sm font-medium text-white">{portfolioData.personal.location}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Linkedin size={16} className="mr-3 text-emerald-400" />
                      LinkedIn
                    </div>
                    <a
                      href={portfolioData.personal.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white transition-colors hover:text-emerald-300"
                    >
                      Connect
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Github size={16} className="mr-3 text-emerald-400" />
                      GitHub
                    </div>
                    <a
                      href={portfolioData.personal.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white transition-colors hover:text-emerald-300"
                    >
                      Review Work
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Footer"
        data-home-scroll-section="footer"
        className="pointer-events-auto relative z-10 w-full bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.62)_28%,#000_100%)] pt-8 md:pt-10"
      >
        <Footer portfolioData={portfolioData} />
      </section>
    </div>
  );
}

function ScrollViewportBridge({
  onReady,
}: {
  onReady: (state: ScrollViewportState) => void;
}) {
  const data = useScroll();

  useEffect(() => {
    onReady(data as unknown as ScrollViewportState);
  }, [data, onReady]);

  return null;
}

export default function Home() {
  const location = useLocation();
  const { hash, key: locationKey } = location;
  const navigationType = useNavigationType();
  const { profileSlug: profileSlugParam } = useParams();
  const hasValidProfileSlug = isProfileSlug(profileSlugParam);
  const profileSlug = hasValidProfileSlug ? profileSlugParam : defaultProfileSlug;
  const portfolioData = portfolioProfiles[profileSlug];
  const navigate = useNavigate();
  const isPresent = useIsPresent();
  const { markSectionEntered, playCue } = useSound();
  const { withClickSound, withHoverSound } = useSoundInteractions();
  const [isCanvasEnabled, setIsCanvasEnabled] = useState(() => canCreateWebGLContext());
  const [pages, setPages] = useState(1);
  const [sectionRanges, setSectionRanges] = useState<HomeSceneRanges>(defaultHomeSceneRanges);
  const [scrollViewportVersion, setScrollViewportVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const scrollViewportStateRef = useRef<ScrollViewportState | null>(null);
  const scrollViewportStateChangedAtRef = useRef(0);
  const hasInitializedCanvasViewportRef = useRef(false);
  const enteredHomeWithHashRef = useRef(Boolean(hash));
  const previousHashRef = useRef(hash);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroPortraitRef = useRef<HTMLDivElement>(null);
  const [homeRestoreStatus, setHomeRestoreStatus] = useState<"idle" | "pending" | "restored">("idle");
  const [restoreRetryVersion, setRestoreRetryVersion] = useState(0);
  const [hashRetryVersion, setHashRetryVersion] = useState(0);
  const [pendingHashSection, setPendingHashSection] = useState<{ sectionId: HomeHashSectionId; settledTargetTop: number | null } | null>(null);
  const [restoredProjectId, setRestoredProjectId] = useState<string | null>(null);
  const heroAnchorX = useMotionValue(0);
  const heroAnchorY = useMotionValue(0.18);
  const heroIntroProgress = useMotionValue(0);
  const heroAnchor = useMemo(
    () => ({
      x: heroAnchorX,
      y: heroAnchorY,
    }),
    [heroAnchorX, heroAnchorY]
  );
  const shouldPreserveHomeScroll = homeRestoreStatus !== "idle";

  const resetWindowScrollPosition = () => {
    document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const resetCanvasScrollViewport = () => {
    const scrollViewport = scrollViewportRef.current;
    if (!scrollViewport) return;

    scrollViewport.scrollLeft = 0;
    scrollViewport.scrollTop = 1;
    const maxScroll = Math.max(1, scrollViewport.scrollHeight - scrollViewport.clientHeight);
    syncCanvasScrollViewportState(1, maxScroll);
  };

  const getCurrentHomeScrollSnapshot = (sourceProjectId: string) => {
    const canvasScrollViewport = scrollViewportRef.current;
    const mode: HomeScrollMode = isCanvasEnabled && canvasScrollViewport ? "canvas" : "dom";
    const scrollTop =
      mode === "canvas"
        ? canvasScrollViewport.scrollTop
        : document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;

    return {
      profileSlug,
      mode,
      scrollTop,
      sourceProjectId,
      timestamp: Date.now(),
    };
  };

  const applyWindowScrollRestore = (targetTop: number) => {
    const normalizedTarget = Math.max(0, targetTop);
    document.scrollingElement?.scrollTo({ top: normalizedTarget, left: 0, behavior: "auto" });
    window.scrollTo({ top: normalizedTarget, left: 0, behavior: "auto" });
  };

  const syncCanvasScrollViewportState = (targetTop: number, maxScroll: number) => {
    const scrollViewportState = scrollViewportStateRef.current;
    if (!scrollViewportState || scrollViewportState.horizontal) return;

    const viewportHeight = scrollViewportState.el.clientHeight;
    if (viewportHeight > 0) {
      scrollViewportState.pages = scrollViewportState.el.scrollHeight / viewportHeight;
    }

    const normalizedTarget = maxScroll > 0 ? targetTop / maxScroll : 0;
    scrollViewportState.offset = normalizedTarget;
    scrollViewportState.delta = 1;
    if (scrollViewportState.scroll) {
      scrollViewportState.scroll.current = normalizedTarget;
    }

    const scrollHtmlLayer = scrollViewportState.fixed.firstElementChild;
    if (scrollHtmlLayer instanceof HTMLElement) {
      scrollHtmlLayer.style.transform = `translate3d(0px,${-targetTop}px,0)`;
    }
  };

  const applyCanvasScrollRestore = (targetTop: number) => {
    const scrollViewport = scrollViewportRef.current;
    if (!scrollViewport) return;

    const maxScroll = Math.max(1, scrollViewport.scrollHeight - scrollViewport.clientHeight);
    const clampedTarget = Math.max(1, Math.min(targetTop, maxScroll));
    scrollViewport.scrollLeft = 0;
    scrollViewport.scrollTo({ top: clampedTarget, behavior: "auto" });
    syncCanvasScrollViewportState(clampedTarget, maxScroll);
  };

  const getHomeNavScrollClearance = () => {
    const navbar = document.querySelector<HTMLElement>("[data-site-navbar]");
    const navbarHeight = navbar?.getBoundingClientRect().height ?? 88;
    return navbarHeight + HOME_NAV_ANCHOR_BUFFER_PX;
  };

  const resolveHomeNavAnchor = (sectionId: HomeHashSectionId) => {
    const container = containerRef.current;
    if (!container) return null;

    return (
      container.querySelector<HTMLElement>(`[data-home-nav-anchor="${sectionId}"]`) ??
      document.getElementById(sectionId)
    );
  };

  const getSectionScrollMetrics = (sectionId: HomeHashSectionId) => {
    const anchor = resolveHomeNavAnchor(sectionId);
    if (!anchor) return null;

    const clearance = getHomeNavScrollClearance();
    const scrollViewport = scrollViewportRef.current;

    if (isCanvasEnabled) {
      if (!scrollViewport) return null;

      const container = containerRef.current;
      if (!container) return null;

      const anchorTopWithinContainer = getHomeAnchorTopWithinContainer(anchor, container);
      if (anchorTopWithinContainer === null) return null;

      const maxScroll = Math.max(1, scrollViewport.scrollHeight - scrollViewport.clientHeight);
      const rawTargetTop = anchorTopWithinContainer - clearance;
      const targetTop = Math.max(1, Math.min(rawTargetTop, maxScroll));

      return {
        mode: "canvas" as const,
        targetTop,
        rawTargetTop,
        maxScroll,
      };
    }

    const scrollingElement = document.scrollingElement;
    const scrollHeight = scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight ?? 0;
    const clientHeight = scrollingElement?.clientHeight ?? window.innerHeight ?? document.documentElement.clientHeight ?? 0;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const rawTargetTop = window.scrollY + anchor.getBoundingClientRect().top - clearance;
    const targetTop = Math.max(0, Math.min(rawTargetTop, maxScroll));

    return {
      mode: "dom" as const,
      targetTop,
      rawTargetTop,
      maxScroll,
    };
  };

  const applySectionScroll = (sectionId: HomeHashSectionId, behavior: ScrollBehavior = "smooth") => {
    const metrics = getSectionScrollMetrics(sectionId);
    if (!metrics) return false;

    if (metrics.maxScroll + 1 < metrics.rawTargetTop) {
      return false;
    }

    if (metrics.mode === "canvas") {
      const scrollViewport = scrollViewportRef.current;
      if (!scrollViewport) return false;

      scrollViewport.scrollLeft = 0;
      scrollViewport.scrollTo({ top: metrics.targetTop, behavior });
      syncCanvasScrollViewportState(metrics.targetTop, metrics.maxScroll);
      return true;
    }

    document.scrollingElement?.scrollTo({ top: metrics.targetTop, left: 0, behavior });
    window.scrollTo({ top: metrics.targetTop, left: 0, behavior });
    return true;
  };

  const requestHashSectionScroll = (sectionId: HomeHashSectionId, behavior: ScrollBehavior = "smooth") => {
    const didApply = applySectionScroll(sectionId, behavior);
    if (!didApply) {
      setPendingHashSection({ sectionId, settledTargetTop: null });
      return;
    }

    setPendingHashSection((current) =>
      current?.sectionId === sectionId
        ? { sectionId, settledTargetTop: current.settledTargetTop }
        : { sectionId, settledTargetTop: null }
    );
  };

  const canReachWindowRestoreTarget = (targetTop: number) => {
    const normalizedTarget = Math.max(0, targetTop);
    const scrollingElement = document.scrollingElement;
    const scrollHeight = scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight ?? 0;
    const clientHeight = scrollingElement?.clientHeight ?? window.innerHeight ?? document.documentElement.clientHeight ?? 0;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    return maxScroll + 1 >= normalizedTarget;
  };

  const canReachCanvasRestoreTarget = (targetTop: number) => {
    const scrollViewport = scrollViewportRef.current;
    if (!scrollViewport) return false;

    const normalizedTarget = Math.max(1, targetTop);
    const maxScroll = Math.max(1, scrollViewport.scrollHeight - scrollViewport.clientHeight);
    return maxScroll + 1 >= normalizedTarget;
  };

  const hasStableCanvasViewportState = () => {
    return Date.now() - scrollViewportStateChangedAtRef.current >= 280;
  };

  const hasSettledCanvasHashTarget = (sectionId: HomeHashSectionId, targetTop: number) => {
    const scrollViewport = scrollViewportRef.current;
    const anchor = resolveHomeNavAnchor(sectionId);
    if (!scrollViewport || !anchor) return false;

    const clearance = getHomeNavScrollClearance();
    return (
      Math.abs(scrollViewport.scrollTop - targetTop) <= 2 &&
      Math.abs(anchor.getBoundingClientRect().top - clearance) <= 24
    );
  };

  const nudgeCanvasHashTarget = (targetTop: number, maxScroll: number) => {
    const scrollViewport = scrollViewportRef.current;
    if (!scrollViewport) return;
    if (Math.abs(scrollViewport.scrollTop - targetTop) > 1) return;

    const nudgedTargetTop =
      targetTop <= 3 ? Math.min(maxScroll, targetTop + 3) : Math.max(1, targetTop - 3);

    if (Math.abs(nudgedTargetTop - targetTop) <= 0.5) return;

    scrollViewport.scrollLeft = 0;
    scrollViewport.scrollTo({ top: nudgedTargetTop, behavior: "auto" });
  };

  const setScrollViewport = (state: ScrollViewportState) => {
    const previousState = scrollViewportStateRef.current;
    scrollViewportStateRef.current = state;

    if (scrollViewportRef.current !== state.el) {
      scrollViewportRef.current = state.el;
    }

    if (previousState !== state) {
      scrollViewportStateChangedAtRef.current = Date.now();
      setScrollViewportVersion((value) => value + 1);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    enteredHomeWithHashRef.current = Boolean(hash);
    const hashSectionId = getHomeHashSectionId(hash);
    const explicitRestore = getHomeRestoreState(location.state);
    const pendingPopRestore = navigationType === "POP" ? readPendingHomeRestore(profileSlug) : null;
    const shouldRestoreHomeScroll =
      explicitRestore?.profileSlug === profileSlug || pendingPopRestore?.profileSlug === profileSlug;

    if (hash) {
      if (shouldRestoreHomeScroll) {
        setPendingHashSection(null);
        setRestoredProjectId(null);
        setHomeRestoreStatus("pending");
        return;
      }

      clearPendingHomeRestore(profileSlug);
      setRestoredProjectId(null);
      setPendingHashSection(
        shouldPreserveHomeScroll || !hashSectionId
          ? null
          : { sectionId: hashSectionId, settledTargetTop: null }
      );
      setHomeRestoreStatus("idle");
      return;
    }

    setPendingHashSection(null);
    if (shouldRestoreHomeScroll) {
      setRestoredProjectId(null);
      setHomeRestoreStatus("pending");
      return;
    }

    clearPendingHomeRestore(profileSlug);
    setRestoredProjectId(null);
    setHomeRestoreStatus("idle");
  }, [hash, location.state, navigationType, profileSlug, locationKey, shouldPreserveHomeScroll]);

  const disableCanvas = () => {
    scrollViewportStateRef.current = null;
    scrollViewportRef.current = null;
    setIsCanvasEnabled(false);
  };

  const handleCanvasError = (error: Error) => {
    const isProductionBuild = (import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD ?? false;
    if (!isProductionBuild) {
      console.warn("[Home] Canvas render failed. Falling back to DOM homepage.", error);
    }

    disableCanvas();
  };

  useEffect(() => {
    const handleWebGLError = (message: string | undefined) => {
      if (isWebGLFailureMessage(message)) {
        disableCanvas();
      }
    };

    const onError = (event: ErrorEvent) => {
      handleWebGLError(event.message);
      handleWebGLError(event.error instanceof Error ? event.error.message : undefined);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (typeof reason === "string") {
        handleWebGLError(reason);
        return;
      }

      if (reason instanceof Error) {
        handleWebGLError(reason.message);
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (homeRestoreStatus !== "pending") return;

    const snapshot = readHomeScrollSnapshot(profileSlug);
    if (!snapshot) {
      clearPendingHomeRestore(profileSlug);
      setRestoredProjectId(null);
      setHomeRestoreStatus("idle");
      return;
    }

    if (isCanvasEnabled) {
      if (!canReachCanvasRestoreTarget(snapshot.scrollTop) || !hasStableCanvasViewportState()) {
        const timeout = window.setTimeout(() => {
          setRestoreRetryVersion((current) => current + 1);
        }, 140);

        return () => window.clearTimeout(timeout);
      }

      let frame = 0;
      const timeouts: number[] = [];
      const restore = () => applyCanvasScrollRestore(snapshot.scrollTop);

      restore();
      frame = window.requestAnimationFrame(() => {
        restore();
        timeouts.push(window.setTimeout(restore, 120));
        timeouts.push(window.setTimeout(restore, 320));
      });

      setRestoredProjectId(snapshot.sourceProjectId);
      clearPendingHomeRestore(profileSlug);
      setHomeRestoreStatus("restored");

      return () => {
        window.cancelAnimationFrame(frame);
        timeouts.forEach((timeout) => window.clearTimeout(timeout));
      };
    }

    if (!canReachWindowRestoreTarget(snapshot.scrollTop)) {
      const timeout = window.setTimeout(() => {
        setRestoreRetryVersion((current) => current + 1);
      }, 140);

      return () => window.clearTimeout(timeout);
    }

    let frame = 0;
    const timeouts: number[] = [];
    const restore = () => applyWindowScrollRestore(snapshot.scrollTop);

    restore();
    frame = window.requestAnimationFrame(() => {
      restore();
      timeouts.push(window.setTimeout(restore, 120));
      timeouts.push(window.setTimeout(restore, 320));
    });

    setRestoredProjectId(snapshot.sourceProjectId);
    clearPendingHomeRestore(profileSlug);
    setHomeRestoreStatus("restored");

    return () => {
      window.cancelAnimationFrame(frame);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [homeRestoreStatus, isCanvasEnabled, profileSlug, restoreRetryVersion, scrollViewportVersion, pages]);

  useEffect(() => {
    if (homeRestoreStatus !== "restored" || !restoredProjectId) return;

    const timeout = window.setTimeout(() => {
      setRestoredProjectId((current) => (current === restoredProjectId ? null : current));
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [homeRestoreStatus, restoredProjectId]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    const observedSections = new Set<HTMLElement>();
    let observer: ResizeObserver | null = null;
    const observeSections = () => {
      if (!observer) return;
      getHomeScrollSections(element).forEach((section) => {
        if (observedSections.has(section)) return;
        observedSections.add(section);
        observer?.observe(section);
      });
    };

    const updatePages = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        observeSections();
        const sections = getHomeScrollSections(element);
        const measuredHeight = sections.reduce((total, section) => {
          if (!(section instanceof HTMLElement)) return total;
          return Math.max(total, section.offsetTop + section.offsetHeight);
        }, 0);
        const totalHeight = Math.max(measuredHeight, element.scrollHeight);
        const vh = scrollViewportRef.current?.clientHeight || window.innerHeight || 1;
        setPages(Math.max(1, (totalHeight + 1) / vh));
      });
    };

    updatePages();
    observer = new ResizeObserver(updatePages);
    observer.observe(element);
    observeSections();
    const mutationObserver = new MutationObserver(updatePages);
    mutationObserver.observe(element, { childList: true });
    window.addEventListener("resize", updatePages);
    const timeouts = [150, 350, 700, 1200].map((delay) => window.setTimeout(updatePages, delay));

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updatePages);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [scrollViewportVersion]);

  useEffect(() => {
    const isProductionBuild = (import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD ?? false;
    if (isProductionBuild) return;

    const element = containerRef.current;
    if (!element) return;

    const sectionNames = getHomeScrollSectionNames(element);
    const missingSections = HOME_SCROLL_SECTION_ORDER.filter((sectionName) => !sectionNames.includes(sectionName));
    const contactSection = document.getElementById("contact");
    const lastTwoSections = sectionNames.slice(-2);

    const warnings: string[] = [];

    if (!contactSection) {
      warnings.push("Missing #contact section.");
    }

    if (missingSections.length > 0) {
      warnings.push(`Missing home scroll sections: ${missingSections.join(", ")}.`);
    }

    if (lastTwoSections[0] !== "contact" || lastTwoSections[1] !== "footer") {
      warnings.push(`Expected the final home scroll sections to be contact -> footer, found ${lastTwoSections.join(" -> ") || "(none)"}.`);
    }

    if (warnings.length > 0) {
      console.warn("[Home] Homepage scroll section invariant failed.", ...warnings);
    }
  }, [pages, scrollViewportVersion]);

  useEffect(() => {
    const element = containerRef.current;
    const scrollViewport = scrollViewportRef.current;
    if (!element || !scrollViewport) return;

    let frame = 0;
    const updateSectionRanges = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setSectionRanges(measureHomeSceneRanges(element, scrollViewport));
      });
    };

    updateSectionRanges();
    const observer = new ResizeObserver(updateSectionRanges);
    observer.observe(element);
    observer.observe(scrollViewport);
    getHomeScrollSections(element).forEach((section) => {
      observer.observe(section);
    });
    window.addEventListener("resize", updateSectionRanges);
    const timeout = window.setTimeout(updateSectionRanges, 350);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateSectionRanges);
      window.clearTimeout(timeout);
    };
  }, [pages, scrollViewportVersion]);

  const scrollToSection = (sectionId: string, behavior: ScrollBehavior = "smooth") => {
    const hashSectionId = isHomeHashSectionId(sectionId) ? sectionId : null;
    if (hashSectionId) {
      requestHashSectionScroll(hashSectionId, behavior);
      return;
    }

    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior, block: "start" });
  };

  const sectionIntroClassName =
    "relative mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-black/[0.45] px-6 py-8 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-10 md:py-10";

  const openProjectDetail = (projectId: string) => {
    const snapshot = getCurrentHomeScrollSnapshot(projectId);
    saveHomeScrollSnapshot(snapshot);
    markPendingHomeRestore({
      profileSlug,
      sourceProjectId: projectId,
      reason: "case-study-entry",
      requestedAt: Date.now(),
    });

    playCue("caseStudyOpen");
    navigate(getProfileProjectPath(profileSlug, projectId), {
      state: createCaseStudyEntryState({
        profileSlug,
        sourceProjectId: projectId,
        previousRouteKind: "home",
      }),
    });
  };

  useEffect(() => {
    if (isCanvasEnabled || hash || shouldPreserveHomeScroll) return;

    let frame = 0;
    const timeouts: number[] = [];

    frame = window.requestAnimationFrame(() => {
      resetWindowScrollPosition();
      timeouts.push(window.setTimeout(resetWindowScrollPosition, 120));
      timeouts.push(window.setTimeout(resetWindowScrollPosition, 360));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [hash, isCanvasEnabled, locationKey, shouldPreserveHomeScroll]);

  useEffect(() => {
    if (!isCanvasEnabled || hash || shouldPreserveHomeScroll) return;
    if (enteredHomeWithHashRef.current) return;
    if (hasInitializedCanvasViewportRef.current) return;
    if (pages <= 1.01) return;
    if (!scrollViewportRef.current) return;

    hasInitializedCanvasViewportRef.current = true;

    let frame = 0;
    const timeouts: number[] = [];
    const syncViewportToHero = () => resetCanvasScrollViewport();

    syncViewportToHero();
    frame = window.requestAnimationFrame(() => {
      syncViewportToHero();
      timeouts.push(window.setTimeout(syncViewportToHero, 120));
      timeouts.push(window.setTimeout(syncViewportToHero, 320));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [hash, isCanvasEnabled, pages, scrollViewportVersion, shouldPreserveHomeScroll]);

  useEffect(() => {
    if (!pendingHashSection || shouldPreserveHomeScroll) return;

    const metrics = getSectionScrollMetrics(pendingHashSection.sectionId);
    if (!metrics || metrics.maxScroll + 1 < metrics.rawTargetTop) {
      const timeout = window.setTimeout(() => {
        setHashRetryVersion((current) => current + 1);
      }, 140);

      return () => window.clearTimeout(timeout);
    }

    const hasSettledCanvasTargetBeforeApply =
      metrics.mode === "canvas" ? hasSettledCanvasHashTarget(pendingHashSection.sectionId, metrics.targetTop) : true;

    if (metrics.mode === "canvas" && !hasSettledCanvasTargetBeforeApply) {
      nudgeCanvasHashTarget(metrics.targetTop, metrics.maxScroll);
    }

    applySectionScroll(pendingHashSection.sectionId, "auto");
    const hasSettledCanvasTarget =
      metrics.mode === "canvas" ? hasSettledCanvasHashTarget(pendingHashSection.sectionId, metrics.targetTop) : true;
    const hasStableCanvasTargetState = metrics.mode === "canvas" ? hasStableCanvasViewportState() : true;

    if (
      pendingHashSection.settledTargetTop !== null &&
      Math.abs(pendingHashSection.settledTargetTop - metrics.targetTop) <= 1 &&
      hasSettledCanvasTarget &&
      hasStableCanvasTargetState
    ) {
      const timeout = window.setTimeout(() => {
        setPendingHashSection((current) =>
          current?.sectionId === pendingHashSection.sectionId ? null : current
        );
      }, 120);

      return () => window.clearTimeout(timeout);
    }

    if (metrics.mode === "canvas" && !hasStableCanvasTargetState) {
      const timeout = window.setTimeout(() => {
        setHashRetryVersion((current) => current + 1);
      }, 140);

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setPendingHashSection((current) =>
        current?.sectionId === pendingHashSection.sectionId
          ? { sectionId: current.sectionId, settledTargetTop: metrics.targetTop }
          : current
      );
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [hashRetryVersion, pendingHashSection, pages, scrollViewportVersion, shouldPreserveHomeScroll, isCanvasEnabled]);

  useEffect(() => {
    const handleHomeNavScrollRequest = (event: Event) => {
      const detail = event instanceof CustomEvent ? (event.detail as { sectionId?: string } | null) : null;
      const sectionId = detail?.sectionId;
      if (!sectionId || !isHomeHashSectionId(sectionId) || shouldPreserveHomeScroll) {
        return;
      }

      requestHashSectionScroll(sectionId, "smooth");
    };

    window.addEventListener(HOME_NAV_SCROLL_REQUEST_EVENT, handleHomeNavScrollRequest);

    return () => {
      window.removeEventListener(HOME_NAV_SCROLL_REQUEST_EVENT, handleHomeNavScrollRequest);
    };
  }, [shouldPreserveHomeScroll, pages, scrollViewportVersion, isCanvasEnabled]);

  useEffect(() => {
    const previousHash = previousHashRef.current;
    previousHashRef.current = hash;

    if (!isCanvasEnabled || hash || !previousHash || shouldPreserveHomeScroll) return;
    if (!scrollViewportRef.current) return;

    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      resetCanvasScrollViewport();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [hash, isCanvasEnabled, scrollViewportVersion, shouldPreserveHomeScroll]);

  useEffect(() => {
    const scrollViewport = scrollViewportRef.current;
    const heroSection = heroSectionRef.current;
    const portrait = heroPortraitRef.current;
    if (!scrollViewport || !heroSection || !portrait) return;

    let frame = 0;
    const measureHeroState = () => {
      const rect = portrait.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const viewportRect = scrollViewport.getBoundingClientRect();
      const viewportWidth = viewportRect.width || window.innerWidth || 1;
      const viewportHeight = viewportRect.height || window.innerHeight || 1;

      const normalizedX = ((centerX - viewportRect.left) / viewportWidth) * 2 - 1;
      const normalizedY = 1 - ((centerY - viewportRect.top) / viewportHeight) * 2;

      heroAnchorX.set(Math.max(-1, Math.min(1, normalizedX)));
      heroAnchorY.set(Math.max(-1, Math.min(1, normalizedY)));

      const heroTop = heroSection.offsetTop;
      const heroTravel = Math.max(heroSection.offsetHeight, scrollViewport.clientHeight * 0.95);
      const rawProgress = (scrollViewport.scrollTop - heroTop) / heroTravel;
      heroIntroProgress.set(Math.max(0, Math.min(1, rawProgress)));
    };

    const updateHeroAnchor = () => {
      measureHeroState();
      frame = window.requestAnimationFrame(updateHeroAnchor);
    };

    updateHeroAnchor();
    const observer = new ResizeObserver(measureHeroState);
    observer.observe(heroSection);
    observer.observe(portrait);
    window.addEventListener("resize", measureHeroState);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measureHeroState);
    };
  }, [heroAnchorX, heroAnchorY, heroIntroProgress, scrollViewportVersion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = isCanvasEnabled ? scrollViewportRef.current : null;
    if (isCanvasEnabled && !root) {
      return;
    }

    const revealTargets = Array.from(container.querySelectorAll<HTMLElement>("[data-sound-reveal='sectionSweep']"));
    const sectionTargets = majorHomeSections
      .map((sectionName) => container.querySelector<HTMLElement>(`[data-home-scroll-section="${sectionName}"]`))
      .filter((section): section is HTMLElement => Boolean(section));

    if (revealTargets.length === 0 && sectionTargets.length === 0) {
      return;
    }

    const revealedIds = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          const sectionName = target.dataset.homeScrollSection;

          if (
            sectionName === "projects" ||
            sectionName === "experience" ||
            sectionName === "education" ||
            sectionName === "contact"
          ) {
            markSectionEntered(sectionName);
          }

          const revealId = target.dataset.soundRevealId;
          if (target.dataset.soundReveal === "sectionSweep" && revealId && !revealedIds.has(revealId)) {
            revealedIds.add(revealId);
            playCue("sectionSweep", { automatic: true });
            observer.unobserve(target);
          }
        });
      },
      {
        root,
        threshold: 0.35,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    [...sectionTargets, ...revealTargets].forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [isCanvasEnabled, markSectionEntered, playCue, scrollViewportVersion]);

  if (!hasValidProfileSlug) {
    return (
      <Navigate
        replace
        to={{
          pathname: getProfileHomePath(defaultProfileSlug),
          search: location.search,
          hash: location.hash,
        }}
      />
    );
  }

  return (
    <Layout profileSlug={profileSlug} portfolioData={portfolioData}>
      {isCanvasEnabled ? (
        <CanvasErrorBoundary onError={handleCanvasError}>
          <div className="fixed inset-0 z-0 bg-black">
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 75 }} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <SceneLights />
              {isPresent && (
                <ScrollControls pages={pages} damping={0.28} style={{ zIndex: "1", scrollBehavior: "auto" }}>
                  <ScrollViewportBridge onReady={setScrollViewport} />
                  <StoryScene heroAnchor={heroAnchor} heroIntroProgress={heroIntroProgress} sectionRanges={sectionRanges} />
                  <Scroll html style={{ width: "100%", position: "absolute", inset: 0, zIndex: 1 }}>
                    <HomeScrollContent
                      canvasMode
                      portfolioData={portfolioData}
                      containerRef={containerRef}
                      heroSectionRef={heroSectionRef}
                      heroPortraitRef={heroPortraitRef}
                      onProjectSelect={openProjectDetail}
                      onScrollToSection={scrollToSection}
                      restoredProjectId={restoredProjectId}
                      sectionIntroClassName={sectionIntroClassName}
                      motionViewportRoot={scrollViewportRef}
                      withClickSound={withClickSound}
                      withHoverSound={withHoverSound}
                    />
                  </Scroll>
                </ScrollControls>
              )}
            </Canvas>
          </div>
        </CanvasErrorBoundary>
      ) : (
        <div className="relative z-0 bg-black">
          <HomeScrollContent
            canvasMode={false}
            portfolioData={portfolioData}
            containerRef={containerRef}
            heroSectionRef={heroSectionRef}
            heroPortraitRef={heroPortraitRef}
            onProjectSelect={openProjectDetail}
            onScrollToSection={scrollToSection}
            restoredProjectId={restoredProjectId}
            sectionIntroClassName={sectionIntroClassName}
            withClickSound={withClickSound}
            withHoverSound={withHoverSound}
          />
        </div>
      )}
    </Layout>
  );
}
