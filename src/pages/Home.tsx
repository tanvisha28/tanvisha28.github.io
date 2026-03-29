/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";
import { ChevronDown, Mail, Linkedin, Github, MapPin, FileText } from "lucide-react";
import { portfolioData } from "../data/portfolioData";
import { SceneLights } from "../components/3d/Common";
import { StoryScene } from "../components/3d/StoryScene";
import { Layout, Footer } from "../components/Layout";
import { SkillsGrid, ExperienceTimeline, ProjectTree } from "../components/HomeSections";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useIsPresent, useMotionValue } from "motion/react";

const HOME_SCROLL_SECTION_ORDER = ["hero", "about", "skills", "projects", "experience", "contact", "footer"] as const;
type HomeScrollSectionName = (typeof HOME_SCROLL_SECTION_ORDER)[number];
const HOME_SCROLL_SECTION_SELECTOR = ":scope > [data-home-scroll-section]";

function getHomeScrollSections(element: HTMLElement) {
  return Array.from(element.querySelectorAll<HTMLElement>(HOME_SCROLL_SECTION_SELECTOR));
}

function getHomeScrollSectionNames(element: HTMLElement) {
  return getHomeScrollSections(element)
    .map((section) => section.dataset.homeScrollSection)
    .filter((section): section is HomeScrollSectionName => HOME_SCROLL_SECTION_ORDER.includes(section as HomeScrollSectionName));
}

function ScrollViewportBridge({
  onReady,
}: {
  onReady: (element: HTMLDivElement) => void;
}) {
  const data = useScroll();

  useEffect(() => {
    onReady(data.el);
  }, [data.el, onReady]);

  return null;
}

