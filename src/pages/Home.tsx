/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { ChevronDown, Mail, Linkedin, Github, MapPin } from "lucide-react";
import { portfolioData } from "../data/portfolioData";
import { SceneLights } from "../components/3d/Common";
import { StoryScene } from "../components/3d/StoryScene";
import { Layout, Footer } from "../components/Layout";
import { SkillsGrid, ExperienceTimeline, ProjectTree } from "../components/HomeSections";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, useIsPresent } from "motion/react";

export default function Home() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const isPresent = useIsPresent();
  const [pages, setPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  useEffect(() => {
    const updatePages = () => {
      if (containerRef.current) {
        const totalHeight = containerRef.current.scrollHeight;
        const vh = window.innerHeight;
        setPages(Math.max(1, totalHeight / vh));
      }
    };

    updatePages();
    window.addEventListener("resize", updatePages);
    const timeout = setTimeout(updatePages, 500);

    return () => {
      window.removeEventListener("resize", updatePages);
      clearTimeout(timeout);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <Layout>
        <div className="fixed inset-0 z-0 bg-black">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <SceneLights />
            {isPresent && (
              <ScrollControls pages={pages} damping={0.2}>
                <StoryScene />
                <Scroll html style={{ width: "100%" }}>
                  <div ref={containerRef} className="flex w-full flex-col gap-0 pointer-events-none">
                    {/* Hero */}
                    <section id="hero" className="relative px-6 pt-28 pb-12 md:pt-32 md:pb-16">
                      <div className="pointer-events-auto mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl flex-col items-center justify-center text-center">
                        <div className="relative mb-8 flex flex-col items-center">
                          <div aria-hidden className="absolute inset-x-[-20%] top-10 h-28 rounded-full bg-emerald-500/10 blur-3xl" />
                          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                              Engineering Portfolio
                            </span>
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-300">
                              <MapPin size={12} className="mr-2 text-emerald-400" />
                              {portfolioData.personal.location}
                            </span>
                          </div>

                          <div className="relative">
                            <div aria-hidden className="absolute inset-[-16px] rounded-full border border-emerald-400/15" />
                            <div aria-hidden className="absolute inset-[-42px] rounded-full bg-emerald-500/10 blur-3xl" />
                            <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(52,211,153,0.15)] md:h-52 md:w-52">
                              <img
                                src="/profile.jpg"
                                alt={portfolioData.personal.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";
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
                        <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-400 md:text-xl">
                          {portfolioData.personal.headline}
                        </p>

                        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                          {portfolioData.personal.focusAreas.map((area) => (
                            <span
                              key={area}
                              className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-300 backdrop-blur-sm"
                            >
                              {area}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => scrollToSection("projects")}
                            className="rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-500 hover:text-white"
                          >
                            View Selected Work
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollToSection("contact")}
                            className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:border-emerald-400/40 hover:bg-white/10"
                          >
                            <Mail size={16} className="mr-2" /> Let&apos;s Talk
                          </button>
                        </div>

                        <div className="mt-10 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.28em] text-gray-500">
                          Scroll to Explore <ChevronDown size={16} className="ml-2 animate-bounce text-emerald-400" />
                        </div>
                      </div>
                    </section>

                    {/* About */}
                    <section id="about" className="px-6 py-14 md:py-18">
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
                            Building data systems that actually ship.
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
                    <section id="skills" className="px-6 py-14 md:py-18">
                      <div className="pointer-events-auto max-w-7xl mx-auto">
                        <div className="mb-12 text-center">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Capabilities</span>
                          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">Technical Arsenal</h2>
                          <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
                            Core capabilities across pipelines, AI systems, modeling, and cloud-native delivery, now presented with denser motion and stronger hierarchy inside the section.
                          </p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-md md:p-10">
                          <SkillsGrid skills={portfolioData.skills} />
                        </div>
                      </div>
                    </section>

                    {/* Projects */}
                    <section id="projects" className="px-6 py-16 md:py-20">
                      <div className="pointer-events-auto max-w-7xl mx-auto">
                        <div className="mb-14 text-center">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Case Studies</span>
                          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">Selected Work</h2>
                          <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
                            A connected case-study tree inspired by your reference, with each project linked one after another and far less empty space between the cards.
                          </p>
                        </div>
                        <ProjectTree projects={portfolioData.projects} onProjectSelect={(projectId) => navigate(`/project/${projectId}`)} />
                      </div>
                    </section>

                    {/* Experience */}
                    <section id="experience" className="px-6 py-14 md:py-18">
                      <div className="pointer-events-auto w-full max-w-7xl mx-auto">
                        <div className="mb-12 text-center">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Journey</span>
                          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Experience</h2>
                        </div>
                        <div className="px-2 md:px-4">
                          <ExperienceTimeline experiences={portfolioData.experience} />
                        </div>
                      </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="min-h-[80vh] flex flex-col justify-between pt-20 md:pt-24 relative">
                      <div className="pointer-events-auto max-w-4xl mx-auto text-center px-6 relative z-10 flex-1 flex flex-col justify-center">
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 block">Get in Touch</span>
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-12">Let&apos;s build the future.</h2>
                        <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
                          Currently open to senior engineering roles, data leadership opportunities, and high-impact collaborations.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6">
                          <a
                            href={`mailto:${portfolioData.personal.email}`}
                            className="px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 hover:text-white transition-all flex items-center"
                          >
                            <Mail size={20} className="mr-3" /> Send an Email
                          </a>
                          <div className="flex space-x-4">
                            <a href={portfolioData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="p-5 border border-white/10 rounded-full hover:bg-white/5 transition-all text-white">
                              <Linkedin size={24} />
                            </a>
                            <a href={portfolioData.personal.github} target="_blank" rel="noopener noreferrer" className="p-5 border border-white/10 rounded-full hover:bg-white/5 transition-all text-white">
                              <Github size={24} />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="pointer-events-auto w-full">
                        <Footer />
                      </div>
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
