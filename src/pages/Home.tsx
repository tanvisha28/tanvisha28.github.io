/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { ChevronDown, Mail, Linkedin, Github } from "lucide-react";
import { portfolioData } from "../data/portfolioData";
import { SceneLights } from "../components/3d/Common";
import { StoryScene } from "../components/3d/StoryScene";
import { Layout, Footer } from "../components/Layout";
import { SkillsGrid, ExperienceTimeline, ProjectTree } from "../components/HomeSections";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, useIsPresent } from "motion/react";

export default function Home() {
  const { hash } = useLocation();
  const isPresent = useIsPresent();
  const [pages, setPages] = useState(9);
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
        setPages(Math.max(9, totalHeight / vh));
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
                    <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-6 relative py-20">
                      <div className="pointer-events-auto text-center max-w-4xl mx-auto flex flex-col items-center">
                        <div className="w-40 h-40 md:w-56 md:h-56 mb-8 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_40px_rgba(52,211,153,0.15)] relative">
                          <img
                            src="/profile.jpg"
                            alt={portfolioData.personal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";
                            }}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-full" />
                        </div>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-6 block">
                          Engineering Portfolio
                        </span>
                        <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.9]">
                          {portfolioData.personal.name}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                          {portfolioData.personal.headline}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                          <span className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full flex items-center group">
                            Scroll to Explore <ChevronDown size={18} className="ml-2 animate-bounce" />
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* About */}
                    <section id="about" className="px-6 py-16 md:py-20">
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
                    <section id="skills" className="px-6 py-16 md:py-20">
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
                    <section id="projects" className="px-6 py-20 md:py-24">
                      <div className="pointer-events-auto max-w-7xl mx-auto">
                        <div className="mb-14 text-center">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 block">Case Studies</span>
                          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">Selected Work</h2>
                          <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
                            A connected case-study tree inspired by your reference, with each project linked one after another and far less empty space between the cards.
                          </p>
                        </div>
                        <ProjectTree projects={portfolioData.projects} />
                      </div>
                    </section>

                    {/* Experience */}
                    <section id="experience" className="px-6 py-16 md:py-20">
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
                    <section id="contact" className="min-h-[85vh] flex flex-col justify-between pt-24 md:pt-28 relative">
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
