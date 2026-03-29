/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Github, Linkedin, Mail, FileText, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { portfolioData } from "../data/portfolioData";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SoundToggle } from "./SoundToggle";
import { useSoundInteractions } from "../audio/useSoundInteractions";
import { getEmailComposeUrl } from "../utils/contact";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { withClickSound } = useSoundInteractions();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/#projects" },
    { name: "Experience", path: "/#experience" },
    { name: "Get in Touch", path: "/#contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-black border-b border-white/10",
        scrolled ? "py-4" : "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" onClick={withClickSound()} className="text-xl font-bold tracking-tighter text-white">
          {portfolioData.personal.name.split(" ")[0]}
          <span className="text-emerald-500">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={withClickSound()}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-400",
                location.pathname === link.path ? "text-emerald-400" : "text-gray-400"
              )}
            >
              {link.name}
            </Link>
          ))}
          <SoundToggle />
          <a
            href={portfolioData.personal.resume}
            target="_blank"
            rel="noopener noreferrer"
            onClick={withClickSound()}
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 hover:text-white transition-all"
          >
            Resume
          </a>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <SoundToggle className="px-3 py-2 text-[10px] tracking-[0.18em]" />
          <button className="text-white" onClick={withClickSound(() => setIsOpen((current) => !current))}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-black border-b border-white/10 py-8 px-6 flex flex-col space-y-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-lg font-medium text-gray-300"
                onClick={withClickSound(() => setIsOpen(false))}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={portfolioData.personal.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-emerald-400"
              onClick={withClickSound(() => setIsOpen(false))}
            >
              Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-white/8 bg-black/92 px-6 py-6 backdrop-blur-md md:py-5">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold tracking-tight text-white">
            {portfolioData.personal.name}
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-gray-500">
            Building scalable systems and intelligent data platforms.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-full border border-white/8 bg-white/[0.02] px-3 py-2 text-gray-400">
          <a
            href={portfolioData.personal.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 transition-colors hover:text-white"
          >
            <Github size={16} />
          </a>
          <a
            href={portfolioData.personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 transition-colors hover:text-white"
          >
            <Linkedin size={16} />
          </a>
          <a
            href={getEmailComposeUrl(portfolioData.personal.email)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 transition-colors hover:text-white"
          >
            <Mail size={16} />
          </a>
          <a
            href={portfolioData.personal.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 transition-colors hover:text-white"
          >
            <FileText size={16} />
          </a>
        </div>

        <div className="text-center text-[11px] font-medium tracking-[0.08em] text-gray-600 md:text-right">
          © {new Date().getFullYear()} {portfolioData.personal.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-white font-sans">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
