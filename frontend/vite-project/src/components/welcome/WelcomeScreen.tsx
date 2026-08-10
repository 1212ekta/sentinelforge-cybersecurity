'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const heroRef = useRef<HTMLDivElement | null>(null);

  // 3D Mouse Parallax & Tilt state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (e.clientX - centerX) / (rect.width / 2); // -1 to 1
    const mouseY = (e.clientY - centerY) / (rect.height / 2); // -1 to 1

    // Subtle 1 to 2.5 degree tilt
    const maxDegrees = 2.5;
    const maxShift = 8;

    setTilt({
      rotateY: mouseX * maxDegrees,
      rotateX: -mouseY * maxDegrees,
      translateX: mouseX * maxShift,
      translateY: mouseY * maxShift,
    });
  }, [prefersReducedMotion]);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
  };

  return (
    <div className="min-h-screen w-full bg-[#07111F] text-slate-100 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto selection:bg-cyan-500/20 selection:text-cyan-200 relative">
      {/* Subtle Depth Background Grid & Radial Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(14,165,233,0.08),rgba(7,17,31,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-30" />

      {/* Top Header Bar with Clean Brand Mark */}
      <header className="relative z-10 flex items-center justify-between max-w-7xl w-full mx-auto pb-6 shrink-0 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <img
            src="/sentinelforge-icon.png"
            alt="SentinelForge Shield Logo"
            className="h-8 w-8 object-contain rounded-lg shrink-0"
          />
          <span className="font-extrabold text-white text-base tracking-tight font-mono">
            SentinelForge
          </span>
        </div>
      </header>

      {/* Main Spacious Hero Composition */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center max-w-7xl w-full mx-auto my-auto py-8 sm:py-12">
        
        {/* Left Column (~45% width) - Primary Information Hierarchy */}
        <div className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
          {/* Small Product Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/50 border border-cyan-500/25 text-cyan-400 text-[11px] font-mono font-bold tracking-widest uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SENTINELFORGE</span>
          </div>

          {/* Primary Welcome Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Welcome to <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              SentinelForge
            </span>
          </h1>

          {/* Clear Supporting Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-normal">
            Your AI-powered cybersecurity workspace for analyzing code, investigating logs, detecting vulnerabilities, and understanding security risks.
          </p>

          {/* Primary Action Button & Supporting Metadata */}
          <div className="flex flex-col items-start gap-3 mt-2">
            <button
              onClick={onStart}
              aria-label="Start Here to open SentinelForge cybersecurity workspace"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-xl shadow-cyan-950/60 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
            >
              <span>Start Here</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <span className="text-xs text-slate-400 font-mono tracking-wide pl-1">
              Secure. Analyze. Understand.
            </span>

            <span className="text-[11px] text-slate-400/90 font-sans pl-1">
              Guest mode — your chats are saved for this browser.
            </span>
          </div>
        </div>

        {/* Right Column (~55% width) - Clean Hero Visual */}
        <div className="lg:col-span-7 flex justify-center items-center w-full relative">
          <div
            ref={heroRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-xl p-2 cursor-pointer select-none perspective-[1000px]"
          >
            {/* Clean 3D Hero Wrapper without Overlaid Placeholders */}
            <div
              style={{
                transform: prefersReducedMotion
                  ? 'none'
                  : `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translate3d(${tilt.translateX}px, ${tilt.translateY}px, 0px)`,
                transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-2 shadow-2xl backdrop-blur-xs transition-colors duration-300 hover:border-cyan-500/30"
            >
              <img
                src="/sentinelforge-hero.png"
                alt="SentinelForge AI-powered cybersecurity workspace hero"
                className="w-full h-auto max-h-[440px] object-contain rounded-xl block relative z-10"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto pt-6 shrink-0 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>Enterprise AI Security Audit Platform</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">v1.0.0</span>
      </footer>
    </div>
  );
}
