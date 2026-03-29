/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink, Github, ChevronRight, CheckCircle2, AlertCircle, Layers, Workflow, Target, Zap } from "lucide-react";
import { portfolioData } from "../data/portfolioData";
import { SDEScene, DEScene, DSScene } from "../components/3d/ProjectScenes";
import { SceneLights, AmbientParticles } from "../components/3d/Common";
import { Layout, Footer } from "../components/Layout";
import { useEffect } from "react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = portfolioData.projects.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!project) navigate("/");
  }, [project, navigate]);

  if (!project) return null;

  const Scene = project.type === "AI" ? SDEScene : project.type === "DE" ? DEScene : DSScene;
  const accentColor = project.type === "AI" ? "#3b82f6" : project.type === "DE" ? "#f59e0b" : "#8b5cf6";
  const accentText = project.type === "AI" ? "text-blue-400" : project.type === "DE" ? "text-amber-400" : "text-purple-400";
  const accentBg = project.type === "AI" ? "bg-blue-500/10" : project.type === "DE" ? "bg-amber-500/10" : "bg-purple-500/10";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Layout>
        {/* Project Hero */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <SceneLights />
            <AmbientParticles count={1000} color={accentColor} />
            <Scene />
          </Canvas>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/#projects" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
              <ArrowLeft size={16} className="mr-2" /> Back to Projects
            </Link>
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-6 leading-none">
              {project.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className={`px-4 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest ${accentBg} ${accentText}`}>
                {project.type}
              </span>
              <span className="px-4 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest bg-white/5 text-gray-400">
                {project.domain}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview Grid */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Summary</h2>
            <p className="text-xl text-gray-300 leading-relaxed">{project.summary}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Role</h2>
            <p className="text-gray-400 font-medium">{project.role}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-500">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Content */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-32">
              {/* Context & Problem */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-emerald-400">
                    <AlertCircle size={24} />
                    <h3 className="text-2xl font-bold text-white">The Problem</h3>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed">{project.problem}</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-emerald-400">
                    <Target size={24} />
                    <h3 className="text-2xl font-bold text-white">The Context</h3>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed">{project.context}</p>
                </div>
              </div>

              {/* Architecture & Flow */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-emerald-400">
                    <Layers size={24} />
                    <h3 className="text-2xl font-bold text-white">Architecture Overview</h3>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed">{project.architecture}</p>
                  <div className="p-8 bg-zinc-900/50 border border-white/10 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">System Flow</h4>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      {project.flow.split(" -> ").map((step, i, arr) => (
                        <div key={step} className="flex items-center w-full md:w-auto">
                          <div className="flex-1 text-center p-4 bg-white/5 border border-white/5 rounded-xl text-sm font-medium text-gray-300">
                            {step}
                          </div>
                          {i < arr.length - 1 && (
                            <div className="hidden md:block mx-4 text-gray-600">
                              <ChevronRight size={20} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Details */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-emerald-400">
                    <Workflow size={24} />
                    <h3 className="text-2xl font-bold text-white">Implementation Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.implementation.map((detail, i) => (
                      <div key={i} className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl">
                        <p className="text-gray-400 text-sm leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outcomes & Impact */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-emerald-400">
                    <Zap size={24} />
                    <h3 className="text-2xl font-bold text-white">Outcomes & Impact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {project.outcomes.map((outcome, i) => (
                      <div key={i} className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                        <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-4" />
                        <p className="text-white font-medium">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Meta */}
            <div className="lg:col-span-4 space-y-12">
              <div className="sticky top-32 space-y-12">
                <div className="p-8 bg-zinc-900/50 border border-white/10 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">Goals</h4>
                  <ul className="space-y-4">
                    {project.goals.map((goal, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-start">
                        <span className="text-emerald-500 mr-3 mt-1">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 bg-zinc-900/50 border border-white/10 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">Challenges</h4>
                  <ul className="space-y-4">
                    {project.challenges.map((challenge, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-start">
                        <span className="text-red-400 mr-3 mt-1">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 bg-zinc-900/50 border border-white/10 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">Lessons Learned</h4>
                  <ul className="space-y-4">
                    {project.lessons.map((lesson, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-start">
                        <span className="text-blue-400 mr-3 mt-1">•</span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col space-y-4">
                  <button className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center">
                    <Github size={18} className="mr-2" /> View Source Code
                  </button>
                  <button className="w-full py-4 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/5 transition-all flex items-center justify-center">
                    <ExternalLink size={18} className="mr-2" /> Live Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Project CTA */}
      <section className="py-32 px-6 border-t border-white/5 bg-zinc-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 block">Next Case Study</span>
          <Link 
            to={`/project/${portfolioData.projects[(portfolioData.projects.findIndex(p => p.id === id) + 1) % portfolioData.projects.length].id}`}
            className="text-4xl md:text-6xl font-bold text-white hover:text-emerald-400 transition-colors tracking-tighter"
          >
            {portfolioData.projects[(portfolioData.projects.findIndex(p => p.id === id) + 1) % portfolioData.projects.length].title}
          </Link>
        </div>
      </section>
      <Footer />
    </Layout>
    </motion.div>
  );
}
