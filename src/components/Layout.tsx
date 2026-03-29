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

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
        <Link to="/" className="text-xl font-bold tracking-tighter text-white">
          {portfolioData.personal.name.split(" ")[0]}
          <span className="text-emerald-500">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-400",
                location.pathname === link.path ? "text-emerald-400" : "text-gray-400"
              )}
            >
              {link.name}
            </Link>
          ))}
          <a
            href={portfolioData.personal.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 hover:text-white transition-all"
          >
            Resume
          </a>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={portfolioData.personal.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-emerald-400"
              onClick={() => setIsOpen(false)}
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
    <footer className="bg-black border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-2">
            {portfolioData.personal.name}
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Building scalable systems and intelligent data platforms.
          </p>
        </div>

        <div className="flex space-x-6 text-gray-400">
          <a href={portfolioData.personal.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Github size={20} />
          </a>
          <a href={portfolioData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <Linkedin size={20} />
          </a>
          <a href={`mailto:${portfolioData.personal.email}`} className="hover:text-white transition-colors">
            <Mail size={20} />
          </a>
          <a href={portfolioData.personal.resume} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <FileText size={20} />
          </a>
        </div>

        <div className="text-gray-600 text-xs">
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