export default function Home() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const isPresent = useIsPresent();
  const [pages, setPages] = useState(9);
  const [scrollViewportVersion, setScrollViewportVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroPortraitRef = useRef<HTMLDivElement>(null);
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

  const setScrollViewport = (element: HTMLDivElement) => {
    if (scrollViewportRef.current !== element) {
      scrollViewportRef.current = element;
      setScrollViewportVersion((value) => value + 1);
    }
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    const updatePages = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const sections = getHomeScrollSections(element);
        const measuredHeight = sections.reduce((total, section) => {
          if (!(section instanceof HTMLElement)) return total;
          return total + section.offsetHeight;
        }, 0);
        const totalHeight = Math.max(measuredHeight, element.scrollHeight);
        const vh = window.innerHeight || 1;
        setPages(Math.max(9, totalHeight / vh));
      });
    };

    updatePages();
    const observer = new ResizeObserver(updatePages);
    observer.observe(element);
    getHomeScrollSections(element).forEach((section) => {
      observer.observe(section);
    });
    window.addEventListener("resize", updatePages);
    const timeout = window.setTimeout(updatePages, 350);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updatePages);
      window.clearTimeout(timeout);
    };
  }, []);

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

  const scrollToSection = (sectionId: string, behavior: ScrollBehavior = "smooth") => {
    const element = document.getElementById(sectionId);
    const scrollViewport = scrollViewportRef.current;
    if (!element || !scrollViewport) return;

    const maxScroll = scrollViewport.scrollHeight - scrollViewport.clientHeight;
    const targetTop = Math.min(element.offsetTop, maxScroll);
    scrollViewport.scrollTo({
      top: Math.max(0, targetTop),
      behavior,
    });
  };

  const sectionIntroClassName =
    "relative mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-black/[0.45] px-6 py-8 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-10 md:py-10";

  useEffect(() => {
    const sectionId = hash.replace("#", "");
    if (!sectionId || !scrollViewportRef.current) return;

    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection(sectionId, "auto");
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [hash, scrollViewportVersion]);

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <Layout>
        <div className="fixed inset-0 z-0 bg-black">
          <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 75 }}>
            <SceneLights />
            {isPresent && (
              <ScrollControls pages={pages} damping={0.28}>
                <ScrollViewportBridge onReady={setScrollViewport} />
                <StoryScene heroAnchor={heroAnchor} heroIntroProgress={heroIntroProgress} />
                <Scroll html style={{ width: "100%" }}>
                  <div ref={containerRef} className="flex w-full flex-col gap-0 pointer-events-none">
                    {/* Hero */}
                    <section
                      ref={heroSectionRef}
                      id="hero"
                      data-home-scroll-section="hero"
                      className="relative px-6 pt-28 pb-12 md:pt-32 md:pb-16"
                    >
                      <div className="pointer-events-auto mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl flex-col items-center justify-center text-center">
                        <div className="relative mb-8 flex flex-col items-center">
                          <div aria-hidden className="absolute inset-x-[-20%] top-10 h-28 rounded-full bg-emerald-500/10 blur-3xl" />
                          <div ref={heroPortraitRef} className="relative">
                            <div aria-hidden className="absolute inset-[-16px] rounded-full border border-emerald-400/15" />
                            <div aria-hidden className="absolute inset-[-26px] rounded-full border border-emerald-300/10" />
                            <div aria-hidden className="absolute inset-[-42px] rounded-full bg-emerald-500/10 blur-3xl" />
                            <div aria-hidden className="absolute inset-[-56px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.14),transparent_70%)] blur-[72px]" />
                            <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(52,211,153,0.15)] md:h-52 md:w-52">
                              <img
                                src="/profile.jpg"
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
                            onClick={() => scrollToSection("projects")}
                            className="rounded-full bg-white px-6 py-3 text-[13px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-emerald-500 hover:text-white md:px-7 md:py-3.5 md:text-sm md:tracking-widest"
                          >
                            View Selected Work
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollToSection("contact")}
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
                      <div className="pointer-events-auto max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <motion.div
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.45 }}
                          className="rounded-3xl border border-white/10 bg-black/40 p-8 md:p-10 backdrop-blur-md"
                        >
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">
                            About Me
                          </span>
                          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
                            Engineering systems that turn raw signals into decisions.
                          </h2>
                          <div className="space-y-5 text-base md:text-lg text-gray-400 leading-relaxed">
                            {portfolioData.personal.about.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                          <div className="mt-8 flex flex-wrap gap-3">
                            {portfolioData.personal.focusAreas.map((area) => (
                              <span
                                key={area}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-300"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </motion.div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {portfolioData.metrics.map((metric, idx) => (
                            <motion.div
                              key={metric.label}
                              initial={{ opacity: 0, y: 18 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.4 }}
                              transition={{ duration: 0.35, delay: idx * 0.08 }}
                              className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-md"
                            >
                              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{metric.value}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{metric.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Skills */}
                    <section id="skills" data-home-scroll-section="skills" className="px-6 py-16 md:py-20">
                      <div className="pointer-events-auto max-w-7xl mx-auto">
                        <div className={`mb-10 max-w-5xl ${sectionIntroClassName}`}>
                          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_58%)]" />
                          <div className="relative text-center">
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Capabilities</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-4">
                              Built for production, not just prototypes.
                            </h2>
                            <p className="max-w-3xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                              Experience across data platforms, agentic workflows, applied machine learning, and cloud delivery,
                              with an emphasis on reliability, observability, and measurable product impact.
                            </p>
                          </div>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-[0_0_60px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-10">
                          <SkillsGrid skills={portfolioData.skills} />
                        </div>
                      </div>
                    </section>

                    {/* Projects */}
                    <section id="projects" data-home-scroll-section="projects" className="px-6 py-20 md:py-24">
                      <div className="pointer-events-auto max-w-7xl mx-auto">
                        <div className={`mb-14 max-w-5xl ${sectionIntroClassName}`}>
                          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_56%)]" />
                          <div className="relative text-center">
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Case Studies</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-5">Selected Work</h2>
                            <p className="max-w-4xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                              A cross-section of systems work spanning AI automation, modern data platforms, and real-time intelligence.
                              Each case study is framed around the problem, the architecture, and the outcome it delivered.
                            </p>
                          </div>
                        </div>
                        <ProjectTree projects={portfolioData.projects} onProjectSelect={(projectId) => navigate(`/project/${projectId}`)} />
                      </div>
                    </section>

                    {/* Experience */}
                    <section id="experience" data-home-scroll-section="experience" className="px-6 py-16 md:py-20">
                      <div className="pointer-events-auto w-full max-w-7xl mx-auto">
                        <div className={`mb-12 max-w-4xl ${sectionIntroClassName}`}>
                          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_58%)]" />
                          <div className="relative text-center">
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Journey</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-4">
                              Experience shaped by shipped systems.
                            </h2>
                            <p className="max-w-3xl mx-auto text-gray-300 text-base leading-relaxed md:text-lg">
                              Roles centered on turning ambiguous business needs into durable data and AI products, with the delivery
                              discipline needed to make them stick in production.
                            </p>
                          </div>
                        </div>
                        <div className="px-2 md:px-4">
                          <ExperienceTimeline experiences={portfolioData.experience} />
                        </div>
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
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/[0.58] px-6 py-8 shadow-[0_0_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:px-10 md:py-10">
                          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_56%)]" />
                          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                            <div className="text-center lg:text-left">
                              <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-400">
                                Get in Touch
                              </span>
                              <h2 className="mb-4 text-3xl font-bold tracking-tighter text-white md:text-5xl">
                                Let&apos;s talk about the next system worth shipping.
                              </h2>
                              <p className="max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
                                Open to senior data engineering, AI systems, and platform roles where strong architecture,
                                reliable execution, and measurable product outcomes all matter.
                              </p>

                              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-300">
                                  Senior IC Roles
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-300">
                                  Data + AI Platforms
                                </span>
                                <span className="rounded-full border border-emerald-400/18 bg-emerald-400/[0.04] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                                  {portfolioData.personal.location}
                                </span>
                              </div>

                              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                                <a
                                  href={`mailto:${portfolioData.personal.email}`}
                                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-500 hover:text-white"
                                >
                                  <Mail size={16} className="mr-2" /> Email Me
                                </a>
                                <a
                                  href={portfolioData.personal.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:border-emerald-400/35 hover:bg-white/[0.08]"
                                >
                                  <FileText size={16} className="mr-2" /> View Resume
                                </a>
                              </div>
                            </div>

                            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-6">
                              <div className="mb-5 border-b border-white/8 pb-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                                  Best Way To Reach Me
                                </p>
                                <a
                                  href={`mailto:${portfolioData.personal.email}`}
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

                    <section aria-label="Footer" data-home-scroll-section="footer" className="pointer-events-auto relative z-10 w-full">
                      <Footer />
                    </section>
                  </div>
                </Scroll>
              </ScrollControls>
            )}
          </Canvas>
        </div>
      </Layout>
    </motion.div>
  );
}
